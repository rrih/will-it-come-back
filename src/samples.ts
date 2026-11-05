// Built-in pictures, drawn procedurally (no external images).

export type SampleId = "smiley" | "wink" | "cat" | "text";
export type TargetId = "frown" | "heart" | "star" | "text" | "smiley";

const S = 512;

function base(bg = "#07070c"): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, S, S);
  return [c, g];
}

function faceDisc(g: CanvasRenderingContext2D) {
  const grad = g.createRadialGradient(S * 0.42, S * 0.36, S * 0.05, S / 2, S / 2, S * 0.44);
  grad.addColorStop(0, "#fff27a");
  grad.addColorStop(0.7, "#ffd21f");
  grad.addColorStop(1, "#f59e0b");
  g.fillStyle = grad;
  g.beginPath();
  g.arc(S / 2, S / 2, S * 0.42, 0, Math.PI * 2);
  g.fill();
  g.lineWidth = S * 0.018;
  g.strokeStyle = "#b45309";
  g.stroke();
}

function eye(g: CanvasRenderingContext2D, x: number, y: number) {
  g.fillStyle = "#1f1300";
  g.beginPath();
  g.ellipse(x, y, S * 0.045, S * 0.075, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#fff";
  g.beginPath();
  g.arc(x + S * 0.014, y - S * 0.03, S * 0.014, 0, Math.PI * 2);
  g.fill();
}

function mouth(g: CanvasRenderingContext2D, smile: boolean) {
  g.strokeStyle = "#1f1300";
  g.lineWidth = S * 0.04;
  g.lineCap = "round";
  g.beginPath();
  if (smile) g.arc(S / 2, S * 0.52, S * 0.22, Math.PI * 0.18, Math.PI * 0.82);
  else g.arc(S / 2, S * 0.86, S * 0.22, Math.PI * 1.2, Math.PI * 1.8);
  g.stroke();
}

function cheeks(g: CanvasRenderingContext2D) {
  g.fillStyle = "rgba(244,63,94,0.35)";
  for (const x of [S * 0.27, S * 0.73]) {
    g.beginPath();
    g.ellipse(x, S * 0.6, S * 0.06, S * 0.035, 0, 0, Math.PI * 2);
    g.fill();
  }
}

function rainbowRing(g: CanvasRenderingContext2D) {
  const cols = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];
  cols.forEach((c, i) => {
    g.strokeStyle = c;
    g.lineWidth = S * 0.012;
    g.beginPath();
    g.arc(S / 2, S / 2, S * (0.455 + i * 0.012), 0, Math.PI * 2);
    g.stroke();
  });
}

export function drawSmiley(): HTMLCanvasElement {
  const [c, g] = base();
  rainbowRing(g);
  faceDisc(g);
  eye(g, S * 0.37, S * 0.4);
  eye(g, S * 0.63, S * 0.4);
  cheeks(g);
  mouth(g, true);
  return c;
}

export function drawWink(): HTMLCanvasElement {
  const [c, g] = base("#0b1020");
  faceDisc(g);
  eye(g, S * 0.37, S * 0.4);
  g.strokeStyle = "#1f1300";
  g.lineWidth = S * 0.035;
  g.lineCap = "round";
  g.beginPath();
  g.arc(S * 0.63, S * 0.43, S * 0.06, Math.PI * 1.1, Math.PI * 1.9);
  g.stroke();
  cheeks(g);
  mouth(g, true);
  g.fillStyle = "#ef4444";
  g.beginPath();
  g.ellipse(S * 0.56, S * 0.72, S * 0.05, S * 0.035, 0, 0, Math.PI * 2);
  g.fill();
  return c;
}

export function drawFrown(): HTMLCanvasElement {
  const [c, g] = base();
  rainbowRing(g);
  faceDisc(g);
  eye(g, S * 0.37, S * 0.42);
  eye(g, S * 0.63, S * 0.42);
  g.strokeStyle = "#1f1300";
  g.lineWidth = S * 0.03;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(S * 0.28, S * 0.28);
  g.lineTo(S * 0.42, S * 0.32);
  g.moveTo(S * 0.72, S * 0.28);
  g.lineTo(S * 0.58, S * 0.32);
  g.stroke();
  mouth(g, false);
  return c;
}

export function drawCat(): HTMLCanvasElement {
  const [c, g] = base("#101826");
  g.fillStyle = "#f4a259";
  g.beginPath();
  g.moveTo(S * 0.16, S * 0.12);
  g.lineTo(S * 0.42, S * 0.3);
  g.lineTo(S * 0.2, S * 0.45);
  g.closePath();
  g.moveTo(S * 0.84, S * 0.12);
  g.lineTo(S * 0.58, S * 0.3);
  g.lineTo(S * 0.8, S * 0.45);
  g.closePath();
  g.fill();
  g.beginPath();
  g.ellipse(S / 2, S * 0.56, S * 0.36, S * 0.32, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#fff4e6";
  g.beginPath();
  g.ellipse(S / 2, S * 0.7, S * 0.18, S * 0.14, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#3a5a40";
  for (const x of [S * 0.37, S * 0.63]) {
    g.beginPath();
    g.ellipse(x, S * 0.5, S * 0.05, S * 0.065, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "#111";
  for (const x of [S * 0.37, S * 0.63]) {
    g.beginPath();
    g.ellipse(x, S * 0.5, S * 0.015, S * 0.055, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "#e85d75";
  g.beginPath();
  g.moveTo(S * 0.47, S * 0.62);
  g.lineTo(S * 0.53, S * 0.62);
  g.lineTo(S * 0.5, S * 0.66);
  g.fill();
  g.strokeStyle = "#fff";
  g.lineWidth = S * 0.006;
  for (const sgn of [-1, 1]) {
    for (const dy of [-0.02, 0.02]) {
      g.beginPath();
      g.moveTo(S * (0.5 + sgn * 0.08), S * 0.67);
      g.lineTo(S * (0.5 + sgn * 0.3), S * (0.65 + dy * 2));
      g.stroke();
    }
  }
  return c;
}

export function drawHeart(): HTMLCanvasElement {
  const [c, g] = base();
  const grad = g.createLinearGradient(0, S * 0.2, 0, S * 0.85);
  grad.addColorStop(0, "#fb7185");
  grad.addColorStop(1, "#be123c");
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(S / 2, S * 0.86);
  g.bezierCurveTo(S * 0.02, S * 0.55, S * 0.12, S * 0.12, S / 2, S * 0.32);
  g.bezierCurveTo(S * 0.88, S * 0.12, S * 0.98, S * 0.55, S / 2, S * 0.86);
  g.fill();
  g.fillStyle = "rgba(255,255,255,0.55)";
  g.beginPath();
  g.ellipse(S * 0.32, S * 0.36, S * 0.06, S * 0.035, -0.7, 0, Math.PI * 2);
  g.fill();
  return c;
}

export function drawStar(): HTMLCanvasElement {
  const [c, g] = base("#0a0f24");
  const grad = g.createRadialGradient(S / 2, S / 2, S * 0.05, S / 2, S / 2, S * 0.45);
  grad.addColorStop(0, "#fef9c3");
  grad.addColorStop(1, "#facc15");
  g.fillStyle = grad;
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? S * 0.44 : S * 0.18;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    g.lineTo(S / 2 + r * Math.cos(a), S * 0.53 + r * Math.sin(a));
  }
  g.closePath();
  g.fill();
  return c;
}

export function drawText(text: string): HTMLCanvasElement {
  const [c, g] = base();
  const t = (text || "HI").slice(0, 24);
  const words = t.split(/\s+/).filter(Boolean);
  const lines = words.length > 1 && t.length > 6 ? splitTwo(words) : [t];
  const grad = g.createLinearGradient(0, 0, S, S);
  ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"].forEach((col, i) =>
    grad.addColorStop(i / 5, col),
  );
  g.fillStyle = grad;
  g.textAlign = "center";
  g.textBaseline = "middle";
  const longest = Math.max(...lines.map((l) => l.length));
  let size = Math.min(S * 0.6, (S * 1.6) / Math.max(1, longest));
  g.font = `900 ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  const w = Math.max(...lines.map((l) => g.measureText(l).width));
  if (w > S * 0.92) {
    size *= (S * 0.92) / w;
    g.font = `900 ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  }
  const lh = size * 1.05;
  lines.forEach((l, i) => g.fillText(l, S / 2, S / 2 + (i - (lines.length - 1) / 2) * lh));
  return c;
}

function splitTwo(words: string[]): string[] {
  let best = [words.join(" ")];
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const d = Math.abs(a.length - b.length);
    if (d < bestDiff) {
      bestDiff = d;
      best = [a, b];
    }
  }
  return best;
}

export function sampleCanvas(id: SampleId, text: string): HTMLCanvasElement {
  if (id === "wink") return drawWink();
  if (id === "cat") return drawCat();
  if (id === "text") return drawText(text);
  return drawSmiley();
}

export function targetCanvas(id: TargetId, text: string): HTMLCanvasElement {
  if (id === "heart") return drawHeart();
  if (id === "star") return drawStar();
  if (id === "text") return drawText(text);
  if (id === "smiley") return drawSmiley();
  return drawFrown();
}

/** Center-crop and resample any drawable into n×n RGBA pixels (packed as Uint32). */
export function toPixels(src: CanvasImageSource & { width: number; height: number }, n: number, exact = false): Uint32Array {
  const c = document.createElement("canvas");
  c.width = c.height = n;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.fillStyle = "#000";
  g.fillRect(0, 0, n, n);
  const w = src.width;
  const h = src.height;
  if (exact && w === n && h === n) {
    g.imageSmoothingEnabled = false;
    g.drawImage(src, 0, 0);
  } else {
    const s = Math.min(w, h);
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = "high";
    g.drawImage(src, (w - s) / 2, (h - s) / 2, s, s, 0, 0, n, n);
  }
  const d = g.getImageData(0, 0, n, n).data;
  const out = new Uint32Array(d.buffer.slice(0));
  // force opaque so transparency doesn't vanish into the background
  for (let i = 0; i < out.length; i++) out[i] |= 0xff000000;
  return out;
}
