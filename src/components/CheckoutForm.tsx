"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { GIFT_WRAP_PRICE, shippingOptions, type ShippingId } from "@/data/site";
import { useCart } from "@/lib/cart-store";
import { reachGoal } from "@/lib/metrika";
import { computeTotals, formatRub, priceLine, type PricedLine, type Promo } from "@/lib/pricing";

export function CheckoutForm() {
  const router = useRouter();
  const lines = useCart();
  const [shipping, setShipping] = useState<ShippingId>("cdek_pvz");
  const [giftWrap, setGiftWrap] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<Promo | null>(null);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const priced = lines.map(priceLine);
  const valid = priced.filter((p): p is PricedLine => typeof p !== "string");
  const totals = computeTotals(valid, shipping, giftWrap, promo);
  const option = shippingOptions.find((o) => o.id === shipping)!;

  if (lines.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-muted">Корзина пуста.</p>
        <Link href="/catalog" className="btn btn-primary mt-6">
          В каталог
        </Link>
      </div>
    );
  }

  async function applyPromo() {
    setPromoMessage(null);
    const res = await fetch("/api/promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: promoInput }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok && data?.promo) {
      setPromo(data.promo as Promo);
      setPromoMessage((data.promo as Promo).label);
    } else {
      setPromo(null);
      setPromoMessage(data?.error ?? "Не удалось проверить промокод");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "");
    setSending(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: text("name"),
          phone: text("phone"),
          email: text("email"),
          shipping,
          city: text("city"),
          address: text("address"),
          comment: text("comment"),
          giftWrap,
          cardText: giftWrap ? text("cardText") : "",
          promoCode: promo?.code ?? "",
          consent: form.get("consent") === "on",
          website: text("website"),
          items: lines,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.orderId) {
        setError(data?.error ?? "Не получилось оформить заказ. Попробуйте ещё раз.");
        return;
      }
      reachGoal("order_created");
      if (data.payUrl) {
        window.location.assign(data.payUrl);
      } else {
        router.push(`/checkout/success?order=${encodeURIComponent(data.orderId)}&manual=1`);
      }
    } catch {
      setError("Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]" noValidate>
      <div className="space-y-10">
        <fieldset className="space-y-4">
          <legend className="font-display text-2xl">Контакты</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm text-muted">Имя и фамилия</span>
              <input name="name" required autoComplete="name" className="field mt-1" />
            </label>
            <label className="block">
              <span className="text-sm text-muted">Телефон</span>
              <input name="phone" type="tel" required autoComplete="tel" placeholder="+7" className="field mt-1" />
            </label>
            <label className="block">
              <span className="text-sm text-muted">E-mail (пришлём чек)</span>
              <input name="email" type="email" required autoComplete="email" className="field mt-1" />
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-display text-2xl">Доставка</legend>
          <div className="grid gap-2" role="radiogroup">
            {shippingOptions.map((o) => (
              <label
                key={o.id}
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-4 has-[:checked]:border-amber"
              >
                <input
                  type="radio"
                  name="shipping"
                  value={o.id}
                  checked={shipping === o.id}
                  onChange={() => setShipping(o.id)}
                  className="mt-1 accent-[var(--amber)]"
                />
                <span className="flex-1">
                  <span className="block font-semibold">{o.label}</span>
                  <span className="block text-sm text-muted">
                    {o.hint}
                    {o.freeFrom ? ` · бесплатно от ${formatRub(o.freeFrom)}` : ""}
                  </span>
                </span>
                <span className="font-semibold">{o.price ? formatRub(o.price) : "0 ₽"}</span>
              </label>
            ))}
          </div>
          {option.needsAddress && (
            <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
              <label className="block">
                <span className="text-sm text-muted">Город</span>
                <input name="city" required autoComplete="address-level2" className="field mt-1" />
              </label>
              <label className="block">
                <span className="text-sm text-muted">
                  {shipping === "cdek_pvz" ? "Адрес пункта СДЭК или «подберите ближайший»" : "Адрес и индекс"}
                </span>
                <input name="address" required autoComplete="street-address" className="field mt-1" />
              </label>
            </div>
          )}
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-display text-2xl">В подарок?</legend>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={giftWrap}
              onChange={(e) => setGiftWrap(e.target.checked)}
              className="h-5 w-5 accent-[var(--amber)]"
            />
            <span>Подарочная упаковка и открытка (+{formatRub(GIFT_WRAP_PRICE)})</span>
          </label>
          {giftWrap && (
            <label className="block">
              <span className="text-sm text-muted">Текст открытки (до 300 символов)</span>
              <textarea name="cardText" maxLength={300} rows={3} className="field mt-1" />
            </label>
          )}
          <label className="block">
            <span className="text-sm text-muted">Комментарий к заказу</span>
            <textarea name="comment" maxLength={1000} rows={3} className="field mt-1" />
          </label>
        </fieldset>

        {/* ловушка для ботов */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      </div>

      <aside className="h-fit space-y-5 rounded-3xl border border-line bg-surface p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-2xl">Ваш заказ</h2>
        <ul className="space-y-2 text-sm">
          {priced.map((p, i) =>
            typeof p === "string" ? (
              <li key={i} className="text-error">{p}</li>
            ) : (
              <li key={i} className="flex justify-between gap-3">
                <span>
                  {p.title} × {p.qty}
                  {p.details && <span className="block text-xs text-muted">{p.details}</span>}
                </span>
                <span className="shrink-0">{formatRub(p.sum)}</span>
              </li>
            ),
          )}
        </ul>

        <div>
          <label className="text-sm text-muted" htmlFor="promo">
            Промокод или код Retour
          </label>
          <div className="mt-1 flex gap-2">
            <input
              id="promo"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              className="field"
              autoComplete="off"
            />
            <button type="button" className="btn btn-ghost shrink-0 px-4" onClick={applyPromo} disabled={!promoInput.trim()}>
              Применить
            </button>
          </div>
          {promoMessage && (
            <p className={`mt-2 text-sm ${promo ? "text-amber-strong" : "text-error"}`} aria-live="polite">
              {promoMessage}
            </p>
          )}
        </div>

        <dl className="space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt>Товары</dt>
            <dd>{formatRub(totals.subtotal)}</dd>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between text-amber-strong">
              <dt>Скидка</dt>
              <dd>−{formatRub(totals.discount)}</dd>
            </div>
          )}
          {totals.giftWrap > 0 && (
            <div className="flex justify-between">
              <dt>Упаковка</dt>
              <dd>{formatRub(totals.giftWrap)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt>Доставка</dt>
            <dd>{totals.shipping ? formatRub(totals.shipping) : "бесплатно"}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold">
            <dt>Итого</dt>
            <dd>{formatRub(totals.total)}</dd>
          </div>
        </dl>

        <label className="flex gap-3 text-sm text-muted">
          <input type="checkbox" name="consent" required className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--amber)]" />
          <span>
            Согласен(на) с <Link href="/legal/offer" className="underline">офертой</Link> и даю согласие на обработку
            персональных данных по <Link href="/legal/privacy" className="underline">политике</Link>.
          </span>
        </label>

        {error && (
          <p className="text-sm text-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary w-full" disabled={sending || valid.length !== lines.length}>
          {sending ? "Оформляем…" : `Оформить заказ · ${formatRub(totals.total)}`}
        </button>
        <p className="text-xs text-muted">Оплата картой или через СБП на защищённой странице ЮKassa.</p>
      </aside>
    </form>
  );
}
