import { describe, expect, it } from "vitest";
import { allocateReceipt, computeTotals, priceLine, type PricedLine } from "@/lib/pricing";

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
    expect(t).toEqual({ subtotal: 2780, discount: 278, giftWrap: 390, shipping: 390, total: 3282 });
  });

  it("caps a Retour discount at 30% of goods", () => {
    const t = computeTotals([line(590)], "pickup", false, { code: "RT", kind: "retour", value: 450, label: "" });
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
