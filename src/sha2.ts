const A = Uint32Array.from(
    "428a2f9871374491b5c0fbcfe9b5dba53956c25b59f111f1923f82a4ab1c5ed5d807aa9812835b01243185be550c7dc372be5d7480deb1fe9bdc06a7c19bf174e49b69c1efbe47860fc19dc6240ca1cc2de92c6f4a7484aa5cb0a9dc76f988da983e5152a831c66db00327c8bf597fc7c6e00bf3d5a7914706ca63511429296727b70a852e1b21384d2c6dfc53380d13650a7354766a0abb81c2c92e92722c85a2bfe8a1a81a664bc24b8b70c76c51a3d192e819d6990624f40e3585106aa07019a4c1161e376c082748774c34b0bcb5391c0cb34ed8aa4a5b9cca4f682e6ff3748f82ee78a5636f84c878148cc7020890befffaa4506cebbef9a3f7c67178f2ca273eced186b8c7eada7dd6f57d4f7f06f067aa0a637dc5113f98041b710b3528db77f532caab7b3c9ebe0a431d67c44cc5d4be597f299c5fcb6fab6c44198cd728ae2223ef65cdec4d3b2f8189dbbcf348b538b605d019af194f9bda6d8118a303024245706fbe4ee4b28cd5ffb4e2f27b896f3b1696b125c71235cf6926949ef14ad2384f25e38b8cd5b577ac9c65592b02756ea6e483bd41fbd4831153b5ee66dfab2db4321098fb213fbeef0ee43da88fc2930aa725e003826f0a0e6e7046d22ffc5c26c9265ac42aed9d95b3df8baf63de3c77b2a847edaee61482353b4cf10364bc423001d0f897910654be30d6ef52185565a9105771202a32bbd1b8b8d2d0c85141ab53df8eeb99e19b48a8c5c95a63e3418acb7763e373d6b2b8a35defb2fc43172f60a1f0ab721a6439ec23631e28de82bde9b2c67915e372532bea26619c21c0c207cde0eb1eee6ed17872176fbaa2c898a6bef90dae131c471b23047d8440c7249315c9bebc9c100d4ccb3e42b6fc657e2a3ad6faec4a4758176a09e667f3bcc908bb67ae8584caa73b3c6ef372fe94f82ba54ff53a5f1d36f1510e527fade682d19b05688c2b3e6c1f1f83d9abfb41bd6b5be0cd19137e2179"
      .match(/.{8}/g)!,
    (Z) => parseInt(Z, 16),
  ),
  B = A.subarray(80, 160),
  C = A.subarray(160, 176),
  D = new Uint32Array(160),
  E = 0x100000000;
const block = (from: Uint8Array, at: number, to: Uint32Array) => {
  let a, b, c, d, e, f, z = 0;
  do D[z] = from[at++] << 24 | from[at++] << 16 | from[at++] << 8 | from[at++],
    D[z + 80] = from[at++] << 24 | from[at++] << 16 | from[at++] << 8 |
      from[at++]; while (++z < 16);
  do a = D[z - 15],
    b = D[z + 65],
    c = (a << 31 | b >>> 1) ^ (a << 24 | b >>> 8) ^ (a << 25 | b >>> 7),
    d = (a >>> 1 | b << 31) ^ (a >>> 8 | b << 24) ^ a >>> 7,
    a = D[z - 2],
    b = D[z + 78],
    D[z + 80] = c = (c >>> 0) + D[z + 73] + D[z + 64] +
      (((a << 13 | b >>> 19) ^ (a >>> 29 | b << 3) ^
        (a << 26 | b >>> 6)) >>>
        0),
    D[z] = d + ((a >>> 19 | b << 13) ^ (a << 3 | b >>> 29) ^ a >>> 6) +
      D[z - 7] + D[z - 16] + (c / E | 0); while (++z < 80);
  let g = to[z = 0], h = to[1], i = to[2], j = to[3], k = to[4], l = to[5];
  let m = to[6], n = to[7], o = to[8], p = to[9], q = to[10], r = to[11];
  let s = to[12], t = to[13], u = to[14], v = to[15];
  do a = (o >>> 14 | p << 18) ^ (o >>> 18 | p << 14) ^ (o << 23 | p >>> 9),
    b = (o << 18 | p >>> 14) ^ (o << 14 | p >>> 18) ^ (o >>> 9 | p << 23),
    e = (v >>> 0) + (b >>> 0) + ((p & r ^ ~p & t) >>> 0) + B[z] + D[z + 80],
    f = u + a + (o & q ^ ~o & s) + A[z] + D[z] + (e / E | 0) | 0,
    a = (g >>> 28 | h << 4) ^ (g << 30 | h >>> 2) ^ (g << 25 | h >>> 7),
    b = (g << 4 | h >>> 28) ^ (g >>> 2 | h << 30) ^ (g >>> 7 | h << 25),
    c = (g & i) ^ (g & k) ^ (i & k),
    d = (h & j) ^ (h & l) ^ (j & l),
    u = s,
    v = t,
    s = q,
    t = r,
    q = o,
    r = p,
    p = (n >>> 0) + (e >>> 0),
    o = m + f + (p / E | 0) | 0,
    m = k,
    n = l,
    k = i,
    l = j,
    i = g,
    j = h,
    h = (e >>> 0) + (b >>> 0) + (d >>> 0),
    g = f + a + c + (h / E | 0) | 0; while (++z < 80);
  to[0] += g + ((to[1] += h >>> 0) / E | 0);
  to[2] += i + ((to[3] += j >>> 0) / E | 0);
  to[4] += k + ((to[5] += l >>> 0) / E | 0);
  to[6] += m + ((to[7] += n >>> 0) / E | 0);
  to[8] += o + ((to[9] += p >>> 0) / E | 0);
  to[10] += q + ((to[11] += r >>> 0) / E | 0);
  to[12] += s + ((to[13] += t >>> 0) / E | 0);
  to[14] += u + ((to[15] += v >>> 0) / E | 0);
};
export const sha512 = (data: Uint8Array) => {
  const a = data.length, b = new Uint32Array(C), d = new Uint8Array(128);
  let z = 0, y = 0;
  while (z < a) {
    const e = Math.min(128 - y, a - z);
    if (e !== 128) d.set(data.subarray(z, z += e)), y += e;
    else while (a - z >= 128) block(data, z, b), z += 128;
  }
  d[y++] = 128, 128 - y < 16 && block(d, y = 0, b);
  const e = new DataView(d.fill(0, y).buffer);
  e.setBigUint64(120, BigInt(a) << 3n), block(d, y = z = 0, b);
  do e.setUint32(z, b[y]); while (z += 4, ++y < 16);
  return new Uint8Array(d.subarray(0, 64));
};
