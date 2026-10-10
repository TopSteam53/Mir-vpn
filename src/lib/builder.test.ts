import { describe, expect, it } from "vitest";
import { builderError, builderPrice, defaultBuilderConfig, type BuilderConfig } from "@/lib/builder";
import { CUSTOM_SLUG, priceLine } from "@/lib/pricing";

const config = (patch: Partial<BuilderConfig> = {}): BuilderConfig => ({
  ...defaultBuilderConfig,
  title: "Наш отпуск",
  ...patch,
});

describe("candle builder", () => {
  it("prices the default custom blend: 200 ml + bamboo lid + blend", () => {
    expect(builderPrice(config())).toBe(1690 + 120 + 200);
  });

  it("drops the blend surcharge for a ready scent and adds option prices", () => {
    const c = config({ scent: "inej", jar: "black", wick: "wood", wax: "sage", lid: "metal", intensity: "strong", size: "400" });
    expect(builderError(c)).toBeNull();
    expect(builderPrice(c)).toBe(2590 + 150 + 150 + 100 + 150 + 100);
  });

  it("rejects invalid combinations", () => {
    expect(builderError(config({ title: " " }))).toMatch(/название/);
    expect(builderError(config({ size: "mini", wick: "wood" }))).toMatch(/мини/);
    expect(builderError(config({ notes: {} }))).toMatch(/ноту/);
    expect(builderError(config({ notes: { top: "vanilla" } }))).toBe("Неизвестная нота");
    expect(builderError(config({ scent: "neon" }))).toMatch(/недоступен/);
    expect(builderError(config({ jar: "gold" as BuilderConfig["jar"] }))).toMatch(/банку/);
  });

  it("goes through the cart pricing with details for the maker", () => {
    const priced = priceLine({ slug: CUSTOM_SLUG, custom: config({ text: "Сочи, 2026" }), qty: 2 });
    expect(priced).toMatchObject({ title: "Своя свеча «Наш отпуск», 200 мл", sum: 2 * 2010 });
    expect(typeof priced !== "string" && priced.details).toContain("ноты: мандарин, чёрный чай, ваниль");
    expect(priceLine({ slug: CUSTOM_SLUG, qty: 1 })).toBeTypeOf("string");
  });
});
