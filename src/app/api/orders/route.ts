import { randomBytes } from "node:crypto";
import { shippingOptions, site } from "@/data/site";
import {
  allocateReceipt,
  computeTotals,
  formatRub,
  priceLine,
  type PricedLine,
} from "@/lib/pricing";
import { resolvePromo } from "@/lib/promo";
import { firstIssue, orderSchema } from "@/lib/schemas";
import { escapeHtml, notifyOwner } from "@/lib/telegram";
import { createPayment, yookassaEnabled } from "@/lib/yookassa";

function newOrderId(): string {
  const date = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  return `A-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = orderSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }
  const order = parsed.data;

  const lines: PricedLine[] = [];
  for (const item of order.items) {
    const priced = priceLine(item);
    if (typeof priced === "string") return Response.json({ error: priced }, { status: 400 });
    lines.push(priced);
  }

  const promoResult = resolvePromo(order.promoCode);
  if (promoResult && !promoResult.ok) {
    return Response.json({ error: promoResult.reason }, { status: 400 });
  }
  const promo = promoResult?.ok ? promoResult.promo : null;
  const totals = computeTotals(lines, order.shipping, order.giftWrap, promo);
  const shipping = shippingOptions.find((o) => o.id === order.shipping)!;
  const orderId = newOrderId();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const successUrl = `${base}/checkout/success?order=${orderId}`;

  let payUrl: string | null = null;
  let paymentNote = "оплата онлайн не подключена — связаться с клиентом";
  if (yookassaEnabled()) {
    try {
      const payment = await createPayment({
        orderId,
        amountKopecks: totals.total * 100,
        description: `Заказ ${orderId} в ${site.name}`,
        returnUrl: successUrl,
        email: order.email,
        phone: order.phone,
        goods: allocateReceipt(lines, totals.discount),
        extras: [
          ...(totals.giftWrap
            ? [{ title: "Подарочная упаковка", kopecks: totals.giftWrap * 100, subject: "commodity" as const }]
            : []),
          ...(totals.shipping
            ? [{ title: `Доставка: ${shipping.label}`, kopecks: totals.shipping * 100, subject: "service" as const }]
            : []),
        ],
      });
      payUrl = payment.confirmation?.confirmation_url ?? null;
      paymentNote = `ожидает оплаты (ЮKassa ${payment.id})`;
    } catch (error) {
      console.error("Payment creation failed", error);
      return Response.json(
        { error: "Не получилось создать платёж. Попробуйте ещё раз или напишите нам." },
        { status: 502 },
      );
    }
  }

  const e = escapeHtml;
  await notifyOwner(
    [
      `<b>Новый заказ ${orderId}</b> — ${paymentNote}`,
      "",
      ...lines.map((l) => `• ${e(l.title)} × ${l.qty} = ${formatRub(l.sum)}`),
      "",
      `Товары: ${formatRub(totals.subtotal)}`,
      promo ? `Промокод ${e(promo.code)}: −${formatRub(totals.discount)}` : "",
      totals.giftWrap ? `Подарочная упаковка: ${formatRub(totals.giftWrap)}` : "",
      `Доставка (${e(shipping.label)}): ${formatRub(totals.shipping)}`,
      `<b>Итого: ${formatRub(totals.total)}</b>`,
      "",
      `👤 ${e(order.name)}, ${e(order.phone)}, ${e(order.email)}`,
      order.shipping !== "pickup" ? `📦 ${e(order.city)}, ${e(order.address)}` : "📦 Самовывоз",
      order.cardText ? `💌 Открытка: ${e(order.cardText)}` : "",
      order.comment ? `💬 ${e(order.comment)}` : "",
    ]
      .filter((line, i, all) => line !== "" || all[i - 1] !== "")
      .join("\n"),
  );

  return Response.json({ orderId, payUrl, total: totals.total });
}
