"use client";

import { RequestForm } from "@/components/RequestForm";
import { retourRewards } from "@/data/site";

const count = (form: FormData, name: string) => Math.max(0, Math.floor(Number(form.get(name) ?? 0)) || 0);

export function RetourForm() {
  return (
    <RequestForm
      type="retour"
      submitLabel="Отправить заявку"
      successText="Мы напишем, куда и когда передать банки. Промокод придёт после проверки."
      toPayload={(form) => ({
        name: String(form.get("name") ?? ""),
        contact: String(form.get("contact") ?? ""),
        mini: count(form, "mini"),
        medium: count(form, "medium"),
        large: count(form, "large"),
        method: String(form.get("method") ?? "courier"),
        orderNumber: String(form.get("orderNumber") ?? ""),
      })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-muted">Имя</span>
          <input name="name" required autoComplete="name" className="field mt-1" />
        </label>
        <label className="block">
          <span className="text-sm text-muted">Телефон, e-mail или Telegram</span>
          <input name="contact" required className="field mt-1" />
        </label>
      </div>
      <fieldset>
        <legend className="text-sm text-muted">Сколько банок сдаёте</legend>
        <div className="mt-1 grid grid-cols-3 gap-3">
          {(["mini", "medium", "large"] as const).map((name, i) => (
            <label key={name} className="block">
              <span className="text-xs text-muted">{retourRewards[i].label}</span>
              <input name={name} type="number" min={0} max={50} defaultValue={0} inputMode="numeric" className="field mt-1" />
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block">
        <span className="text-sm text-muted">Как удобнее сдать</span>
        <select name="method" className="field mt-1" defaultValue="courier">
          <option value="courier">Курьеру при следующей доставке</option>
          <option value="partner">В точке партнёра</option>
          <option value="pickup">При самовывозе</option>
          <option value="parcel">Посылкой (от 3 банок)</option>
        </select>
      </label>
      <label className="block">
        <span className="text-sm text-muted">Номер прошлого заказа (если помните)</span>
        <input name="orderNumber" className="field mt-1" />
      </label>
    </RequestForm>
  );
}
