// Pixel permutations on an N×N grid.
// A transform is stored as a "gather" map P: after one step, the pixel at
// position d came from position P[d]  (next[d] = prev[P[d]]).
// After k steps, next[d] = orig[P^k(d)], which we evaluate with the cycle
// decomposition of P, so any step (even 10^300) is O(N²).

export type Kind = "zip" | "cat" | "knead" | "rings";

export const KINDS: Kind[] = ["zip", "cat", "knead", "rings"];

/** Sizes that the transform needs (knead needs an even side). */
export function fixSize(kind: Kind, n: number): number {
  n = Math.max(2, Math.min(4096, Math.round(n)));
  if (kind === "knead" && n % 2 === 1) n -= 1;
  return n;
}

/** Perfect out-shuffle of n cards: top half and bottom half interleave, top card stays on top. */
export function outShuffle(n: number): Int32Array {
  const h = Math.ceil(n / 2);
  const m = new Int32Array(n);
  for (let i = 0; i < n; i++) m[i] = i % 2 === 0 ? i / 2 : h + (i - 1) / 2;
  return m;
}

const mod = (a: number, n: number) => ((a % n) + n) % n;

export function buildGather(kind: Kind, n: number): Int32Array {
  const P = new Int32Array(n * n);
  if (kind === "zip") {
    // Zip rows like a zipper (out-shuffle), then zip columns the same way.
    const s = outShuffle(n);
    for (let y = 0; y < n; y++) {
      const sy = s[y] * n;
      const row = y * n;
      for (let x = 0; x < n; x++) P[row + x] = sy + s[x];
    }
  } else if (kind === "cat") {
    // Arnold's cat map: (x, y) -> (x + y, x + 2y) mod n. Gather uses the inverse.
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const sx = mod(2 * x - y, n);
        const sy = mod(y - x, n);
        P[y * n + x] = sy * n + sx;
      }
    }
  } else if (kind === "knead") {
    // Baker's map: squash two rows into one row twice as wide, cut it in the
    // middle, put the right half on top of the left half.
    const half = n / 2;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const r = y < half ? y : y - half;
        const j = y < half ? n + x : x;
        P[y * n + x] = (2 * r + (j & 1)) * n + (j >> 1);
      }
    }
  } else {
    // Ring twist: every square ring moves one cell clockwise.
    for (let i = 0; i < n * n; i++) P[i] = i;
    for (let l = 0; l < Math.floor(n / 2); l++) {
      const ring = ringCells(n, l);
      const L = ring.length;
      for (let t = 0; t < L; t++) P[ring[(t + 1) % L]] = ring[t];
    }
  }
  return P;
}

/** Cells of square ring l (0 = outer), clockwise from its top-left corner. */
export function ringCells(n: number, l: number): number[] {
  const a = l;
  const b = n - 1 - l;
  if (a === b) return [a * n + a];
  const out: number[] = [];
  for (let x = a; x < b; x++) out.push(a * n + x);
  for (let y = a; y < b; y++) out.push(y * n + b);
  for (let x = b; x > a; x--) out.push(b * n + x);
  for (let y = b; y > a; y--) out.push(y * n + a);
  return out;
}

export interface Cycles {
  n: number;
  order: Int32Array; // positions grouped by cycle; within a cycle order[s+t+1] = P[order[s+t]]
  starts: Int32Array;
  lens: Int32Array;
  period: bigint; // lcm of cycle lengths: steps until every pixel is home
  fixed: number; // pixels that never move
}

export function gcd(a: bigint, b: bigint): bigint {
  while (b) [a, b] = [b, a % b];
  return a;
}

export function lcmAll(lengths: Iterable<number>): bigint {
  let r = 1n;
  for (const L of lengths) {
    const b = BigInt(L);
    r = (r / gcd(r, b)) * b;
  }
  return r;
}

export function decompose(P: Int32Array, n: number): Cycles {
  const N = P.length;
  const seen = new Uint8Array(N);
  const order = new Int32Array(N);
  const starts: number[] = [];
  const lens: number[] = [];
  const distinct = new Set<number>();
  let w = 0;
  let fixed = 0;
  for (let i = 0; i < N; i++) {
    if (seen[i]) continue;
    const s = w;
    let j = i;
    while (!seen[j]) {
      seen[j] = 1;
      order[w++] = j;
      j = P[j];
    }
    const L = w - s;
    if (L === 1) fixed++;
    starts.push(s);
    lens.push(L);
    distinct.add(L);
  }
  return {
    n,
    order,
    starts: Int32Array.from(starts),
    lens: Int32Array.from(lens),
    period: lcmAll(distinct),
    fixed,
  };
}

/**
 * Arrangement after k steps: out[d] = index of the original pixel now at d.
 * k may be negative (undo) or astronomically large.
 */
export function arrangementAt(c: Cycles, k: bigint, out: Int32Array): Int32Array {
  const { order, starts, lens } = c;
  const shiftCache = new Map<number, number>();
  for (let q = 0; q < starts.length; q++) {
    const L = lens[q];
    const s = starts[q];
    if (L === 1) {
      out[order[s]] = order[s];
      continue;
    }
    let m = shiftCache.get(L);
    if (m === undefined) {
      const bl = BigInt(L);
      m = Number(((k % bl) + bl) % bl);
      shiftCache.set(L, m);
    }
    for (let t = 0; t < L; t++) {
      let u = t + m;
      if (u >= L) u -= L;
      out[order[s + t]] = order[s + u];
    }
  }
  return out;
}

/** How many pixels sit at their original place after k steps. */
export function homeCount(c: Cycles, k: bigint): number {
  let h = 0;
  const cache = new Map<number, boolean>();
  for (let q = 0; q < c.lens.length; q++) {
    const L = c.lens[q];
    let ok = cache.get(L);
    if (ok === undefined) {
      ok = k % BigInt(L) === 0n;
      cache.set(L, ok);
    }
    if (ok) h += L;
  }
  return h;
}

/** Period for a size without building the 2D permutation when a 1D shortcut exists. */
export function periodFor(kind: Kind, n: number): bigint {
  n = fixSize(kind, n);
  if (kind === "zip") {
    const s = outShuffle(n);
    return decompose(s, n).period;
  }
  if (kind === "rings") {
    const ls: number[] = [];
    for (let l = 0; l < Math.floor(n / 2); l++) ls.push(4 * (n - 1 - 2 * l));
    return lcmAll(ls);
  }
  return decompose(buildGather(kind, n), n).period;
}

/** "10", "1,396,755,360" or "3.21 × 10^342". */
export function formatBig(v: bigint, locale = "en"): string {
  const s = v.toString();
  if (s.length <= 15) return Number(v).toLocaleString(locale);
  return `${s[0]}.${s.slice(1, 3)} × 10^${s.length - 1}`;
}
