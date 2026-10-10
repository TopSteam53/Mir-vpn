import { describe, expect, it } from "vitest";
import { codeId, createCode, defaultValidUntil, verifyCode } from "@/lib/codes";

const secret = "test-secret";
const until = new Date("2027-04-10T00:00:00Z");
const today = new Date("2026-10-10T00:00:00Z");

describe("signed codes", () => {
  it("verifies a code it created", () => {
    const code = createCode("RT", 450, secret, until, "K7QX");
    expect(code).toMatch(/^RT-450-270410-K7QX-[0-9A-F]{8}$/);
    expect(verifyCode(code.toLowerCase(), secret, today)).toEqual({
      ok: true,
      kind: "RT",
      amount: 450,
      validUntil: "2027-04-10",
    });
  });

  it("rejects a code with a changed amount, kind or another secret", () => {
    const code = createCode("RT", 150, secret, until, "AAAA");
    expect(verifyCode(code.replace("RT-150", "RT-950"), secret, today).ok).toBe(false);
    expect(verifyCode(code.replace("RT-", "GC-"), secret, today).ok).toBe(false);
    expect(verifyCode(code, "other", today).ok).toBe(false);
  });

  it("rejects an expired code", () => {
    const code = createCode("GC", 3000, secret, new Date("2026-10-09T00:00:00Z"), "BBBB");
    expect(verifyCode(code, secret, today)).toEqual({ ok: false, reason: "Срок действия кода истёк" });
  });

  it("refuses bad amounts per kind and missing secret", () => {
    expect(() => createCode("RT", 150, "", until)).toThrow();
    expect(() => createCode("RT", 0, secret, until)).toThrow();
    expect(() => createCode("RT", 10_000, secret, until)).toThrow();
    expect(createCode("GC", 10_000, secret, until)).toMatch(/^GC-10000-/);
  });

  it("makes stable ids from a seed and gives certificates a year", () => {
    expect(codeId("payment-1:0")).toBe(codeId("payment-1:0"));
    expect(codeId("payment-1:0")).not.toBe(codeId("payment-1:1"));
    expect(defaultValidUntil("GC", today).toISOString().slice(0, 10)).toBe("2027-10-10");
    expect(defaultValidUntil("PB", today).toISOString().slice(0, 10)).toBe("2027-04-10");
  });
});
