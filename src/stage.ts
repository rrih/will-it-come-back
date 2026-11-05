import { arrangementAt, buildGather, decompose, fixSize, homeCount, type Cycles, type Kind } from "./perm";

const BG = 0xff080505; // ABGR for #050508

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
// a soft overshoot so pixels "land" instead of stopping dead
const easeOutBack = (t: number) => {
  const c1 = 1.2;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/** Display scale: draw each picture pixel as an s×s block so motion is sub-pixel smooth. */
function scaleFor(n: number): number {
  const dpr = Math.min(2, globalThis.devicePixelRatio || 1);
  const target = Math.min(1100, Math.round(560 * dpr));
  return Math.max(1, Math.min(8, Math.floor(target / n)));
}

/**
 * Renders N×N picture pixels onto a larger display canvas. Static frames are
 * drawn at N×N and scaled up; moving frames splat s×s blocks at fractional
 * positions so the motion is smooth even for small pictures.
 */
class Painter {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  readonly base = document.createElement("canvas"); // exact N×N pixels
  private bctx = this.base.getContext("2d", { alpha: false })!;
  private bimg!: ImageData;
  base32: Uint32Array = new Uint32Array(0);
  private dimg!: ImageData;
  disp32: Uint32Array = new Uint32Array(0);
  n = 0;
  s = 1;
  W = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false })!;
  }

  resize(n: number) {
    const s = scaleFor(n);
    if (n === this.n && s === this.s && this.base32.length) return;
    this.n = n;
    this.s = s;
    this.W = n * s;
    this.canvas.width = this.canvas.height = this.W;
    this.base.width = this.base.height = n;
    this.bimg = this.bctx.createImageData(n, n);
    this.base32 = new Uint32Array(this.bimg.data.buffer);
    this.dimg = this.ctx.createImageData(this.W, this.W);
    this.disp32 = new Uint32Array(this.dimg.data.buffer);
  }

  /** Show base32 (already filled) scaled up with crisp pixels. */
  flushBase() {
    this.bctx.putImageData(this.bimg, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(this.base, 0, 0, this.W, this.W);
  }

  clear() {
    this.disp32.fill(BG);
  }

  /** Put one picture pixel at fractional picture coords (x, y). */
  splat(x: number, y: number, color: number) {
    const { s, W, disp32 } = this;
    let px = Math.round(x * s);
    let py = Math.round(y * s);
    if (px < 0) px = 0;
    else if (px > W - s) px = W - s;
    if (py < 0) py = 0;
    else if (py > W - s) py = W - s;
    if (s === 1) {
      disp32[py * W + px] = color;
      return;
    }
    for (let j = 0; j < s; j++) {
      const row = (py + j) * W + px;
      for (let i = 0; i < s; i++) disp32[row + i] = color;
    }
  }

  flushDisp() {
    this.ctx.putImageData(this.dimg, 0, 0);
  }
}

/** Draws an N×N picture whose pixels are permuted step by step. */
export class Stage {
  private p: Painter;
  n = 0;
  kind: Kind = "zip";
  src: Uint32Array = new Uint32Array(0);
  P: Int32Array = new Int32Array(0);
  cycles!: Cycles;
  cur: Int32Array = new Int32Array(0);
  private next: Int32Array = new Int32Array(0);
  private delay: Float32Array = new Float32Array(0);
  step = 0n;
  private dir: 1 | -1 = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.p = new Painter(canvas);
  }

  get canvas() {
    return this.p.canvas;
  }

  /** Exact N×N pixels (for PNG export). */
  get exact() {
    return this.p.base;
  }

  setup(kind: Kind, src: Uint32Array, n: number) {
    n = fixSize(kind, n);
    if (n !== this.n || this.cur.length !== n * n) {
      this.cur = new Int32Array(n * n);
      this.next = new Int32Array(n * n);
      this.delay = new Float32Array(n * n);
    }
    this.kind = kind;
    this.n = n;
    this.src = src;
    this.p.resize(n);
    this.P = buildGather(kind, n);
    this.cycles = decompose(this.P, n);
    // a diagonal wave: pixels nearer the top-left start first
    let seed = 7;
    for (let d = 0; d < n * n; d++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const x = d % n;
      const y = (d - x) / n;
      this.delay[d] = ((x + y) / (2 * n)) * 0.32 + (seed / 4294967296) * 0.06;
    }
  }

  setPixels(src: Uint32Array) {
    this.src = src;
    this.draw();
  }

  get period(): bigint {
    return this.cycles.period;
  }

  get home(): number {
    return homeCount(this.cycles, this.step);
  }

  goTo(k: bigint) {
    this.step = k;
    arrangementAt(this.cycles, k, this.cur);
    this.draw();
  }

  draw() {
    const { src, cur } = this;
    const out = this.p.base32;
    for (let d = 0; d < cur.length; d++) out[d] = src[cur[d]];
    this.p.flushBase();
  }

  begin(dir: 1 | -1) {
    arrangementAt(this.cycles, this.step + BigInt(dir), this.next);
    this.dir = dir;
  }

  frame(t: number) {
    const { src, P, n, delay, p } = this;
    p.clear();
    const N = n * n;
    const span = 1 - 0.38;
    if (this.dir === 1) {
      const next = this.next;
      for (let d = 0; d < N; d++) {
        let u = (t - delay[d]) / span;
        u = u < 0 ? 0 : u > 1 ? 1 : u;
        const e = u < 1 ? easeOutBack(easeInOut(u) * 0.35 + u * 0.65) : 1;
        const f = P[d];
        const fx = f % n;
        const fy = (f - fx) / n;
        const tx = d % n;
        const ty = (d - tx) / n;
        p.splat(fx + (tx - fx) * e, fy + (ty - fy) * e, src[next[d]]);
      }
    } else {
      const cur = this.cur;
      for (let d = 0; d < N; d++) {
        const f = P[d];
        let u = (t - delay[f]) / span;
        u = u < 0 ? 0 : u > 1 ? 1 : u;
        const e = u < 1 ? easeOutBack(easeInOut(u) * 0.35 + u * 0.65) : 1;
        const tx = f % n;
        const ty = (f - tx) / n;
        const fx = d % n;
        const fy = (d - fx) / n;
        p.splat(fx + (tx - fx) * e, fy + (ty - fy) * e, src[cur[d]]);
      }
    }
    p.flushDisp();
  }

  commit() {
    this.step += BigInt(this.dir);
    const t = this.cur;
    this.cur = this.next;
    this.next = t;
    this.draw();
  }
}

/** Same pixels moving into another picture. */
export class MorphStage {
  private p: Painter;
  n = 0;
  src: Uint32Array = new Uint32Array(0);
  dest: Int32Array = new Int32Array(0);
  private delay: Float32Array = new Float32Array(0);
  private lift: Float32Array = new Float32Array(0);
  t = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.p = new Painter(canvas);
  }

  get canvas() {
    return this.p.canvas;
  }

  get exact() {
    return this.p.base;
  }

  setup(src: Uint32Array, dest: Int32Array, n: number) {
    this.n = n;
    this.src = src;
    this.dest = dest;
    this.p.resize(n);
    const N = n * n;
    this.delay = new Float32Array(N);
    this.lift = new Float32Array(N);
    let s = 987654321;
    for (let o = 0; o < N; o++) {
      s = (s * 1664525 + 1013904223) >>> 0;
      const r = s / 4294967296;
      const ty = Math.floor(dest[o] / n) / n;
      this.delay[o] = ty * 0.35 + r * 0.15;
      this.lift[o] = (r - 0.5) * 0.6;
    }
  }

  frame(t: number) {
    this.t = t;
    const { src, dest, n, delay, lift, p } = this;
    const N = n * n;
    if (t <= 0 || t >= 1) {
      const out = p.base32;
      if (t <= 0) out.set(src);
      else for (let o = 0; o < N; o++) out[dest[o]] = src[o];
      p.flushBase();
      return;
    }
    p.clear();
    for (let o = 0; o < N; o++) {
      let u = (t - delay[o]) / 0.5;
      u = u < 0 ? 0 : u > 1 ? 1 : u;
      const e = easeInOut(u);
      const d = dest[o];
      const fx = o % n;
      const fy = (o - fx) / n;
      const tx = d % n;
      const ty = (d - tx) / n;
      const dx = tx - fx;
      const dy = ty - fy;
      const arc = Math.sin(Math.PI * e) * lift[o];
      p.splat(fx + dx * e - dy * arc, fy + dy * e + dx * arc, src[o]);
    }
    p.flushDisp();
  }
}
