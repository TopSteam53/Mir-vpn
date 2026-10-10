import { describe, expect, it } from "vitest";
import { createRetourCode, verifyRetourCode } from "@/lib/retour";

const secret = "test-secret";
const until = new Date("2027-04-10T00:00:00Z");
const today = new Date("2026-10-10T00:00:00Z");

describe("Retour codes", () => {
  it("verifies a code it created", () => {
    const code = createRetourCode(450, secret, until, "K7QX");
    expect(code).toMatch(/^RT-450-270410-K7QX-[0-9A-F]{8}$/);
    expect(verifyRetourCode(code.toLowerCase(), secret, today)).toEqual({
      ok: true,
      amount: 450,
      validUntil: "2027-04-10",
    });
  });

  it("rejects a code with a changed amount or another secret", () => {
    const code = createRetourCode(150, secret, until, "AAAA");
    expect(verifyRetourCode(code.replace("RT-150", "RT-950"), secret, today).ok).toBe(false);
    expect(verifyRetourCode(code, "other", today).ok).toBe(false);
  });

  it("rejects an expired code", () => {
    const code = createRetourCode(150, secret, new Date("2026-10-09T00:00:00Z"), "BBBB");
    expect(verifyRetourCode(code, secret, today)).toEqual({ ok: false, reason: "Срок действия промокода истёк" });
  });

  it("refuses to create codes without a secret or with a bad amount", () => {
    expect(() => createRetourCode(150, "", until)).toThrow();
    expect(() => createRetourCode(0, secret, until)).toThrow();
    expect(() => createRetourCode(10_000, secret, until)).toThrow();
  });
});
