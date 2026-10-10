import type { Metadata } from "next";
import { CandleBuilder } from "@/components/CandleBuilder";
import { moments } from "@/data/products";
import { stories } from "@/data/stories";

export const metadata: Metadata = {
  title: "Собери свою свечу",
  description:
    "Конструктор свечи AMBRE': выбери банку, аромат из нот, воск, фитиль и напиши своё название на этикетке.",
};

export default function BuilderPage() {
  const onSale = new Set(stories.filter((s) => s.status === "available").map((s) => s.slug));
  const scents = moments
    .filter((m) => onSale.has(m.storySlug))
    .map((m) => ({
      slug: m.slug,
      name: `№ ${m.code} ${m.name} · ${m.title.toLowerCase()}`,
      notes: [m.notes.top, m.notes.heart, m.notes.base].join(" · "),
    }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <p className="eyebrow">Конструктор</p>
      <h1 className="mt-3 font-display text-5xl">Собери свою свечу</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Свой момент — в своей банке. Выбери стекло, аромат, воск и фитиль, придумай название — мы сварим свечу
        вручную и напечатаем этикетку.
      </p>
      <CandleBuilder scents={scents} />
    </div>
  );
}
