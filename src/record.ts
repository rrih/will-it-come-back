// Records a composed canvas (picture + counter + caption) with MediaRecorder.

export type Shape = "square" | "vertical";

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
    this.canvas.width = 1080;
    this.canvas.height = shape === "square" ? 1080 : 1920;
    this.g = this.canvas.getContext("2d", { alpha: false })!;
  }

  start(): boolean {
    const mime = pickMime();
    if (!mime) return false;
    this.mime = mime;
    const stream = this.canvas.captureStream(60);
    this.rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 12_000_000 });
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
    g.fillStyle = "#07070c";
    g.fillRect(0, 0, W, H);
    const vertical = this.shape === "vertical";
    const pic = vertical ? 1000 : 820;
    const px = (W - pic) / 2;
    const py = vertical ? 420 : 120;
    // caption
    g.textAlign = "center";
    g.textBaseline = "alphabetic";
    g.fillStyle = "#ffffff";
    g.font = `800 ${vertical ? 76 : 54}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    if (this.overlay.title) g.fillText(this.overlay.title, W / 2, vertical ? 300 : 88, W - 80);
    // picture
    g.imageSmoothingEnabled = false;
    g.drawImage(this.source, px, py, pic, pic);
    if (this.overlay.flash > 0) {
      g.strokeStyle = `rgba(250,204,21,${this.overlay.flash})`;
      g.lineWidth = 10;
      g.strokeRect(px - 8, py - 8, pic + 16, pic + 16);
    }
    // counter
    const cy = py + pic + (vertical ? 150 : 0);
    if (vertical) {
      g.fillStyle = "#facc15";
      g.font = `900 110px system-ui, -apple-system, "Segoe UI", sans-serif`;
      g.fillText(this.overlay.counter, W / 2, cy, W - 80);
      g.fillStyle = "rgba(255,255,255,0.75)";
      g.font = `600 48px system-ui, -apple-system, "Segoe UI", sans-serif`;
      g.fillText(this.overlay.sub, W / 2, cy + 80, W - 80);
    } else {
      g.fillStyle = "#facc15";
      g.font = `900 56px system-ui, -apple-system, "Segoe UI", sans-serif`;
      g.textAlign = "left";
      g.fillText(this.overlay.counter, px, py + pic + 76, pic * 0.6);
      g.textAlign = "right";
      g.fillStyle = "rgba(255,255,255,0.75)";
      g.font = `600 30px system-ui, -apple-system, "Segoe UI", sans-serif`;
      g.fillText(this.overlay.sub, px + pic, py + pic + 70, pic * 0.45);
      g.textAlign = "center";
    }
    g.fillStyle = "rgba(255,255,255,0.45)";
    g.font = `600 ${vertical ? 38 : 26}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    g.fillText(SITE_LABEL, W / 2, H - (vertical ? 120 : 26));
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
