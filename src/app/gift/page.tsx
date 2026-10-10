import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { GiftForm } from "@/components/GiftForm";

export const metadata: Metadata = {
  title: "Подарочный сертификат",
  description: "Электронный подарочный сертификат AMBRE' на 1 500, 3 000 или 5 000 ₽ — придёт получателю письмом в выбранный день.",
};

// Сегодняшняя дата нужна для календаря отправки, поэтому форма рендерится на запрос
async function GiftFormToday() {
  await connection();
  return <GiftForm today={new Date().toISOString().slice(0, 10)} />;
}

export default function GiftPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <p className="eyebrow">В подарок</p>
      <h1 className="mt-3 font-display text-5xl">Подарочный сертификат</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Когда не знаешь, какой момент выбрать, — подари выбор. Сертификат придёт получателю письмом в нужный день.
      </p>
      <Suspense fallback={<div className="mt-10 h-96 animate-pulse rounded-3xl bg-surface" />}>
        <GiftFormToday />
      </Suspense>
    </div>
  );
}
