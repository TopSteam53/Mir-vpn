"use client";

import Link from "next/link";
import { getProduct } from "@/data/products";
import { shippingOptions } from "@/data/site";
import { getStory } from "@/data/stories";

const FREE_FROM = shippingOptions.find((o) => o.id === "cdek_pvz")?.freeFrom ?? null;
import { BuilderPreview } from "@/components/BuilderPreview";
import { CandleArt } from "@/components/CandleArt";
import { cart, useCart } from "@/lib/cart-store";
import { CUSTOM_SLUG, formatRub, lineKey, MAX_QTY, priceLine } from "@/lib/pricing";

export function CartView() {
  const lines = useCart();
  const rows = lines.map((line) => ({ line, key: lineKey(line), priced: priceLine(line) }));
  const subtotal = rows.reduce((s, r) => s + (typeof r.priced === "string" ? 0 : r.priced.sum), 0);
  const hasErrors = rows.some((r) => typeof r.priced === "string");

  if (lines.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-muted">В корзине пока пусто.</p>
        <Link href="/catalog" className="btn btn-primary mt-6">
          В каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
      <ul className="divide-y divide-line border-y border-line">
        {rows.map(({ line, key, priced }) => {
          const product = getProduct(line.slug);
          const color = product ? getStory(product.storySlug)?.color ?? "#c8862e" : "#c8862e";
          return (
            <li key={key} className="flex gap-4 py-5">
              <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-2xl bg-surface">
                {line.custom ? (
                  <div className="h-20 w-20">
                    <BuilderPreview config={line.custom} />
                  </div>
                ) : (
                  <CandleArt
                    color={color}
                    code={product?.kind === "moment" ? product.code : undefined}
                    name={product?.kind === "moment" ? product.name : undefined}
                    className="h-20"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {typeof priced === "string" ? (
                  <p className="text-error">{priced}</p>
                ) : line.slug === CUSTOM_SLUG ? (
                  <Link href="/builder" className="font-semibold hover:text-amber-strong">
                    {priced.title}
                  </Link>
                ) : (
                  <Link href={`/product/${line.slug}`} className="font-semibold hover:text-amber-strong">
                    {priced.title}
                  </Link>
                )}
                {typeof priced !== "string" && priced.details && (
                  <p className="text-sm text-muted">{priced.details}</p>
                )}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex h-10 items-center rounded-full border border-line">
                    <button
                      type="button"
                      className="h-10 w-10"
                      onClick={() => cart.setQty(key, line.qty - 1)}
                      aria-label="Меньше"
                    >
                      −
                    </button>
                    <span className="w-6 text-center">{line.qty}</span>
                    <button
                      type="button"
                      className="h-10 w-10"
                      onClick={() => cart.setQty(key, Math.min(MAX_QTY, line.qty + 1))}
                      aria-label="Больше"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    {typeof priced !== "string" && <span className="font-semibold">{formatRub(priced.sum)}</span>}
                    <button
                      type="button"
                      className="text-sm text-muted underline underline-offset-4 hover:text-ink"
                      onClick={() => cart.remove(key)}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="h-fit rounded-3xl border border-line bg-surface p-6 lg:sticky lg:top-24">
        <div className="flex justify-between text-lg">
          <span>Товары</span>
          <span className="font-semibold">{formatRub(subtotal)}</span>
        </div>
        {FREE_FROM !== null && subtotal > 0 && (
          <div className="mt-4">
            <p className="text-sm">
              {subtotal >= FREE_FROM
                ? "Доставка до пункта СДЭК — бесплатно"
                : `До бесплатной доставки в пункт СДЭК — ${formatRub(FREE_FROM - subtotal)}`}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
              <div className="h-full rounded-full bg-amber" style={{ width: `${Math.min(100, (subtotal / FREE_FROM) * 100)}%` }} />
            </div>
          </div>
        )}
        <p className="mt-3 text-sm text-muted">
          Доставка, промокод и подарочная упаковка — на следующем шаге.
        </p>
        {hasErrors && (
          <p className="mt-4 text-sm text-error">Удалите недоступные товары, чтобы продолжить.</p>
        )}
        {hasErrors ? (
          <button type="button" className="btn btn-primary mt-6 w-full" disabled>
            Оформить заказ
          </button>
        ) : (
          <Link href="/checkout" className="btn btn-primary mt-6 w-full">
            Оформить заказ
          </Link>
        )}
      </aside>
    </div>
  );
}
