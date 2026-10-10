"use client";

import { useSyncExternalStore } from "react";
import { lineKey, MAX_QTY, type CartLine } from "@/lib/pricing";

const KEY = "ambre-cart-v1";
const EMPTY: CartLine[] = [];
const listeners = new Set<() => void>();
let cache: CartLine[] | null = null;

function sanitize(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (l): l is CartLine =>
      typeof l === "object" &&
      l !== null &&
      typeof l.slug === "string" &&
      Number.isInteger(l.qty) &&
      l.qty > 0,
  );
}

function read(): CartLine[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? sanitize(JSON.parse(raw)) : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(lines: CartLine[]) {
  cache = lines;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    // приватный режим или запрет хранилища: корзина живёт до перезагрузки
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCart(): CartLine[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function useCartCount(): number {
  return useCart().reduce((sum, l) => sum + l.qty, 0);
}

export const cart = {
  add(line: CartLine) {
    const key = lineKey(line);
    const lines = read();
    const existing = lines.find((l) => lineKey(l) === key);
    write(
      existing
        ? lines.map((l) =>
            l === existing ? { ...l, qty: Math.min(MAX_QTY, l.qty + line.qty) } : l,
          )
        : [...lines, line],
    );
  },
  setQty(key: string, qty: number) {
    write(
      read()
        .map((l) => (lineKey(l) === key ? { ...l, qty: Math.min(MAX_QTY, qty) } : l))
        .filter((l) => l.qty > 0),
    );
  },
  remove(key: string) {
    write(read().filter((l) => lineKey(l) !== key));
  },
  clear() {
    write(EMPTY);
  },
};
