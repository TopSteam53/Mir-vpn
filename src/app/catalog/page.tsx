import type { Metadata } from "next";
import Link from "next/link";
import { CatalogGrid } from "@/components/CatalogGrid";
import { GiftCard } from "@/components/GiftCard";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/products";
import { stories } from "@/data/stories";

export const metadata: Metadata = {
  title: "Каталог свечей",
  description: "Ароматические свечи AMBRE' из растительного воска: моменты в трёх объёмах и подарочные наборы.",
};

export default function CatalogPage() {
  const availableStories = new Set(stories.filter((s) => s.status === "available").map((s) => s.slug));
  const items = products
    .filter((p) => availableStories.has(p.storySlug))
    .map((product) => ({ product, card: <ProductCard product={product} /> }));
  const upcoming = stories.filter((s) => s.status === "soon");

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <p className="eyebrow">Магазин</p>
      <h1 className="mt-3 font-display text-5xl">Каталог</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Каждый момент — в трёх объёмах: мини 70 мл, 200 мл и 400 мл с двумя фитилями.
      </p>

      <CatalogGrid items={items} />

      <Link
        href="/gift"
        className="mt-16 grid items-center gap-6 rounded-3xl border border-line bg-surface p-6 transition-colors hover:border-amber sm:grid-cols-[240px_1fr] sm:p-8"
      >
        <GiftCard amount={3000} />
        <div>
          <h2 className="font-display text-3xl">Подарочный сертификат</h2>
          <p className="mt-2 text-muted">
            На 1 500, 3 000 или 5 000 ₽. Придёт получателю письмом в выбранный день, действует 12 месяцев.
          </p>
          <span className="mt-4 inline-block text-amber-strong underline underline-offset-4">Выбрать сертификат</span>
        </div>
      </Link>

      {upcoming.length > 0 && (
        <section className="mt-16 rounded-3xl border border-line p-8">
          <h2 className="font-display text-3xl">Скоро</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {upcoming.map((s) => (
              <li key={s.slug}>
                <Link href={`/stories/${s.slug}`} className="block rounded-2xl border border-line p-4 hover:border-amber">
                  <span className="flex items-center gap-2 font-semibold">
                    <span className="h-2 w-2 rounded-full" style={{ background: s.color }} aria-hidden="true" />
                    {s.title}
                  </span>
                  <span className="mt-1 block text-sm text-muted">Выход: {s.release}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
