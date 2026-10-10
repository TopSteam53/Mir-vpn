"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { reachGoal } from "@/lib/metrika";

type Props = {
  type: "retour" | "corporate";
  submitLabel: string;
  successText: string;
  /** Собирает данные формы в тело запроса */
  toPayload: (form: FormData) => Record<string, unknown>;
  children: ReactNode;
};

export function RequestForm({ type, submitLabel, successText, toPayload, children }: Props) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setState("sending");
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          ...toPayload(form),
          consent: form.get("consent") === "on",
          website: String(form.get("website") ?? ""),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Не получилось отправить заявку");
        setState("idle");
        return;
      }
      reachGoal(`request_${type}`);
      setState("done");
    } catch {
      setError("Нет связи с сервером. Попробуйте ещё раз.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-3xl border border-amber p-8 text-center" role="status">
        <p className="font-display text-3xl">Заявка отправлена</p>
        <p className="mt-3 text-muted">{successText}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {children}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <label className="flex gap-3 text-sm text-muted">
        <input type="checkbox" name="consent" required className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--amber)]" />
        <span>
          Даю согласие на обработку персональных данных по{" "}
          <Link href="/legal/privacy" className="underline">политике</Link>.
        </span>
      </label>
      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={state === "sending"}>
        {state === "sending" ? "Отправляем…" : submitLabel}
      </button>
    </form>
  );
}
