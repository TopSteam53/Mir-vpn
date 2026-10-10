"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const KEY = "ambre-cookies-ok";
const listeners = new Set<() => void>();

function accepted(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function CookieBanner() {
  // На сервере считаем, что согласие уже есть, чтобы баннер не мигал в HTML
  const isAccepted = useSyncExternalStore(subscribe, accepted, () => true);
  if (isAccepted) return null;

  function accept() {
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      // без хранилища баннер появится снова при следующем визите
    }
    listeners.forEach((l) => l());
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4" role="region" aria-label="Уведомление о cookies">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-lg sm:flex-row sm:items-center">
        <p className="text-sm text-muted">
          Мы используем cookies и Яндекс Метрику, чтобы сайт работал и становился удобнее. Подробнее —
          в <Link href="/legal/privacy" className="underline">политике конфиденциальности</Link>.
        </p>
        <button type="button" onClick={accept} className="btn btn-primary shrink-0">
          Хорошо
        </button>
      </div>
    </div>
  );
}
