import { describe, expect, it } from "vitest";
import { isJwtExpired } from "./jwt";

/** Membuat JWT tiruan. Tanda tangannya asal, karena isJwtExpired tidak memeriksanya. */
function fakeJwt(payload: object) {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "HS256" })}.${encode(payload)}.tanda-tangan`;
}

describe("isJwtExpired", () => {
  const now = Date.parse("2026-11-22T10:00:00Z");
  const nowSeconds = now / 1000;

  it("false kalau exp masih di masa depan", () => {
    expect(isJwtExpired(fakeJwt({ sub: "usr_1", exp: nowSeconds + 60 }), now)).toBe(false);
  });

  it("true kalau exp sudah lewat", () => {
    expect(isJwtExpired(fakeJwt({ sub: "usr_1", exp: nowSeconds - 1 }), now)).toBe(true);
  });

  it("true kalau token rusak atau tidak punya exp", () => {
    expect(isJwtExpired("bukan-token", now)).toBe(true);
    expect(isJwtExpired("a.%%%.c", now)).toBe(true);
    expect(isJwtExpired(fakeJwt({ sub: "usr_1" }), now)).toBe(true);
  });
});
