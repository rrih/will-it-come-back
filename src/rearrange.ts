// "Same pixels, different picture": move every pixel of the source image to a
// spot in the target picture. Nothing is added, removed or recolored.

function lum(p: number): number {
  const r = p & 255;
  const g = (p >> 8) & 255;
  const b = (p >> 16) & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function rankByLum(px: Uint32Array): Int32Array {
  const n = px.length;
  const keys = new Float64Array(n);
  // luminance first, index as a tiebreak (keeps flat areas tidy)
  for (let i = 0; i < n; i++) keys[i] = Math.round(lum(px[i]) * 64) * 4194304 + i;
  keys.sort();
  const out = new Int32Array(n);
  for (let i = 0; i < n; i++) out[i] = keys[i] % 4194304;
  return out;
}

/**
 * dest[o] = position in the target where original pixel o ends up.
 * The k-th darkest source pixel goes to the k-th darkest target spot, then a
 * few passes of local swaps pull the colors closer to the target.
 */
export function assign(src: Uint32Array, target: Uint32Array, n: number): Int32Array {
  const a = rankByLum(src);
  const b = rankByLum(target);
  const N = src.length;
  const dest = new Int32Array(N);
  const at = new Int32Array(N); // at[position] = original pixel
  for (let k = 0; k < N; k++) {
    dest[a[k]] = b[k];
    at[b[k]] = a[k];
  }
  refine(src, target, n, dest, at);
  return dest;
}

function dist(p: number, q: number): number {
  const dr = (p & 255) - (q & 255);
  const dg = ((p >> 8) & 255) - ((q >> 8) & 255);
  const db = ((p >> 16) & 255) - ((q >> 16) & 255);
  return dr * dr * 2 + dg * dg * 4 + db * db * 3;
}

// Random pair swaps inside a neighborhood when they bring both pixels closer
// to the target colors. Cheap and noticeably better for colorful photos.
function refine(src: Uint32Array, target: Uint32Array, n: number, dest: Int32Array, at: Int32Array) {
  const N = n * n;
  let seed = 12345;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const iters = Math.min(6, Math.max(2, Math.round(2_000_000 / N)));
  for (let pass = 0; pass < iters; pass++) {
    const r = Math.max(2, Math.round(n * (0.25 / (pass + 1))));
    for (let p = 0; p < N; p++) {
      const x = p % n;
      const y = (p / n) | 0;
      const qx = Math.min(n - 1, Math.max(0, x + Math.round((rnd() * 2 - 1) * r)));
      const qy = Math.min(n - 1, Math.max(0, y + Math.round((rnd() * 2 - 1) * r)));
      const q = qy * n + qx;
      if (q === p) continue;
      const op = at[p];
      const oq = at[q];
      const before = dist(src[op], target[p]) + dist(src[oq], target[q]);
      const after = dist(src[oq], target[p]) + dist(src[op], target[q]);
      if (after < before) {
        at[p] = oq;
        at[q] = op;
        dest[oq] = p;
        dest[op] = q;
      }
    }
  }
}

/** Count pixels that keep their place (they'd be in the right spot already). */
export function stayCount(dest: Int32Array): number {
  let s = 0;
  for (let i = 0; i < dest.length; i++) if (dest[i] === i) s++;
  return s;
}
