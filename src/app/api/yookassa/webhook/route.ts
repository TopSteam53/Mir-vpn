import { codeId, createCode, defaultValidUntil } from "@/lib/codes";
import { formatRub } from "@/lib/pricing";
import { escapeHtml, notifyOwner } from "@/lib/telegram";
import { getPayment, yookassaEnabled, type YooPayment } from "@/lib/yookassa";

// Уведомления ЮKassa. Телу запроса не доверяем: статус платежа перепроверяем через API.
export async function POST(request: Request) {
  if (!yookassaEnabled()) return new Response(null, { status: 404 });

  const body = (await request.json().catch(() => null)) as {
    event?: string;
    object?: { id?: string };
  } | null;
  const paymentId = body?.object?.id;
  if (!paymentId || typeof paymentId !== "string") return new Response(null, { status: 400 });

  let payment;
  try {
    payment = await getPayment(paymentId);
  } catch (error) {
    console.error("YooKassa webhook: payment lookup failed", error);
    return new Response(null, { status: 500 }); // ЮKassa повторит уведомление
  }

  const orderId = escapeHtml(payment.metadata?.orderId ?? "без номера");
  const amount = formatRub(Number(payment.amount.value));
  if (payment.status === "succeeded") {
    await notifyOwner(`✅ <b>Заказ ${orderId} оплачен</b>: ${amount}${certificateCodes(payment)}`);
  } else if (payment.status === "canceled") {
    await notifyOwner(`❌ Оплата заказа ${orderId} отменена (${amount})`);
  }
  return new Response(null, { status: 200 });
}

/** Коды купленных сертификатов. Повторное уведомление даёт те же коды: id и срок берутся из платежа. */
function certificateCodes(payment: YooPayment): string {
  const amounts = (payment.metadata?.gc ?? "").split(";").map(Number).filter((n) => n > 0);
  const secret = process.env.RETOUR_SECRET ?? "";
  if (amounts.length === 0) return "";
  if (!secret) return "\n🎁 Задайте RETOUR_SECRET, чтобы выпускать коды сертификатов";
  const paidAt = new Date(payment.created_at ?? Date.now());
  const codes = amounts.map((amount, i) =>
    createCode("GC", amount, secret, defaultValidUntil("GC", paidAt), codeId(`${payment.id}:${i}`)),
  );
  return `\n🎁 Коды сертификатов — отправьте получателям в указанную дату:\n${codes.join("\n")}`;
}

