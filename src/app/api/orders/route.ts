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
  const physical = totals.goods > 0;
  if (physical && order.shipping !== "pickup" && (order.city.length < 2 || order.address.length < 4)) {
    return Response.json({ error: "Укажите город и адрес или пункт выдачи" }, { status: 400 });
  }
  if (promo?.kind === "certificate" && !physical) {
    return Response.json({ error: "Сертификатом оплачиваются свечи и наборы, а не другие сертификаты" }, { status: 400 });
  }
  const goodsLines = lines.filter((l) => !l.certificate);
  const certLines = lines.filter((l) => l.certificate);
  const certAmounts = certLines.flatMap((l) => Array<number>(l.qty).fill(l.unitPrice));
  const certRemainder = promo?.kind === "certificate" ? promo.value - totals.discount : 0;
  const shipping = shippingOptions.find((o) => o.id === order.shipping)!;
  const orderId = newOrderId();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const successUrl = `${base}/checkout/success?order=${orderId}`;

  let payUrl: string | null = null;
  let paymentNote = "оплата онлайн не подключена — связаться с клиентом";
  if (totals.total === 0) {
    paymentNote = "полностью оплачен сертификатом";
  } else if (yookassaEnabled()) {
    try {
      const payment = await createPayment({
        orderId,
        amountKopecks: totals.total * 100,
        description: `Заказ ${orderId} в ${site.name}`,
        returnUrl: successUrl,
        email: order.email,
        phone: order.phone,
        goods: allocateReceipt(goodsLines, totals.discount),
        extras: [
          // Продажа сертификата по 54-ФЗ — аванс; уточнить с бухгалтером
          ...certLines.flatMap((l) =>
            Array.from({ length: l.qty }, () => ({
              title: l.title,
              kopecks: l.unitPrice * 100,
              subject: "payment" as const,
              mode: "advance" as const,
            })),
          ),
          ...(totals.giftWrap
            ? [{ title: "Подарочная упаковка", kopecks: totals.giftWrap * 100, subject: "commodity" as const }]
            : []),
          ...(totals.shipping
            ? [{ title: `Доставка: ${shipping.label}`, kopecks: totals.shipping * 100, subject: "service" as const }]
            : []),
        ],
        certificates: certAmounts,
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
      ...lines.map(
        (l) => `• ${e(l.title)} × ${l.qty} = ${formatRub(l.sum)}${l.details ? `\n   ${e(l.details)}` : ""}`,
      ),
      "",
      `Сумма: ${formatRub(totals.subtotal)}`,
      promo ? `Код ${e(promo.code)}: −${formatRub(totals.discount)}` : "",
      totals.giftWrap ? `Подарочная упаковка: ${formatRub(totals.giftWrap)}` : "",
      physical ? `Доставка (${e(shipping.label)}): ${formatRub(totals.shipping)}` : "",
      `<b>Итого: ${formatRub(totals.total)}</b>`,
      "",
      `👤 ${e(order.name)}, ${e(order.phone)}, ${e(order.email)}`,
      !physical
        ? "📧 Только сертификаты, доставка не нужна"
        : order.shipping !== "pickup"
          ? `📦 ${e(order.city)}, ${e(order.address)}`
          : "📦 Самовывоз",
      order.cardText && physical ? `💌 Открытка: ${e(order.cardText)}` : "",
      order.comment ? `💬 ${e(order.comment)}` : "",
      certAmounts.length && !yookassaEnabled()
        ? `🎁 После оплаты выпустите коды: ${certAmounts.map((a) => `npm run code -- gift ${a}`).join("; ")}`
        : "",
      certRemainder > 0
        ? `🎁 Остаток по сертификату ${formatRub(certRemainder)} — выпустите новый код: npm run code -- gift ${certRemainder}`
        : "",
    ]
      .filter((line, i, all) => line !== "" || all[i - 1] !== "")
      .join("\n"),
  );

  return Response.json({ orderId, payUrl, total: totals.total });
}
