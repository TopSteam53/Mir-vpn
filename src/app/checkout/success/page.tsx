import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderSuccess } from "@/components/OrderSuccess";

export const metadata: Metadata = { title: "Спасибо за заказ", robots: { index: false } };

export default function SuccessPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="eyebrow">Заказ принят</p>
      <h1 className="mt-4 font-display text-5xl">Спасибо!</h1>
      <Suspense fallback={<p className="mt-6 text-lg text-muted">Загружаем данные заказа…</p>}>
        <OrderSuccess />
      </Suspense>
    </div>
  );
}
