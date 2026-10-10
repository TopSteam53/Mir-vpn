import "server-only";
import type { ReceiptItem } from "@/lib/pricing";

const API = "https://api.yookassa.ru/v3";

export function yookassaEnabled(): boolean {
  return Boolean(process.env.YOOKASSA_SHOP_ID && process.env.YOOKASSA_SECRET_KEY);
}

function authHeader(): string {
  const raw = `${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
}

function money(kopecks: number) {
  return { value: (kopecks / 100).toFixed(2), currency: "RUB" };
}

export type YooPayment = {
  id: string;
  status: "pending" | "waiting_for_capture" | "succeeded" | "canceled";
  paid: boolean;
  amount: { value: string; currency: string };
  metadata?: Record<string, string>;
  confirmation?: { type: string; confirmation_url?: string };
};

type ReceiptExtra = { title: string; kopecks: number; subject: "commodity" | "service" };

export async function createPayment(input: {
  orderId: string;
  amountKopecks: number;
  description: string;
  returnUrl: string;
  email: string;
  phone: string;
  goods: ReceiptItem[];
  extras: ReceiptExtra[];
}): Promise<YooPayment> {
  const body: Record<string, unknown> = {
    amount: money(input.amountKopecks),
    capture: true,
    confirmation: { type: "redirect", return_url: input.returnUrl },
    description: input.description.slice(0, 128),
    metadata: { orderId: input.orderId },
  };

  // Чеки по 54-ФЗ передаём, только если в ЮKassa подключена онлайн-касса или «Чеки от ЮKassa».
  if (process.env.YOOKASSA_SEND_RECEIPT === "true") {
    const vat = Number(process.env.YOOKASSA_VAT_CODE ?? 1); // 1 — без НДС
    body.receipt = {
      customer: { email: input.email, phone: input.phone.replace(/\D/g, "") },
      items: [
        ...input.goods.map((item) => ({
          description: item.title.slice(0, 128),
          quantity: item.qty.toFixed(2),
          amount: money(item.unitKopecks),
          vat_code: vat,
          payment_mode: "full_prepayment",
          payment_subject: "commodity",
        })),
        ...input.extras.map((item) => ({
          description: item.title,
          quantity: "1.00",
          amount: money(item.kopecks),
          vat_code: vat,
          payment_mode: "full_prepayment",
          payment_subject: item.subject,
        })),
      ],
    };
  }

  const res = await fetch(`${API}/payments`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Idempotence-Key": input.orderId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`YooKassa ${res.status}: ${await res.text()}`);
  return (await res.json()) as YooPayment;
}

export async function getPayment(id: string): Promise<YooPayment> {
  const res = await fetch(`${API}/payments/${encodeURIComponent(id)}`, {
    headers: { Authorization: authHeader() },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`YooKassa ${res.status}: ${await res.text()}`);
  return (await res.json()) as YooPayment;
}
