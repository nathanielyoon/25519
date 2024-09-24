import { assertEquals } from "jsr:@std/assert@^1.0.0";
import { sha512 } from "../src/sha2.ts";
import { read } from "./read.ts";

Deno.test("NIST FIPS 180-4", async () => {
  const a = await Promise.all(
    ["Short", "Long"].map((Z) => read(`SHA512${Z}Msg.rsp`)),
  ).then((Z) => Z[0] + Z[1]);
  const b = [...a.matchAll(/Len = (\d+)\s+Msg = (\S+)\s+MD = (\S+)/g)];
  for (let z = 0; z < 257; ++z) {
    const c = [b[z][2].slice(0, +b[z][1] << 1), b[z][3]].map((Z) =>
      Uint8Array.from(Z.match(/../g) ?? [], (Y) => parseInt(Y, 16))
    );
    assertEquals(sha512(c[0]), c[1], "sha512");
  }
});
