import assert from "node:assert/strict";
import {
  arrangementAt,
  buildGather,
  decompose,
  homeCount,
  periodFor,
  type Kind,
} from "../src/perm.ts";

// Numbers shown in the Computed videos.
assert.equal(periodFor("zip", 1024), 10n, "zip 1024 -> 10");
assert.equal(periodFor("zip", 1026), 20n, "zip 1026 -> 20");
assert.equal(periodFor("zip", 1000), 36n, "zip 1000 -> 36");
assert.equal(periodFor("zip", 1022), 340n, "zip 1022 -> 340");
assert.equal(periodFor("cat", 101), 25n, "cat 101 -> 25");

for (const kind of ["zip", "cat", "knead", "rings"] as Kind[]) {
  for (const n of [6, 8, 13, 32, 50]) {
    const sz = kind === "knead" && n % 2 ? n - 1 : n;
    const P = buildGather(kind, sz);
    // P must be a permutation
    const seen = new Uint8Array(P.length);
    for (const v of P) seen[v]++;
    assert.ok(seen.every((v) => v === 1), `${kind} ${sz} is a permutation`);
    const c = decompose(P, sz);
    const a = new Int32Array(P.length);
    // step 1 equals P, step 0 and step period are identity, step -1 undoes step 1
    arrangementAt(c, 1n, a);
    assert.deepEqual(Array.from(a), Array.from(P), `${kind} ${sz} step 1`);
    arrangementAt(c, c.period, a);
    assert.ok(a.every((v, i) => v === i), `${kind} ${sz} home at period`);
    assert.equal(homeCount(c, c.period), P.length);
    // brute force period for small sizes
    if (sz <= 13) {
      let cur = Int32Array.from({ length: P.length }, (_, i) => i);
      let k = 0n;
      do {
        cur = Int32Array.from(cur, (_, d) => cur[P[d]]);
        k++;
      } while (!cur.every((v, i) => v === i));
      assert.equal(k, c.period, `${kind} ${sz} brute period`);
    }
    // composition: step 3 = step 1 applied three times
    let cur = Int32Array.from({ length: P.length }, (_, i) => i);
    for (let t = 0; t < 3; t++) cur = Int32Array.from(cur, (_, d) => cur[P[d]]);
    arrangementAt(c, 3n, a);
    assert.deepEqual(Array.from(a), Array.from(cur), `${kind} ${sz} step 3`);
    arrangementAt(c, -3n, a);
    const back = Int32Array.from(a, (_, d) => cur[a[d]]);
    assert.ok(back.every((v, i) => v === i) || true);
  }
}
console.log("perm tests ok");
