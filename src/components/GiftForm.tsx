"use client";

import Link from "next/link";
import { useState } from "react";
import { GiftCard } from "@/components/GiftCard";
import { GIFT_MESSAGE_MAX, GIFT_NAME_MAX, GIFT_SLUG, giftAmounts, type GiftDetails } from "@/data/gift";
import { cart } from "@/lib/cart-store";
import { reachGoal } from "@/lib/metrika";
import { formatRub, giftError } from "@/lib/pricing";

export function GiftForm({ today }: { today: string }) {
  const [amount, setAmount] = useState<number>(3000);
  const [gift, setGift] = useState<GiftDetails>({ to: "", from: "", email: "", message: "", date: today });
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const update = (patch: Partial<GiftDetails>) => {
    setAdded(false);
    setError(null);
    setGift((g) => ({ ...g, ...patch }));
  };

  function add() {
    const clean = { ...gift, to: gift.to.trim(), from: gift.from.trim(), email: gift.email.trim(), message: gift.message.trim() };
    const problem = giftError(clean);
    if (problem) {
      setError(problem);
      return;
    }
    cart.add({ slug: GIFT_SLUG, amount, gift: clean, qty: 1 });
    reachGoal("gift_add_to_cart");
    setAdded(true);
  }

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_440px]">
      <div className="space-y-8">
        <fieldset>
          <legend className="font-display text-2xl">Номинал</legend>
          <div className="mt-4 grid grid-cols-3 gap-2" role="radiogroup">
            {giftAmounts.map((a) => (
              <button
                key={a}
                type="button"
                role="radio"
                aria-checked={amount === a}
                onClick={() => {
                  setAmount(a);
                  setAdded(false);
                }}
                className="rounded-2xl border border-line p-4 text-center font-display text-2xl transition-colors hover:border-amber aria-checked:border-amber aria-checked:bg-amber/10"
              >
                {formatRub(a)}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted">
            1 500 ₽ — свеча 200 мл, 3 000 ₽ — свеча и набор «Пролог», 5 000 ₽ — целая история.
          </p>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-display text-2xl">Кому и от кого</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm text-muted">Имя получателя</span>
              <input value={gift.to} maxLength={GIFT_NAME_MAX} onChange={(e) => update({ to: e.target.value })} className="field mt-1" />
            </label>
            <label className="block">
              <span className="text-sm text-muted">От кого</span>
              <input value={gift.from} maxLength={GIFT_NAME_MAX} onChange={(e) => update({ from: e.target.value })} className="field mt-1" />
            </label>
            <label className="block">
              <span className="text-sm text-muted">E-mail получателя</span>
              <input
                type="email"
                value={gift.email}
                maxLength={120}
                onChange={(e) => update({ email: e.target.value })}
                placeholder="Можно свой — вручите сами"
                className="field mt-1"
              />
            </label>
            <label className="block">
              <span className="text-sm text-muted">Когда отправить</span>
              <input type="date" value={gift.date} min={today} onChange={(e) => update({ date: e.target.value })} className="field mt-1" />
            </label>
          </div>
          <label className="block">
            <span className="text-sm text-muted">
              Поздравление · {gift.message.length}/{GIFT_MESSAGE_MAX}
            </span>
            <textarea
              value={gift.message}
              maxLength={GIFT_MESSAGE_MAX}
              rows={3}
              onChange={(e) => update({ message: e.target.value })}
              className="field mt-1"
            />
          </label>
        </fieldset>

        <ul className="space-y-1 text-sm text-muted">
          <li>Сертификат придёт письмом с кодом в выбранный день.</li>
          <li>Действует 12 месяцев. Код вводится при оформлении заказа и оплачивает свечи и наборы.</li>
          <li>Если заказ меньше номинала, на остаток пришлём новый код.</li>
        </ul>
      </div>

      <aside>
        <div className="space-y-5 lg:sticky lg:top-24">
          <GiftCard amount={amount} to={gift.to} from={gift.from} message={gift.message} />
          <div className="rounded-3xl border border-line bg-surface p-5">
            <div className="flex items-baseline justify-between">
              <span className="text-muted">Сертификат</span>
              <span className="font-display text-3xl">{formatRub(amount)}</span>
            </div>
            <button type="button" className="btn btn-primary mt-4 w-full" onClick={add}>
              В корзину
            </button>
            <p className="mt-3 min-h-5 text-sm" aria-live="polite">
              {error ? (
                <span className="text-error">{error}</span>
              ) : added ? (
                <>
                  Добавлено.{" "}
                  <Link href="/cart" className="text-amber-strong underline underline-offset-4">
                    Перейти в корзину
                  </Link>
                </>
              ) : null}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
