import { formatRub } from "@/lib/pricing";
import { escapeHtml, notifyOwner } from "@/lib/telegram";
import { getPayment, yookassaEnabled } from "@/lib/yookassa";

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
    await notifyOwner(`✅ <b>Заказ ${orderId} оплачен</b>: ${amount}`);
  } else if (payment.status === "canceled") {
    await notifyOwner(`❌ Оплата заказа ${orderId} отменена (${amount})`);
  }
  return new Response(null, { status: 200 });
}
