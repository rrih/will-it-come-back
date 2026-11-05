// Records a composed canvas (picture + counter + caption) with MediaRecorder.

export type Shape = "youtube" | "shorts";

export interface Overlay {
  title: string; // top caption
  counter: string; // big line under the picture
  sub: string; // small line
  flash: number; // 0..1 highlight when home
}

export const SITE_LABEL = "will-it-come-back.ro1.workers.dev";

export function pickMime(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  const list = [
    "video/mp4;codecs=avc1.42E01E",
    "video/mp4;codecs=avc1",
    "video/mp4",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  for (const m of list) if (MediaRecorder.isTypeSupported(m)) return m;
  return null;
}

export class Recorder {
  readonly canvas = document.createElement("canvas");
  private g: CanvasRenderingContext2D;
  private rec: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private raf = 0;
  overlay: Overlay = { title: "", counter: "", sub: "", flash: 0 };
  mime = "";

  constructor(
    private source: HTMLCanvasElement,
    readonly shape: Shape,
  ) {
    this.canvas.width = shape === "youtube" ? 1920 : 1080;
    this.canvas.height = shape === "youtube" ? 1080 : 1920;
    this.g = this.canvas.getContext("2d", { alpha: false })!;
  }

  start(): boolean {
    const mime = pickMime();
    if (!mime) return false;
    this.mime = mime;
    const stream = this.canvas.captureStream(60);
    this.rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 16_000_000 });
    this.chunks = [];
    this.rec.ondataavailable = (e) => e.data.size && this.chunks.push(e.data);
    const loop = () => {
      this.paint();
      this.raf = requestAnimationFrame(loop);
    };
    loop();
    this.rec.start(250);
    return true;
  }

  stop(): Promise<Blob> {
    return new Promise((resolve) => {
      const rec = this.rec!;
      rec.onstop = () => {
        cancelAnimationFrame(this.raf);
        resolve(new Blob(this.chunks, { type: this.mime.split(";")[0] }));
      };
      this.paint();
      setTimeout(() => rec.stop(), 120);
    });
  }

  paint() {
    const { g, canvas } = this;
    const W = canvas.width;
    const H = canvas.height;
    const F = `Inter, system-ui, -apple-system, "Segoe UI", "Hiragino Sans", "Noto Sans", sans-serif`;
    const bg = g.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#0b0b12");
    bg.addColorStop(1, "#05050a");
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    const accent = "#a5b4fc";
    const home = "#34d399";
    const flash = this.overlay.flash;
    g.textBaseline = "alphabetic";
    if (this.shape === "youtube") {
      // picture on the left, text column on the right
      const pic = 940;
      const px = 90;
      const py = (H - pic) / 2;
      this.drawPic(px, py, pic, flash, home);
      const x = px + pic + 90;
      const w = W - x - 90;
      g.textAlign = "left";
      g.fillStyle = "rgba(255,255,255,0.6)";
      g.font = `600 40px ${F}`;
      g.fillText(this.overlay.title, x, 420, w);
      g.fillStyle = flash > 0 ? home : "#ffffff";
      g.font = `800 112px ${F}`;
      g.fillText(this.overlay.counter, x, 570, w);
      g.fillStyle = accent;
      g.font = `600 40px ${F}`;
      g.fillText(this.overlay.sub, x, 650, w);
      g.fillStyle = "rgba(255,255,255,0.4)";
      g.font = `500 28px ${F}`;
      g.fillText(SITE_LABEL, x, H - 110, w);
    } else {
      const pic = 960;
      const px = (W - pic) / 2;
      const py = 440;
      g.textAlign = "center";
      g.fillStyle = "#ffffff";
      g.font = `800 76px ${F}`;
      g.fillText(this.overlay.title, W / 2, 320, W - 100);
      this.drawPic(px, py, pic, flash, home);
      g.fillStyle = flash > 0 ? home : "#ffffff";
      g.font = `800 112px ${F}`;
      g.fillText(this.overlay.counter, W / 2, py + pic + 170, W - 100);
      g.fillStyle = accent;
      g.font = `600 46px ${F}`;
      g.fillText(this.overlay.sub, W / 2, py + pic + 250, W - 100);
      g.fillStyle = "rgba(255,255,255,0.4)";
      g.font = `500 36px ${F}`;
      g.fillText(SITE_LABEL, W / 2, H - 140);
    }
  }

  private drawPic(x: number, y: number, s: number, flash: number, color: string) {
    const g = this.g;
    const r = 36;
    g.save();
    g.beginPath();
    g.roundRect(x, y, s, s, r);
    g.clip();
    g.imageSmoothingEnabled = false;
    g.drawImage(this.source, x, y, s, s);
    g.restore();
    g.lineWidth = flash > 0 ? 10 : 2;
    g.strokeStyle = flash > 0 ? color : "rgba(255,255,255,0.12)";
    g.beginPath();
    g.roundRect(x, y, s, s, r);
    g.stroke();
  }
}

export function download(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
