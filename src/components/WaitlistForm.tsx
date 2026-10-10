"use client";

import { RequestForm } from "@/components/RequestForm";

export function WaitlistForm({ story }: { story: string }) {
  return (
    <RequestForm
      type="waitlist"
      submitLabel="Сообщить о выходе"
      successText="Напишем, как только откроется предзаказ."
      toPayload={(form) => ({ story, contact: String(form.get("contact") ?? "") })}
    >
      <label className="block text-left">
        <span className="text-sm text-muted">E-mail, телефон или Telegram</span>
        <input name="contact" required className="field mt-1" />
      </label>
    </RequestForm>
  );
}
