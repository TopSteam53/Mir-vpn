import { describe, expect, it } from "vitest";
import { allocateReceipt, computeTotals, lineKey, priceLine, type PricedLine } from "@/lib/pricing";

const line = (sum: number, qty = 1): PricedLine => ({ title: "x", unitPrice: sum / qty, qty, sum });

describe("priceLine", () => {
  it("prices a moment by its variant", () => {
    expect(priceLine({ slug: "inej", variant: "200", qty: 2 })).toMatchObject({
      unitPrice: 1390,
      sum: 2780,
    });
  });

  it("rejects products from stories that are not on sale yet", () => {
    expect(priceLine({ slug: "neon", variant: "200", qty: 1 })).toBeTypeOf("string");
  });

  it("rejects unknown products, missing variants and bad quantities", () => {
    expect(priceLine({ slug: "nope", qty: 1 })).toBeTypeOf("string");
    expect(priceLine({ slug: "inej", qty: 1 })).toBeTypeOf("string");
    expect(priceLine({ slug: "inej", variant: "200", qty: 0 })).toBeTypeOf("string");
    expect(priceLine({ slug: "inej", variant: "200", qty: 1.5 })).toBeTypeOf("string");
  });

  it("requires exactly N distinct moments of the same story for a pick set", () => {
    const picks = ["inej", "cedra", "iskry"];
    expect(priceLine({ slug: "prolog-dekabr", picks, qty: 1 })).toMatchObject({ sum: 1490 });
    expect(priceLine({ slug: "prolog-dekabr", picks: picks.slice(0, 2), qty: 1 })).toBeTypeOf("string");
    expect(
      priceLine({ slug: "prolog-dekabr", picks: ["inej", "inej", "iskry"], qty: 1 }),
    ).toBeTypeOf("string");
    expect(
      priceLine({ slug: "prolog-dekabr", picks: ["inej", "neon", "iskry"], qty: 1 }),
    ).toBeTypeOf("string");
  });
});

describe("computeTotals", () => {
  it("applies percent promo, gift wrap and paid shipping", () => {
    const t = computeTotals([line(2780, 2)], "cdek_pvz", true, {
      code: "WELCOME10",
      kind: "percent",
      value: 10,
      label: "",
    });
    expect(t).toEqual({ goods: 2780, subtotal: 2780, discount: 278, giftWrap: 390, shipping: 390, total: 3282 });
  });

  it("caps a Retour discount at 30% of goods", () => {
    const t = computeTotals([line(590)], "pickup", false, { code: "RT", kind: "fixed", value: 450, label: "" });
    expect(t.discount).toBe(177);
    expect(t.total).toBe(413);
  });

  it("makes CDEK pickup free from 5000 ₽ after discount", () => {
    expect(computeTotals([line(5000)], "cdek_pvz", false, null).shipping).toBe(0);
    const percent = { code: "W", kind: "percent", value: 10, label: "" } as const;
    expect(computeTotals([line(5000)], "cdek_pvz", false, percent).shipping).toBe(390);
  });
});

describe("allocateReceipt", () => {
  it("keeps the receipt sum equal to the paid amount", () => {
    const lines = [line(4170, 3), line(1490), line(590)];
    const discount = 625;
    const items = allocateReceipt(lines, discount);
    const total = items.reduce((s, i) => s + i.qty * i.unitKopecks, 0);
    expect(total).toBe((4170 + 1490 + 590 - discount) * 100);
    expect(items.reduce((s, i) => s + i.qty, 0)).toBe(5);
  });

  it("returns lines unchanged without a discount", () => {
    expect(allocateReceipt([line(2780, 2)], 0)).toEqual([{ title: "x", qty: 2, unitKopecks: 139000 }]);
  });
});

describe("wick choice", () => {
  it("adds the wooden wick surcharge and names it", () => {
    expect(priceLine({ slug: "cedra", variant: "200", wick: "wood", qty: 2 })).toMatchObject({
      title: "№ 102 Цедра, 200 мл, деревянный фитиль",
      unitPrice: 1540,
      sum: 3080,
    });
  });

  it("rejects a wooden wick in a mini candle", () => {
    expect(priceLine({ slug: "cedra", variant: "mini", wick: "wood", qty: 1 })).toBeTypeOf("string");
  });

  it("keeps cotton and wooden lines apart in the cart", () => {
    expect(lineKey({ slug: "cedra", variant: "200", wick: "wood" })).not.toBe(
      lineKey({ slug: "cedra", variant: "200", wick: "cotton" }),
    );
    expect(lineKey({ slug: "cedra", variant: "200", wick: "cotton" })).toBe(lineKey({ slug: "cedra", variant: "200" }));
  });
});

describe("gift certificates", () => {
  const gift = { to: "Аня", from: "Миша", email: "anya@example.ru", message: "С Новым годом!", date: "2099-01-01" };
  const today = new Date().toISOString().slice(0, 10);

  it("prices a certificate as a non-goods line", () => {
    const priced = priceLine({ slug: "gift-certificate", amount: 3000, gift: { ...gift, date: today }, qty: 1 });
    expect(priced).toMatchObject({ certificate: true, sum: 3000 });
    expect(typeof priced !== "string" && priced.title).toMatch(/^Подарочный сертификат на 3\s000 ₽$/);
  });

  it("rejects odd amounts, bad e-mails and dates out of range", () => {
    expect(priceLine({ slug: "gift-certificate", amount: 2000, gift: { ...gift, date: today }, qty: 1 })).toBeTypeOf("string");
    expect(
      priceLine({ slug: "gift-certificate", amount: 3000, gift: { ...gift, email: "nope", date: today }, qty: 1 }),
    ).toBeTypeOf("string");
    expect(priceLine({ slug: "gift-certificate", amount: 3000, gift, qty: 1 })).toBeTypeOf("string");
    expect(priceLine({ slug: "gift-certificate", amount: 3000, qty: 1 })).toBeTypeOf("string");
  });

  it("keeps certificates out of discounts and shipping", () => {
    const cert = { title: "c", unitPrice: 3000, qty: 1, sum: 3000, certificate: true };
    const percent = { code: "W", kind: "percent", value: 10, label: "" } as const;
    expect(computeTotals([cert], "cdek_pvz", true, percent)).toEqual({
      goods: 0,
      subtotal: 3000,
      discount: 0,
      giftWrap: 0,
      shipping: 0,
      total: 3000,
    });
  });

  it("pays goods with a certificate but keeps free shipping and charges delivery", () => {
    const gc = { code: "GC", kind: "certificate", value: 3000, label: "" } as const;
    expect(computeTotals([line(2780)], "cdek_pvz", false, gc)).toMatchObject({ discount: 2780, shipping: 390, total: 390 });
    expect(computeTotals([line(5560)], "cdek_pvz", false, gc)).toMatchObject({ discount: 3000, shipping: 0, total: 2560 });
  });
});

describe("samples set", () => {
  it("is sold as a regular set", () => {
    expect(priceLine({ slug: "probniki-dekabr", qty: 2 })).toMatchObject({ sum: 780 });
  });
});
