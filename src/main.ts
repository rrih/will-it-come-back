import "./style.css";
import { DICTS, detectLang, fmt, type Key, type Lang } from "./i18n";
import { fixSize, formatBig, periodFor, type Kind } from "./perm";
import { assign, stayCount } from "./rearrange";
import { sampleCanvas, targetCanvas, toPixels, type SampleId, type TargetId } from "./samples";
import { MorphStage, Stage } from "./stage";
import { Recorder, download, type Shape } from "./record";
import { track } from "./analytics";

type Mode = Kind | "morph";
const MODES: Mode[] = ["zip", "cat", "knead", "rings", "morph"];
const SIZES = [32, 64, 100, 101, 128, 200, 256, 300, 500, 512, 1000, 1022, 1024];
const MORPH_SIZES = [64, 128, 200, 256, 384, 512];
const PICS: SampleId[] = ["smiley", "wink", "cat", "text"];
const TARGETS: TargetId[] = ["frown", "heart", "star", "smiley", "text"];

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

// ---------- state ----------
const q = new URLSearchParams(location.search);
const state = {
  lang: detectLang(q.get("lang")) as Lang,
  langFromUrl: q.has("lang"),
  mode: (MODES.includes(q.get("mode") as Mode) ? q.get("mode") : "zip") as Mode,
  n: clampInt(q.get("n"), 8, 1024, 256),
  pic: (PICS.includes(q.get("pic") as SampleId) ? q.get("pic") : "smiley") as SampleId | "upload",
  text: (q.get("text") || "HELLO").slice(0, 24),
  target: (TARGETS.includes(q.get("target") as TargetId) ? q.get("target") : "frown") as TargetId | "upload",
  ttext: (q.get("ttext") || "WOW").slice(0, 24),
  exact: false,
  speed: clampInt(q.get("speed"), 1, 5, 3),
  smooth: q.get("smooth") !== "0",
};
const startK = parseStep(q.get("k") || "0") ?? 0n;

let upload: ImageBitmap | null = null;
let tupload: ImageBitmap | null = null;
let busy = false;
let playing = false;
let morphT = 0;

const stage = new Stage($<HTMLCanvasElement>("stage"));
const morph = new MorphStage($<HTMLCanvasElement>("morph"));

function clampInt(v: string | null, lo: number, hi: number, d: number) {
  const x = v == null ? NaN : parseInt(v, 10);
  return Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : d;
}

function t(k: Key) {
  return DICTS[state.lang][k];
}

function parseStep(s: string): bigint | null {
  s = s.trim().replace(/[,_\s]/g, "");
  if (!s) return null;
  let m = s.match(/^(-?)(\d+)(?:\^|\*\*)(\d{1,4})$/);
  if (m) return (m[1] ? -1n : 1n) * BigInt(m[2]) ** BigInt(m[3]);
  m = s.match(/^(-?)(\d+)e(\d{1,4})$/i);
  if (m) return (m[1] ? -1n : 1n) * BigInt(m[2]) * 10n ** BigInt(m[3]);
  if (/^-?\d+$/.test(s)) return BigInt(s);
  return null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function tween(ms: number, fn: (t: number) => void): Promise<void> {
  return new Promise((resolve) => {
    const t0 = performance.now();
    const tick = (now: number) => {
      const u = Math.min(1, (now - t0) / ms);
      fn(u);
      if (u < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}

// ---------- language ----------
function applyLang() {
  document.documentElement.lang = state.lang;
  document.querySelectorAll<HTMLElement>("[data-i]").forEach((el) => {
    el.textContent = t(el.dataset.i as Key);
  });
  document.querySelectorAll<HTMLElement>("[data-t]").forEach((el) => {
    const s = t(el.dataset.t as Key);
    el.title = s;
    el.setAttribute("aria-label", s);
  });
  document.querySelectorAll<HTMLElement>("[data-lang]").forEach((el) => {
    el.hidden = el.dataset.lang !== state.lang;
  });
  document.querySelectorAll<HTMLButtonElement>("[data-lang-btn]").forEach((b) => {
    b.classList.toggle("on", b.dataset.langBtn === state.lang);
  });
  ($("pic-text") as HTMLInputElement).placeholder = t("text_ph");
  ($("target-text") as HTMLInputElement).placeholder = t("text_ph");
  renderRule();
  updateReadout();
  updatePlayLabel();
}

// ---------- pictures ----------
function sourceCanvas(): CanvasImageSource & { width: number; height: number } {
  if (state.pic === "upload" && upload) return upload;
  return sampleCanvas(state.pic === "upload" ? "smiley" : state.pic, state.text);
}

function targetSource(): CanvasImageSource & { width: number; height: number } {
  if (state.target === "upload" && tupload) return tupload;
  return targetCanvas(state.target === "upload" ? "frown" : state.target, state.ttext);
}

function currentSize(): number {
  if (state.mode === "morph") return Math.min(512, state.n);
  return fixSize(state.mode, state.n);
}

// ---------- rebuild ----------
function rebuild(keepStep = false) {
  const isMorph = state.mode === "morph";
  $("stage").hidden = isMorph;
  $("morph").hidden = !isMorph;
  $("transport").hidden = isMorph;
  $("morph-transport").hidden = !isMorph;
  $("steps-group").hidden = isMorph;
  $("target-group").hidden = !isMorph;
  $("nearby-wrap").hidden = isMorph;
  const n = currentSize();
  if (n !== state.n) state.n = n;
  const exact = state.exact && state.pic === "upload" && !!upload && upload.width === upload.height && upload.width === n;
  const src = toPixels(sourceCanvas(), n, exact);
  if (isMorph) {
    const tgt = toPixels(targetSource(), n);
    const dest = assign(src, tgt, n);
    morph.setup(src, dest, n);
    morph.frame(morphT);
    const moved = dest.length - stayCount(dest);
    $("r-step").textContent = t("morph_title");
    $("r-sub").textContent = fmt(t("morph_stat"), {
      n: moved.toLocaleString(state.lang),
      s: (dest.length - moved).toLocaleString(state.lang),
    });
    $("homebar").style.width = "0";
  } else {
    const k = keepStep ? stage.step : 0n;
    stage.setup(state.mode as Kind, src, n);
    stage.goTo(k);
    updateReadout();
    computeNearby();
  }
  renderSizes();
  renderChips();
  renderRule();
  $("size-warn").hidden = !(n > 512);
  syncUrl();
}

function renderRule() {
  $("rule").textContent = t(`rule_${state.mode}` as Key);
}

function renderChips() {
  document.querySelectorAll<HTMLButtonElement>("#tabs [data-mode]").forEach((b) => {
    const on = b.dataset.mode === state.mode;
    b.classList.toggle("on", on);
    b.setAttribute("aria-selected", String(on));
  });
  document.querySelectorAll<HTMLButtonElement>("#pics [data-pic]").forEach((b) => b.classList.toggle("on", b.dataset.pic === state.pic));
  $("pics").querySelector(".upload")!.classList.toggle("on", state.pic === "upload");
  document
    .querySelectorAll<HTMLButtonElement>("#targets [data-target]")
    .forEach((b) => b.classList.toggle("on", b.dataset.target === state.target));
  $("targets").querySelector(".upload")!.classList.toggle("on", state.target === "upload");
  $("pic-text").hidden = state.pic !== "text";
  $("target-text").hidden = state.target !== "text";
  $("exact-row").hidden = !(state.pic === "upload" && upload && upload.width === upload.height && upload.width <= 1024);
}

function renderSizes() {
  const sel = $<HTMLSelectElement>("size");
  const list = (state.mode === "morph" ? MORPH_SIZES : SIZES).map((s) => (state.mode === "morph" ? s : fixSize(state.mode as Kind, s)));
  const uniq = [...new Set([...list, state.n])].sort((a, b) => a - b);
  sel.innerHTML = uniq.map((s) => `<option value="${s}" ${s === state.n ? "selected" : ""}>${s} × ${s}</option>`).join("");
  const c = $<HTMLInputElement>("size-custom");
  c.max = state.mode === "morph" ? "512" : "1024";
  if (document.activeElement !== c) c.value = String(state.n);
}

let nearbyToken = 0;
function computeNearby() {
  if (state.mode === "morph") return;
  const kind = state.mode;
  const n = state.n;
  const token = ++nearbyToken;
  const box = $("nearby");
  const sizes = [...new Set([n - 3, n - 2, n - 1, n, n + 1, n + 2, n + 3].filter((s) => s >= 8 && s <= 1024).map((s) => fixSize(kind, s)))];
  box.innerHTML = sizes.map((s) => `<button type="button" data-n="${s}" class="${s === n ? "on" : ""}"><b>${s}</b><span>…</span></button>`).join("");
  let i = 0;
  const next = () => {
    if (token !== nearbyToken || i >= sizes.length) return;
    const s = sizes[i++];
    const p = s === n ? stage.period : periodFor(kind, s);
    const el = box.querySelector<HTMLElement>(`[data-n="${s}"] span`);
    if (el) el.textContent = formatBig(p, state.lang);
    setTimeout(next, 0);
  };
  setTimeout(next, 30);
}

// ---------- readout ----------
function updateReadout() {
  if (state.mode === "morph" || !stage.cycles) return;
  const P = stage.period;
  const k = stage.step;
  const r = ((k % P) + P) % P;
  const isHome = r === 0n && k !== 0n;
  const total = stage.n * stage.n;
  const home = stage.home;
  $("r-step").textContent = isHome ? `${t("back_home")} ${t("step")} ${formatBig(k, state.lang)}` : `${t("step")} ${formatBig(k, state.lang)}`;
  const pct = (home / total) * 100;
  const pctS = pct >= 99.95 ? "100" : pct < 0.1 && home > 0 ? pct.toFixed(2) : pct.toFixed(1);
  $("r-sub").textContent = `${t("home_at")} ${formatBig(P, state.lang)} · ${pctS}% ${t("at_home")}`;
  $("homebar").style.width = `${pct}%`;
  $("readout").classList.toggle("home", isHome);
  const badge = $("badge");
  badge.hidden = !isHome;
  badge.textContent = t("back_home");
}

function updatePlayLabel() {
  $("b-play-l").textContent = playing ? t("pause") : t("play");
  $("b-play").classList.toggle("on", playing);
}

// ---------- stepping ----------
function stepMs() {
  return [0, 1100, 750, 480, 280, 140][state.speed];
}

async function animateStep(dir: 1 | -1, ms = stepMs(), smooth = state.smooth) {
  if (smooth) {
    stage.begin(dir);
    await tween(ms, (u) => stage.frame(u));
    stage.commit();
  } else {
    stage.goTo(stage.step + BigInt(dir));
    await sleep(ms * 0.6);
  }
  updateReadout();
}

async function play() {
  if (playing) {
    playing = false;
    updatePlayLabel();
    return;
  }
  if (busy) return;
  playing = true;
  updatePlayLabel();
  track("play", { mode: state.mode, n: state.n });
  busy = true;
  try {
    while (playing) {
      await animateStep(1);
      syncUrl();
      const P = stage.period;
      if (stage.step % P === 0n) {
        playing = false;
        track("came_back", { mode: state.mode, n: state.n });
        break;
      }
      await sleep(state.speed >= 4 ? 60 : 220);
    }
  } finally {
    busy = false;
    playing = false;
    updatePlayLabel();
  }
}

async function single(dir: 1 | -1) {
  if (busy) return;
  busy = true;
  try {
    await animateStep(dir);
  } finally {
    busy = false;
  }
  syncUrl();
}

function jump(k: bigint) {
  playing = false;
  if (busy) {
    setTimeout(() => jump(k), 60);
    return;
  }
  stage.goTo(k);
  updateReadout();
  syncUrl();
}

// ---------- morph ----------
async function morphTo(target: 0 | 1) {
  if (busy) return;
  busy = true;
  const from = morphT;
  const ms = [0, 5200, 4000, 3000, 2000, 1200][state.speed] * Math.abs(target - from);
  try {
    await tween(Math.max(1, ms), (u) => {
      morphT = from + (target - from) * u;
      morph.frame(morphT);
    });
  } finally {
    busy = false;
  }
  if (target === 1) track("morph", { target: state.target, n: state.n });
}

// ---------- url ----------
let urlTimer = 0;
function syncUrl() {
  clearTimeout(urlTimer);
  urlTimer = window.setTimeout(() => {
    const p = new URLSearchParams();
    p.set("mode", state.mode);
    p.set("n", String(state.n));
    if (state.pic !== "upload" && state.pic !== "smiley") p.set("pic", state.pic);
    if (state.pic === "text") p.set("text", state.text);
    if (state.mode === "morph") {
      if (state.target !== "upload") p.set("target", state.target);
      if (state.target === "text") p.set("ttext", state.ttext);
    } else if (stage.step !== 0n) p.set("k", stage.step.toString());
    if (state.speed !== 3) p.set("speed", String(state.speed));
    if (!state.smooth) p.set("smooth", "0");
    if (state.langFromUrl) p.set("lang", state.lang);
    history.replaceState(null, "", `${location.pathname}?${p.toString()}`);
  }, 150);
}

// ---------- toast ----------
let toastTimer = 0;
function toast(msg: string) {
  const el = $("toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (el.hidden = true), 3200);
}

// ---------- uploads ----------
async function loadFile(file: File | Blob, which: "pic" | "target") {
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
    if (which === "pic") {
      upload?.close?.();
      upload = bmp;
      state.pic = "upload";
      // a square PNG at a usable size is probably a scrambled picture saved here
      if (bmp.width === bmp.height && bmp.width >= 8 && bmp.width <= 1024 && (file as File).type === "image/png") {
        state.exact = true;
        ($("exact") as HTMLInputElement).checked = true;
        if (state.mode !== "morph" && fixSize(state.mode, bmp.width) === bmp.width) state.n = bmp.width;
      }
    } else {
      tupload?.close?.();
      tupload = bmp;
      state.target = "upload";
    }
    track("upload", { which });
    rebuild();
  } catch {
    toast(t("load_fail"));
  }
}

// ---------- record ----------
async function record(shape: Shape) {
  if (busy) return;
  playing = false;
  const source = state.mode === "morph" ? morph.canvas : stage.canvas;
  const rec = new Recorder(source, shape);
  if (!rec.start()) {
    toast(t("unsupported"));
    return;
  }
  busy = true;
  document.body.classList.add("recording");
  track("record_start", { mode: state.mode, n: state.n, shape });
  const name = DICTS[state.lang][`mode_${state.mode}` as Key];
  try {
    if (state.mode === "morph") {
      rec.overlay = { title: t("morph_title"), counter: "", sub: "", flash: 0 };
      morphT = 0;
      morph.frame(0);
      await sleep(900);
      await tween(3600, (u) => {
        morphT = u;
        morph.frame(u);
        toast(fmt(t("recording"), { p: Math.round(u * 50) }));
      });
      rec.overlay.flash = 1;
      await sleep(1400);
      rec.overlay.flash = 0;
      await tween(2600, (u) => {
        morphT = 1 - u;
        morph.frame(morphT);
        toast(fmt(t("recording"), { p: 50 + Math.round(u * 50) }));
      });
      await sleep(900);
    } else {
      const P = stage.period;
      const label = () => `${name} ${formatBig(stage.step, state.lang)}`;
      const sub = `${t("home_at")} ${formatBig(P, state.lang)}`;
      rec.overlay = { title: t("heading_q"), counter: label(), sub, flash: 0 };
      stage.goTo(0n);
      updateReadout();
      await sleep(1000);
      const ms = P <= 12n ? 900 : 650;
      const doSteps = async (count: number, base: number, totalShown: number) => {
        for (let i = 0; i < count; i++) {
          await animateStep(1, ms, stage.n <= 1024);
          rec.overlay.counter = label();
          toast(fmt(t("recording"), { p: Math.round(((base + i + 1) / totalShown) * 100) }));
          await sleep(260);
        }
      };
      if (P <= 40n) {
        await doSteps(Number(P), 0, Number(P));
      } else {
        await doSteps(6, 0, 10);
        rec.overlay.counter = fmt(t("skip"), { n: formatBig(P - 10n, state.lang) });
        await sleep(1100);
        stage.goTo(P - 4n);
        updateReadout();
        rec.overlay.counter = label();
        await sleep(500);
        await doSteps(4, 6, 10);
      }
      rec.overlay.counter = `${t("back_home")} ${formatBig(stage.step, state.lang)}`;
      rec.overlay.flash = 1;
      await sleep(2000);
    }
    const blob = await rec.stop();
    const ext = rec.mime.includes("mp4") ? "mp4" : "webm";
    download(blob, `will-it-come-back-${state.mode}-${state.n}-${shape}.${ext}`);
    toast(ext === "mp4" ? t("saved_video") : t("no_mp4"));
    track("record_done", { mode: state.mode, n: state.n, shape, ext });
  } finally {
    busy = false;
    document.body.classList.remove("recording");
    syncUrl();
  }
}

// ---------- events ----------
function bind() {
  document.querySelectorAll<HTMLButtonElement>("[data-lang-btn]").forEach((b) =>
    b.addEventListener("click", () => {
      state.lang = b.dataset.langBtn as Lang;
      state.langFromUrl = true;
      applyLang();
      rebuild(true);
    }),
  );
  $("tabs").addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-mode]");
    if (!b || busy) return;
    state.mode = b.dataset.mode as Mode;
    track("select_mode", { mode: state.mode });
    rebuild();
  });
  $("pics").addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-pic]");
    if (!b || busy) return;
    state.pic = b.dataset.pic as SampleId;
    state.exact = false;
    rebuild(true);
  });
  $("targets").addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-target]");
    if (!b || busy) return;
    state.target = b.dataset.target as TargetId;
    morphT = 0;
    rebuild();
  });
  let textTimer = 0;
  $("pic-text").addEventListener("input", (e) => {
    state.text = (e.target as HTMLInputElement).value;
    clearTimeout(textTimer);
    textTimer = window.setTimeout(() => !busy && rebuild(true), 250);
  });
  $("target-text").addEventListener("input", (e) => {
    state.ttext = (e.target as HTMLInputElement).value;
    clearTimeout(textTimer);
    textTimer = window.setTimeout(() => !busy && rebuild(true), 250);
  });
  $("file").addEventListener("change", (e) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f) loadFile(f, "pic");
  });
  $("tfile").addEventListener("change", (e) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f) loadFile(f, "target");
  });
  $("exact").addEventListener("change", (e) => {
    state.exact = (e.target as HTMLInputElement).checked;
    if (state.exact && upload && state.mode !== "morph") state.n = upload.width;
    rebuild();
  });
  $("size").addEventListener("change", (e) => {
    if (busy) return;
    state.n = parseInt((e.target as HTMLSelectElement).value, 10);
    track("select_size", { n: state.n, mode: state.mode });
    rebuild();
  });
  $("size-custom").addEventListener("change", (e) => {
    if (busy) return;
    state.n = clampInt((e.target as HTMLInputElement).value, 8, state.mode === "morph" ? 512 : 1024, state.n);
    rebuild();
  });
  $("nearby").addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-n]");
    if (!b || busy) return;
    state.n = parseInt(b.dataset.n!, 10);
    rebuild();
  });
  $("smooth").addEventListener("change", (e) => {
    state.smooth = (e.target as HTMLInputElement).checked;
    syncUrl();
  });
  $("speed").addEventListener("input", (e) => {
    state.speed = parseInt((e.target as HTMLInputElement).value, 10);
    syncUrl();
  });
  $("b-play").addEventListener("click", play);
  $("b-fwd").addEventListener("click", () => single(1));
  $("b-back").addEventListener("click", () => single(-1));
  $("b-reset").addEventListener("click", () => jump(0n));
  $("b-home").addEventListener("click", () => {
    const P = stage.period;
    const k = stage.step;
    // the next home strictly after the current step
    const floorDiv = k >= 0n ? k / P : -((-k + P - 1n) / P);
    const nextHome = (floorDiv + 1n) * P;
    jump(nextHome);
    track("jump_home", { mode: state.mode, n: state.n });
  });
  $("jump").addEventListener("submit", (e) => {
    e.preventDefault();
    const k = parseStep(($("jump-k") as HTMLInputElement).value);
    if (k != null) jump(k);
  });
  $("m-play").addEventListener("click", () => morphTo(1));
  $("m-back").addEventListener("click", () => morphTo(0));
  $("rec-sq").addEventListener("click", () => record("square"));
  $("rec-v").addEventListener("click", () => record("vertical"));
  $("png").addEventListener("click", () => {
    const c = state.mode === "morph" ? morph.canvas : stage.canvas;
    c.toBlob((b) => {
      if (!b) return;
      const name = state.mode === "morph" ? `rearranged-${state.n}.png` : `${state.mode}-${state.n}-step${stage.step}.png`;
      download(b, name);
      track("save_png", { mode: state.mode, n: state.n });
    }, "image/png");
  });
  $("share").addEventListener("click", async () => {
    syncUrl();
    await sleep(200);
    const url = location.href;
    try {
      if (navigator.share && matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title: document.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast(t("copied"));
      }
      track("share", { mode: state.mode });
    } catch {
      /* cancelled */
    }
  });
  // drag & drop / paste
  const drop = $("drop");
  ["dragenter", "dragover"].forEach((ev) =>
    drop.addEventListener(ev, (e) => {
      e.preventDefault();
      drop.classList.add("over");
    }),
  );
  ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, () => drop.classList.remove("over")));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    const f = (e as DragEvent).dataTransfer?.files?.[0];
    if (f && f.type.startsWith("image/")) loadFile(f, "pic");
  });
  window.addEventListener("paste", (e) => {
    const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith("image/"));
    const f = item?.getAsFile();
    if (f) loadFile(f, "pic");
  });
  window.addEventListener("keydown", (e) => {
    if ((e.target as HTMLElement).closest("input, textarea, select")) return;
    if (state.mode === "morph") return;
    if (e.key === " ") {
      e.preventDefault();
      play();
    } else if (e.key === "ArrowRight") single(1);
    else if (e.key === "ArrowLeft") single(-1);
  });
}

// ---------- boot ----------
($("speed") as HTMLInputElement).value = String(state.speed);
($("smooth") as HTMLInputElement).checked = state.smooth;
($("pic-text") as HTMLInputElement).value = state.text;
($("target-text") as HTMLInputElement).value = state.ttext;
bind();
applyLang();
rebuild();
if (startK !== 0n && state.mode !== "morph") jump(startK);

if ("serviceWorker" in navigator && location.hostname !== "localhost") {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}
