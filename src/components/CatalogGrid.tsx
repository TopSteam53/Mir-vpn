"use client";

import { useMemo, useState, type ReactNode } from "react";
import { familyLabels, minPrice, type Family, type Product } from "@/data/products";

type Kind = "all" | "moment" | "set";
type Sort = "story" | "price-asc" | "price-desc";

/** Фильтры каталога. Карточки рендерит сервер и передаёт сюда готовыми. */
export function CatalogGrid({ items }: { items: { product: Product; card: ReactNode }[] }) {
  const [kind, setKind] = useState<Kind>("all");
  const [family, setFamily] = useState<Family | "all">("all");
  const [sort, setSort] = useState<Sort>("story");

  const visible = useMemo(() => {
    const filtered = items.filter(({ product }) => {
      if (kind !== "all" && product.kind !== kind) return false;
      if (family !== "all" && (product.kind !== "moment" || product.family !== family)) return false;
      return true;
    });
    if (sort === "story") return filtered;
    return [...filtered].sort((a, b) =>
      sort === "price-asc"
        ? minPrice(a.product) - minPrice(b.product)
        : minPrice(b.product) - minPrice(a.product),
    );
  }, [items, kind, family, sort]);

  const families = Object.entries(familyLabels) as [Family, string][];

  return (
    <>
      <div className="mt-8 flex flex-col gap-4 border-y border-line py-5">
        <div className="flex flex-wrap gap-2" aria-label="Тип">
          {(
            [
              ["all", "Всё"],
              ["moment", "Свечи"],
              ["set", "Наборы"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className="chip"
              aria-pressed={kind === value}
              onClick={() => setKind(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2" aria-label="Семейство ароматов">
          <button type="button" className="chip" aria-pressed={family === "all"} onClick={() => setFamily("all")}>
            Любой аромат
          </button>
          {families.map(([value, label]) => (
            <button
              key={value}
              type="button"
              className="chip"
              aria-pressed={family === value}
              onClick={() => setFamily(value)}
            >
              {label}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-2 text-sm text-muted">
            Сортировка
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-full border border-line bg-surface px-3 py-2 text-ink"
            >
              <option value="story">По историям</option>
              <option value="price-asc">Сначала дешевле</option>
              <option value="price-desc">Сначала дороже</option>
            </select>
          </label>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted" aria-live="polite">
        Найдено: {visible.length}
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(({ product, card }) => (
          <div key={product.slug}>{card}</div>
        ))}
      </div>
      {visible.length === 0 && (
        <p className="py-16 text-center text-muted">Ничего не нашлось — попробуй другой фильтр.</p>
      )}
    </>
  );
}
