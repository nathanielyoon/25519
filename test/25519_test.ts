import { assert, assertEquals } from "jsr:@std/assert@^1.0.0";
import { generate, ladder, sign, verify, x25519 } from "../src/25519.ts";
import { read } from "./read.ts";

const hex = (from: string) =>
  Uint8Array.from(from.match(/../g) ?? [], (Z) => parseInt(Z, 16));
Deno.test(generate.name, async () => {
  await Promise.all(Array.from(
    { length: 4 },
    () =>
      crypto.subtle.generateKey("Ed25519", true, ["sign"]).then((Z) =>
        Promise.all([
          crypto.subtle.exportKey("pkcs8", Z.privateKey),
          crypto.subtle.exportKey("raw", Z.publicKey),
        ])
      ).then((Z) =>
        assertEquals(
          generate(new Uint8Array(Z[0]).subarray(16)),
          new Uint8Array(Z[1]),
        )
      ),
  ));
});
Deno.test(sign.name, () =>
  Promise.all(Array.from({ length: 32 }, (_, Z) => {
    const a = crypto.getRandomValues(new Uint8Array(48));
    a.set([48, 46, 2, 1, 0, 48, 5, 6, 3, 43, 101, 112, 4, 34, 4, 32]);
    const b = crypto.getRandomValues(new Uint8Array(Z));
    return crypto.subtle.importKey("pkcs8", a, "Ed25519", false, ["sign"])
      .then((Y) => crypto.subtle.sign("Ed25519", Y, b))
      .then((Y) => assertEquals(sign(a.subarray(16), b), new Uint8Array(Y)));
  })).then());
Deno.test(verify.name, () => {
  const a = new Uint8Array(32), b = new Uint8Array(32);
  for (let z = 0; z < 4; ++z) {
    const d = sign(crypto.getRandomValues(a), crypto.getRandomValues(b));
    const e = generate(a);
    assert(verify(e, b, d), "verify correct signature");
    ++e[0], assert(!verify(e, b, d), "don't change public key");
    --e[0], ++b[0], assert(!verify(e, b, d), "don't change message");
    --b[0], ++d[0], assert(!verify(e, b, d), "don't change signature");
  }
  const d = generate(crypto.getRandomValues(a));
  const e = sign(a, crypto.getRandomValues(b));
  assert(!verify(d, b, new Uint8Array(e).fill(-1, 0, 32)), "bad point");
  assert(!verify(d, b, new Uint8Array(e).fill(-1, 32)), "too big");
  assert(
    !verify(hex(BigInt("1" + "0".repeat(73)).toString(16)).reverse(), b, e),
    "bad public key",
  );
  assert(
    !verify(hex((1n | 1n << 255n).toString(16)).reverse(), b, e),
    "another bad point",
  );
});
Deno.test("rfc 8032", async () => {
  const a = await read("rfc8032.txt");
  const b = a.slice(
    a.indexOf("Test Vectors for Ed25519\n"),
    a.indexOf("Test Vectors for Ed25519ctx\n"),
  ).replace(/Josefsson & Liusvaara[\s -~]+?January 2017/g, "");
  for (const c of ["1", "2", "3", "1024", "SHA(abc)"]) {
    const d = RegExp(
      `-----TEST ${
        c.replace(/[()]/g, "\\$&")
      }\\s+ALGORITHM:\\s+Ed25519\\s+SECRET KEY:([\\s\\da-f]+)PUBLIC KEY:([\\s\\da-f]+)MESSAGE \\(length \\d+ bytes?\\):([\\s\\da-f]+)SIGNATURE:([\\s\\da-f]+)`,
      "s",
    ).exec(b)!.slice(1).map((Z) => hex(Z.replace(/\s/g, "")));
    const e = d[0], f = d[1], g = d[2], h = d[3];
    assertEquals(generate(e), f, `test ${c} generate`);
    assertEquals(sign(e, g), h, `test ${c} sign`);
    assert(verify(f, g, h), `test ${c} verify`);
  }
});
Deno.test(x25519.name, () => {
  const a = new Uint8Array(32);
  const b = new Uint8Array(32);
  for (let z = 0; z < 8; ++z) {
    const c = generate(crypto.getRandomValues(a));
    const d = generate(crypto.getRandomValues(b));
    assertEquals(x25519(a, d), x25519(b, c), "same");
  }
});
Deno.test("rfc 7748", async () => {
  const a = await read("rfc7748.txt");
  const b = a.slice(18623, 19695).match(/[\da-f]{64}/g)!;
  const c = (bytes: Uint8Array) =>
    new BigUint64Array(bytes.buffer).reduce(
      (Z, Y, X) => Z + (Y << BigInt(X << 6)),
      0n,
    );
  const d = (k: bigint) => k & ~7n & ~(1n << 255n) | 1n << 254n;
  for (let z = 0; z < 2; ++z) {
    assertEquals(
      ladder(d(c(hex(b[z * 3]))), c(hex(b[z * 3 + 1])) & ~(1n << 255n)),
      c(hex(b[z * 3 + 2])),
      "5.2 test 1",
    );
  }
  const e = a.slice(21869, 22553).match(/[\da-f]{64}/g)!;
  0 || (e.pop(), e.pop());
  let f = c(hex(e[0])), g = f, h, z = 0, y = 0;
  while (++z < e.length) {
    const i = +`1${"0".repeat(z * 3 - 3)}`;
    do h = ladder(d(f), g & ~(1n << 255n)), g = f, f = h; while (++y < i);
    assertEquals(f, c(hex(e[z])), "5.2 test 2");
  }
});
