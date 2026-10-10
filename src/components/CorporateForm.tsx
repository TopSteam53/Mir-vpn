"use client";

import { RequestForm } from "@/components/RequestForm";

export function CorporateForm() {
  return (
    <RequestForm
      type="corporate"
      submitLabel="Получить предложение"
      successText="Пришлём коммерческое предложение в течение рабочего дня."
      toPayload={(form) => ({
        name: String(form.get("name") ?? ""),
        company: String(form.get("company") ?? ""),
        contact: String(form.get("contact") ?? ""),
        quantity: Math.max(1, Math.floor(Number(form.get("quantity") ?? 0)) || 0),
        deadline: String(form.get("deadline") ?? ""),
        budget: String(form.get("budget") ?? ""),
        logo: form.get("logo") === "on",
        comment: String(form.get("comment") ?? ""),
      })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-muted">Имя</span>
          <input name="name" required autoComplete="name" className="field mt-1" />
        </label>
        <label className="block">
          <span className="text-sm text-muted">Компания</span>
          <input name="company" autoComplete="organization" className="field mt-1" />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm text-muted">Телефон, e-mail или Telegram</span>
          <input name="contact" required className="field mt-1" />
        </label>
        <label className="block">
          <span className="text-sm text-muted">Количество, шт.</span>
          <input name="quantity" type="number" min={1} defaultValue={30} inputMode="numeric" className="field mt-1" />
        </label>
        <label className="block">
          <span className="text-sm text-muted">Когда нужно</span>
          <input name="deadline" placeholder="например, до 20 декабря" className="field mt-1" />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm text-muted">Бюджет на подарок</span>
          <input name="budget" placeholder="например, до 1 500 ₽ за штуку" className="field mt-1" />
        </label>
      </div>
      <label className="flex items-center gap-3">
        <input type="checkbox" name="logo" className="h-5 w-5 accent-[var(--amber)]" />
        <span>Нужен логотип или своя этикетка</span>
      </label>
      <label className="block">
        <span className="text-sm text-muted">Комментарий</span>
        <textarea name="comment" rows={3} maxLength={1500} className="field mt-1" />
      </label>
    </RequestForm>
  );
}
