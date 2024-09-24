const sha512 = async (bytes: Uint8Array) =>
  new Uint8Array(await crypto.subtle.digest("SHA-512", bytes));
type Point = [X: bigint, Y: bigint, Z: bigint, T: bigint];
const P = (1n << 255n) - 19n,
  N = (1n << 252n) + 0x14def9dea2f79cd65812631a5cf5d3edn,
  D = 0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3n,
  R = 0x2b8324804fc1df0b2b4d00993dfbd7a72f431806ad2fe478c4ee1b274a0ea0b0n,
  X = 0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51an,
  Y = BigInt(`0x${"6".repeat(62)}58`),
  T = X * Y % P,
  F = ~(1n << 255n),
  G = Array<Point>(4224);
const p = (value: bigint, modulus = P) => (value % modulus + modulus) % modulus;
const r = (base: bigint, power: number) => {
  do base = base * base % P; while (--power);
  return base;
};
const v = (divisor: bigint) => {
  let a = 0n, b = p(divisor), c = P, d = 1n, e = 1n, f = 0n, g, h;
  while (g = b) {
    b = c % g, c /= g, h = a - e * c, d = f, f = d - f * c, c = g, a = e, e = h;
  }
  return p(a);
};
const s = async (bytes: Uint8Array) => {
  const a = new DataView((await sha512(bytes)).buffer);
  return (a.getBigUint64(0, true) | a.getBigUint64(8, true) << 64n |
    a.getBigUint64(16, true) << 128n | a.getBigUint64(24, true) << 192n |
    a.getBigUint64(32, true) << 256n | a.getBigUint64(40, true) << 320n |
    a.getBigUint64(48, true) << 384n | a.getBigUint64(56, true) << 448n) % N;
};
const t = (base: bigint, big: bigint) => {
  const a = big * r(big, 2) % P, b = a * a % P * base % P, c = b * r(b, 5) % P;
  const d = c * r(c, 10) % P, e = d * r(d, 20) % P, h = e * r(e, 40) % P;
  return base * r(c * r(h * r(h * r(h, 80) % P, 80) % P, 10) % P, 2) % P;
};
const a_p = (k: Uint8Array) => (k[0] &= 248, k[31] &= 127, k[31] |= 64, a_i(k));
const a_i = (Z: Uint8Array, Y = 0) =>
  BigInt((Z[Y] | Z[++Y] << 8 | Z[++Y] << 16 | Z[++Y] << 24) >>> 0) |
  BigInt((Z[++Y] | Z[++Y] << 8 | Z[++Y] << 16 | Z[++Y] << 24) >>> 0) << 32n |
  BigInt((Z[++Y] | Z[++Y] << 8 | Z[++Y] << 16 | Z[++Y] << 24) >>> 0) << 64n |
  BigInt((Z[++Y] | Z[++Y] << 8 | Z[++Y] << 16 | Z[++Y] << 24) >>> 0) << 96n |
  BigInt((Z[++Y] | Z[++Y] << 8 | Z[++Y] << 16 | Z[++Y] << 24) >>> 0) << 128n |
  BigInt((Z[++Y] | Z[++Y] << 8 | Z[++Y] << 16 | Z[++Y] << 24) >>> 0) << 160n |
  BigInt((Z[++Y] | Z[++Y] << 8 | Z[++Y] << 16 | Z[++Y] << 24) >>> 0) << 192n |
  BigInt((Z[++Y] | Z[++Y] << 8 | Z[++Y] << 16 | Z[++Y] << 24) >>> 0) << 224n;
const i_a = (big: bigint) => {
  const a = new Uint8Array(32), b = new DataView(a.buffer);
  b.setBigUint64(16, big >> 128n, true), b.setBigUint64(24, big >> 192n, true);
  return b.setBigUint64(0, big, true), b.setBigUint64(8, big >> 64n, true), a;
};
const a_n = (bytes: Uint8Array) => {
  const a = a_i(bytes) & F;
  if (a >= P) throw Error();
  return a;
};
const a_e = (bytes: Uint8Array) => {
  const a = a_n(bytes), b = a * a % P, c = p(b - 1n), d = p(D * b + 1n);
  const e = d * d % P * d % P, f = c * p(d * e * e) % P;
  let g = p(c * e * t(f, f * f % P * f % P));
  const h = p(d * g * g);
  if (h === p(-c)) g = g * R % P;
  else if (h !== c) throw Error();
  const i = bytes[31] >> 7;
  if (!g && i) throw Error();
  if (Number(g & 1n) ^ i) g = P - g;
  return [g, a, 1n, g * a % P] satisfies Point;
};
const e_a = (point: Point) => {
  const a = v(point[2]), b = i_a(p(point[1] * a));
  return point[0] * a % P & 1n && (b[31] |= 128), b;
};
const add = (one: Point, two: Point) => {
  const a = one[0] * two[0] % P + one[1] * two[1] % P, b = one[2] * two[2] % P;
  const c = one[3] * D * two[3] % P, d = b + c, e = b - c;
  const f = (one[0] + one[1]) * (two[0] + two[1]) % P - a;
  one[0] = p(f * e), one[1] = p(d * a), one[2] = p(e * d), one[3] = p(f * a);
};
const double = (one: Point) => {
  const a = one[0] * one[0] % P, b = one[1] * one[1] % P, c = P - a, d = c + b;
  const e = c - b, f = d - one[2] * one[2] % P * 2n % P;
  const g = (one[0] + one[1]) * (one[0] + one[1]) % P - a - b;
  one[0] = p(g * f), one[1] = p(d * e), one[2] = p(f * d), one[3] = p(g * e);
};
{
  let a: Point = [X, Y, 1n, T], b: Point = [X, Y, 1n, T], z = 33, y = 0, x;
  do {
    G[y++] = b = [a[0], a[1], a[2], a[3]], x = 127;
    do add(G[y++] = b = [b[0], b[1], b[2], b[3]], a); while (--x);
    double(a = [b[0], b[1], b[2], b[3]]);
  } while (--z);
}
const wnaf = (scalar: bigint) => {
  const a: Point = [0n, 1n, 1n, 0n], b: Point = [X, Y, 1n, T];
  let c = <Point> Array(4), d, e, z = 0;
  do d = Number(scalar & 255n),
    scalar >>= 8n,
    d > 128 && (d -= 256, ++scalar),
    e = G[d ? (z << 7) + Math.abs(d) - 1 : z << 7],
    c = [P - e[0], e[1], e[2], P - e[3]],
    d ? add(a, d < 0 ? c : e) : add(b, z & 1 ? c : e); while (++z < 33);
  return a;
};
export const ladder = (scalar: bigint, coordinate: bigint) => {
  let a = 1n, b = 0n, c = coordinate, d = 1n, e = 0n, f, g, z = 254n;
  do f = -(e ^ (e = scalar >> z & 1n)),
    a ^= g = f & (a ^ c),
    c ^= g,
    d ^= f &= b ^ d,
    a -= b ^= f,
    b += a + b,
    f = (c + d) * a % P,
    g = (c - d) * b % P - f,
    d = g * g % P * coordinate % P,
    g += f + f,
    c = g * g % P,
    g = f = b * b % P,
    g -= a = a * a % P,
    a = f * a % P,
    b = (f + g * 121665n % P) * g % P; while (z--);
  b ^= -e & (b ^ d);
  return p((a ^ -e & (a ^ c)) * r(t(b, b = b * b % P * b % P), 3) * b % P) & F;
};
const a_k = async (secret_key: Uint8Array) =>
  a_p(await sha512(secret_key.subarray(0, 32)));
export const generate = async (key: Uint8Array) => e_a(wnaf(await a_k(key)));
export const sign = async (secret_key: Uint8Array, message: Uint8Array) => {
  const a = message.length, b = new Uint8Array(a + 64);
  const c = await sha512(secret_key.subarray(0, 32));
  b.set(c.subarray(32)), b.set(message, 32);
  const d = await s(b.subarray(0, a + 32)), e = a_p(c);
  b.set(e_a(wnaf(d))), b.set(e_a(wnaf(e)), 32), b.set(message, 64);
  c.set(b.subarray(0, 32)), c.set(i_a(p(d + p(await s(b) * e, N), N)), 32);
  return c;
};
export const verify = async (
  public_key: Uint8Array,
  message: Uint8Array,
  signature: Uint8Array,
) => {
  try {
    const a = a_i(signature, 32);
    if (a >= N) return false;
    const b: Point = [0n, 1n, 1n, 0n], c = new Uint8Array(message.length + 64);
    c.set(signature), c.set(public_key, 32), c.set(message, 64);
    let d = await s(c), e = a_e(public_key);
    do d & 1n && add(b, e), double(e); while (d >>= 1n);
    add(b, a_e(signature)), e = wnaf(a);
    return !(p(b[0] * e[2]) ^ p(b[2] * e[0]) | p(b[1] * e[2]) ^ p(b[2] * e[1]));
  } catch {
    return false;
  }
};
export const x25519 = async (
  secret_key: Uint8Array,
  public_key: Uint8Array,
) => {
  const a = a_n(public_key);
  return i_a(ladder(await a_k(secret_key), p((1n + a) * v(1n - a)) & F));
};
