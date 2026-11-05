import { MORE, LANG_NAMES } from "./i18n-more";
import { APP_EN, APP_MORE } from "./i18n-app";

export type Lang = string;
export { LANG_NAMES };

const en0 = {
  tagline: "Scramble any picture with one simple rule. Keep going, and it comes back.",
  privacy_note: "Your image never leaves your device.",
  mode_zip: "Zip",
  mode_cat: "Cat map",
  mode_knead: "Knead",
  mode_rings: "Ring twist",
  mode_morph: "Rearrange",
  rule_zip: "Cut the picture in half and zip the rows together like a zipper, then do the same with the columns.",
  rule_cat: "Shear the picture and wrap it around (Arnold's cat map: x → x + y, y → x + 2y).",
  rule_knead: "Squash it, stretch it twice as wide, cut it in the middle and stack the right half on top, like kneading dough.",
  rule_rings: "Every square ring of pixels moves one pixel clockwise. Small rings come home fast. All of them together take a while.",
  rule_morph: "Every pixel of your picture flies to a new spot to draw another picture. Nothing is added, removed or recolored.",
  step: "Step",
  step_n: "Step {k}",
  home_n: "Home at step {p}",
  home_at: "Home at step",
  at_home: "pixels at home",
  back_home: "Back home!",
  never_moves: "",
  play: "Play",
  pause: "Pause",
  reset: "Start",
  jump_home: "Jump home",
  step_back: "Back one step",
  step_fwd: "Forward one step",
  jump_to: "Jump to step",
  go: "Go",
  speed: "Speed",
  smooth: "Show pixels flying",
  picture: "Picture",
  smiley: "Smiley",
  wink: "Wink",
  cat: "Cat",
  text: "Text",
  upload: "Your image",
  drop_hint: "Drop, paste or pick an image",
  exact: "Use exact pixels (to unscramble a saved PNG)",
  size: "Size",
  size_hint: "pixels per side",
  nearby: "Steps to come home for nearby sizes",
  target: "Turn it into",
  frown: "Frown",
  heart: "Heart",
  star: "Star",
  text_ph: "Type a word",
  morph_play: "Rearrange",
  morph_back: "Put them back",
  morph_stat: "{n} of {t} pixels move",
  morph_hud: "Same pixels",
  export: "Share",
  record: "Record video",
  recording: "Recording… {p}%",
  square: "Square",
  vertical: "Vertical (Shorts/TikTok/Reels)",
  save_png: "Save PNG",
  copy_link: "Copy link",
  copied: "Link copied",
  saved_video: "Video saved",
  secret_title: "Send a secret picture",
  secret_body:
    "Save a scrambled PNG at step k and send it. Your friend opens it here with “Use exact pixels”, picks the same rule, and steps back k times. Or forward to the home step.",
  skip: "… {n} steps later …",
  too_big: "Large size: playback may be slow on this device.",
  unsupported: "Video recording isn't supported in this browser. Try Chrome, Edge or Safari.",
  load_fail: "Couldn't read that image.",
  heading_q: "Will it come back?",
  morph_title: "Same pixels, new picture",
  no_mp4: "Saved as WebM. Most apps accept it; convert to MP4 if one does not.",
};

const en = { ...en0, ...APP_EN };
type Dict = typeof en;

const ja: Dict = {
  ...APP_EN,
  ...(APP_MORE.ja as typeof APP_EN),
  tagline: "どんな絵も、1 つの規則でぐちゃぐちゃに。続けていくと、元に戻る。",
  privacy_note: "画像は端末の外に出ません。",
  mode_zip: "ジップ",
  mode_cat: "猫写像",
  mode_knead: "こねる",
  mode_rings: "輪の回転",
  mode_morph: "並べ替え",
  rule_zip: "絵を上下半分に切り、ファスナーのように 1 行ずつかみ合わせる。次に左右も同じようにかみ合わせる。",
  rule_cat: "絵を斜めにずらして端を折り返す（アーノルドの猫写像: x → x + y、y → x + 2y）。",
  rule_knead: "パン生地のように、つぶして横に 2 倍に伸ばし、真ん中で切って右半分を上に重ねる。",
  rule_rings: "四角い輪がそれぞれ時計回りに 1 マスずつ進む。小さい輪はすぐ戻るが、全部そろうまでは長い。",
  rule_morph: "あなたの絵の画素が 1 つずつ飛んで、別の絵を描く。足す画素も消す画素も、色を変える画素もない。",
  step: "手数",
  step_n: "{k} 手目",
  home_n: "{p} 手で元に戻る",
  home_at: "元に戻る手数",
  at_home: "の画素が元の席",
  back_home: "元に戻った！",
  never_moves: "",
  play: "再生",
  pause: "一時停止",
  reset: "最初へ",
  jump_home: "元に戻る手へ",
  step_back: "1 手戻す",
  step_fwd: "1 手進める",
  jump_to: "手数へ移動",
  go: "移動",
  speed: "速さ",
  smooth: "画素が飛ぶ様子を見せる",
  picture: "絵",
  smiley: "スマイル",
  wink: "ウインク",
  cat: "ねこ",
  text: "文字",
  upload: "自分の画像",
  drop_hint: "画像をドロップ・貼り付け・選択",
  exact: "画素をそのまま使う（保存した PNG を元に戻すとき）",
  size: "大きさ",
  size_hint: "1 辺の画素数",
  nearby: "近い大きさで元に戻るまでの手数",
  target: "何に変える？",
  frown: "しかめ面",
  heart: "ハート",
  star: "星",
  text_ph: "言葉を入力",
  morph_play: "並べ替える",
  morph_back: "元に戻す",
  morph_stat: "{t} 個中 {n} 個が動く",
  morph_hud: "同じ画素",
  export: "共有",
  record: "動画を書き出す",
  recording: "書き出し中… {p}%",
  square: "正方形",
  vertical: "縦（ショート・TikTok・リール）",
  save_png: "PNG を保存",
  copy_link: "リンクをコピー",
  copied: "リンクをコピーしました",
  saved_video: "動画を保存しました",
  secret_title: "秘密の絵を送る",
  secret_body:
    "k 手目でぐちゃぐちゃの PNG を保存して送る。受け取った人はここで「画素をそのまま使う」で開き、同じ規則を選んで k 手戻す。または元に戻る手まで進める。",
  skip: "… {n} 手後 …",
  too_big: "大きいサイズです。この端末では再生が遅くなることがあります。",
  unsupported: "このブラウザは動画の書き出しに対応していません。Chrome・Edge・Safari でお試しください。",
  load_fail: "画像を読み込めませんでした。",
  heading_q: "元に戻る？",
  morph_title: "同じ画素で、別の絵",
  no_mp4: "WebM で保存しました。対応していないアプリでは MP4 に変換してください。",
};

export const DICTS: Record<string, Dict> = { en, ja };
const extraTemplates: Record<string, Partial<Dict>> = {
  "zh-Hans": { step_n: "第 {k} 步", home_n: "第 {p} 步复原" },
  "zh-Hant": { step_n: "第 {k} 步", home_n: "第 {p} 步復原" },
  ko: { step_n: "{k}단계", home_n: "{p}단계에서 복원" },
  tr: { step_n: "{k}. adım", home_n: "{p}. adımda geri döner" },
  hi: { step_n: "चरण {k}", home_n: "चरण {p} पर लौटती है" },
};
for (const [code, d] of Object.entries(MORE)) {
  DICTS[code] = { ...en, step_n: `${d.step ?? en.step} {k}`, home_n: `${d.home_at ?? en.home_at} {p}`, ...d, ...(APP_MORE[code] || {}), ...(extraTemplates[code] || {}) } as Dict;
}
export const LANGS = LANG_NAMES.map(([c]) => c);
export type Key = keyof Dict;

const STORE = "wicb-lang";

/** English unless the URL or the visitor's own earlier choice says otherwise. */
export function detectLang(param: string | null): Lang {
  const norm = (v: string | null | undefined): string | null => {
    if (!v) return null;
    if (LANGS.includes(v)) return v;
    const l = v.toLowerCase();
    if (l.startsWith("zh")) return /tw|hk|mo|hant/.test(l) ? "zh-Hant" : "zh-Hans";
    if (l.startsWith("pt")) return "pt-BR";
    const base = l.split("-")[0];
    return LANGS.includes(base) ? base : null;
  };
  const fromUrl = norm(param);
  if (fromUrl) return fromUrl;
  try {
    const saved = norm(localStorage.getItem(STORE));
    if (saved) return saved;
  } catch {
    /* storage blocked */
  }
  return "en";
}

export function saveLang(l: Lang) {
  try {
    localStorage.setItem(STORE, l);
  } catch {
    /* ignore */
  }
}

export function fmt(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}
