"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product, VariantId } from "@/data/products";
import { cart } from "@/lib/cart-store";
import { reachGoal } from "@/lib/metrika";
import { formatRub, MAX_QTY } from "@/lib/pricing";

type PickOption = { slug: string; name: string; label: string };

export function AddToCart({ product, pickOptions = [] }: { product: Product; pickOptions?: PickOption[] }) {
  const [variant, setVariant] = useState<VariantId>("200");
  const [picks, setPicks] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const needPicks = product.kind === "set" ? product.picks : 0;
  const price =
    product.kind === "moment"
      ? product.variants.find((v) => v.id === variant)!.price
      : product.price;
  const ready = picks.length === needPicks;

  function togglePick(slug: string) {
    setAdded(false);
    setPicks((current) =>
      current.includes(slug)
        ? current.filter((s) => s !== slug)
        : current.length < needPicks
          ? [...current, slug]
          : current,
    );
  }

  function add() {
    cart.add({
      slug: product.slug,
      variant: product.kind === "moment" ? variant : undefined,
      picks: needPicks ? picks : undefined,
      qty,
    });
    reachGoal("add_to_cart");
    setAdded(true);
  }

  return (
    <div className="space-y-6">
      {product.kind === "moment" && (
        <fieldset>
          <legend className="eyebrow">Объём</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-3" role="radiogroup">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={variant === v.id}
                onClick={() => {
                  setVariant(v.id);
                  setAdded(false);
                }}
                className="rounded-2xl border border-line p-3 text-left transition-colors aria-checked:border-amber aria-checked:bg-amber/10"
              >
                <span className="block font-semibold">{v.label}</span>
                <span className="block text-sm text-muted">
                  ~{v.burnHours} ч · {formatRub(v.price)}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {needPicks > 0 && (
        <fieldset>
          <legend className="eyebrow">
            Выбери {needPicks} момента · выбрано {picks.length}
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {pickOptions.map((o) => (
              <button
                key={o.slug}
                type="button"
                role="checkbox"
                aria-checked={picks.includes(o.slug)}
                onClick={() => togglePick(o.slug)}
                disabled={!picks.includes(o.slug) && picks.length >= needPicks}
                className="chip disabled:opacity-40"
              >
                {o.label} · {o.name}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-12 items-center rounded-full border border-line">
          <button
            type="button"
            className="h-12 w-12 text-lg"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Меньше"
          >
            −
          </button>
          <span className="w-8 text-center" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            className="h-12 w-12 text-lg"
            onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
            aria-label="Больше"
          >
            +
          </button>
        </div>
        <button type="button" className="btn btn-primary flex-1 sm:flex-none" onClick={add} disabled={!ready}>
          В корзину · {formatRub(price * qty)}
        </button>
      </div>

      <p className="min-h-6 text-sm" aria-live="polite">
        {added && (
          <>
            Добавлено.{" "}
            <Link href="/cart" className="text-amber-strong underline underline-offset-4">
              Перейти в корзину
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
