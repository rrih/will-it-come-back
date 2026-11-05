import { arrangementAt, buildGather, decompose, fixSize, homeCount, type Cycles, type Kind } from "./perm";

const BG = 0xff0c0707; // ABGR for #07070c

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Draws an N×N picture whose pixels are permuted step by step. */
export class Stage {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  n = 0;
  kind: Kind = "zip";
  src: Uint32Array = new Uint32Array(0);
  private img!: ImageData;
  private out32: Uint32Array = new Uint32Array(0);
  P: Int32Array = new Int32Array(0);
  cycles!: Cycles;
  cur: Int32Array = new Int32Array(0);
  private next: Int32Array = new Int32Array(0);
  step = 0n;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false })!;
  }

  setup(kind: Kind, src: Uint32Array, n: number) {
    n = fixSize(kind, n);
    const sizeChanged = n !== this.n;
    this.kind = kind;
    this.n = n;
    this.src = src;
    if (sizeChanged || this.canvas.width !== n) {
      this.canvas.width = this.canvas.height = n;
      this.img = this.ctx.createImageData(n, n);
      this.out32 = new Uint32Array(this.img.data.buffer);
      this.cur = new Int32Array(n * n);
      this.next = new Int32Array(n * n);
    }
    this.P = buildGather(kind, n);
    this.cycles = decompose(this.P, n);
  }

  /** Replace the picture but keep the transform (n must match). */
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
    const { out32, src, cur } = this;
    for (let d = 0; d < cur.length; d++) out32[d] = src[cur[d]];
    this.ctx.putImageData(this.img, 0, 0);
  }

  /** Prepare a one-step move (dir = +1 or -1); then call frame(t) for t in [0,1]. */
  begin(dir: 1 | -1) {
    arrangementAt(this.cycles, this.step + BigInt(dir), this.next);
    this.dir = dir;
  }
  private dir: 1 | -1 = 1;

  frame(t: number) {
    const { out32, src, P, n } = this;
    const e = easeInOut(Math.min(1, Math.max(0, t)));
    out32.fill(BG);
    const N = n * n;
    if (this.dir === 1) {
      // pixel at d (after the step) flies from P[d]
      const next = this.next;
      for (let d = 0; d < N; d++) {
        const f = P[d];
        const fx = f % n;
        const fy = (f - fx) / n;
        const tx = d % n;
        const ty = (d - tx) / n;
        const x = (fx + (tx - fx) * e + 0.5) | 0;
        const y = (fy + (ty - fy) * e + 0.5) | 0;
        out32[y * n + x] = src[next[d]];
      }
    } else {
      // pixel at d (before the step) flies back to P[d]
      const cur = this.cur;
      for (let d = 0; d < N; d++) {
        const f = P[d];
        const tx = f % n;
        const ty = (f - tx) / n;
        const fx = d % n;
        const fy = (d - fx) / n;
        const x = (fx + (tx - fx) * e + 0.5) | 0;
        const y = (fy + (ty - fy) * e + 0.5) | 0;
        out32[y * n + x] = src[cur[d]];
      }
    }
    this.ctx.putImageData(this.img, 0, 0);
  }

  commit() {
    this.step += BigInt(this.dir);
    const t = this.cur;
    this.cur = this.next;
    this.next = t;
    this.draw();
  }

  /** Current picture as packed pixels (for PNG export). */
  snapshot(): Uint32Array {
    return this.out32.slice();
  }
}

/** Same pixels moving into another picture. */
export class MorphStage {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  n = 0;
  src: Uint32Array = new Uint32Array(0);
  dest: Int32Array = new Int32Array(0);
  private img!: ImageData;
  private out32: Uint32Array = new Uint32Array(0);
  private delay: Float32Array = new Float32Array(0);
  private lift: Float32Array = new Float32Array(0);
  t = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false })!;
  }

  setup(src: Uint32Array, dest: Int32Array, n: number) {
    this.n = n;
    this.src = src;
    this.dest = dest;
    this.canvas.width = this.canvas.height = n;
    this.img = this.ctx.createImageData(n, n);
    this.out32 = new Uint32Array(this.img.data.buffer);
    const N = n * n;
    this.delay = new Float32Array(N);
    this.lift = new Float32Array(N);
    let s = 987654321;
    for (let o = 0; o < N; o++) {
      s = (s * 1664525 + 1013904223) >>> 0;
      const r = s / 4294967296;
      const ty = Math.floor(dest[o] / n) / n;
      // pixels leave in a wave from the top of the target, with a bit of jitter
      this.delay[o] = ty * 0.35 + r * 0.15;
      this.lift[o] = (r - 0.5) * 0.5;
    }
  }

  frame(t: number) {
    this.t = t;
    const { out32, src, dest, n, delay, lift } = this;
    out32.fill(BG);
    const N = n * n;
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
      // a slight sideways arc so crossing streams don't look like a straight blur
      const arc = Math.sin(Math.PI * e) * lift[o];
      let x = (fx + dx * e - dy * arc + 0.5) | 0;
      let y = (fy + dy * e + dx * arc + 0.5) | 0;
      if (x < 0) x = 0;
      else if (x >= n) x = n - 1;
      if (y < 0) y = 0;
      else if (y >= n) y = n - 1;
      out32[y * n + x] = src[o];
    }
    // at the very end draw exactly (no holes)
    if (t >= 1) for (let o = 0; o < N; o++) out32[dest[o]] = src[o];
    if (t <= 0) out32.set(src);
    this.ctx.putImageData(this.img, 0, 0);
  }
}
