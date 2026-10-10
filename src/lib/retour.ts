// Персональные промокоды программы Retour (возврат банок).
// Код подписан секретом (RETOUR_SECRET), поэтому его нельзя подделать или изменить сумму.
// Формат: RT-<сумма>-<действует до ГГММДД>-<id>-<подпись>, например RT-450-270410-K7QX-1A2B3C4D.
// Без базы данных одноразовость не проверяется автоматически: код приходит в уведомлении
// о заказе, и владелец сверяет его со списком выданных. Учёт в БД — в версии 2.
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const RETOUR_MAX_AMOUNT = 5000;
const ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex").slice(0, 8).toUpperCase();
}

function yymmdd(date: Date): string {
  return date.toISOString().slice(2, 10).replaceAll("-", "");
}

export function createRetourCode(
  amount: number,
  secret: string,
  validUntil: Date,
  id = Array.from(randomBytes(4), (b) => ID_ALPHABET[b % ID_ALPHABET.length]).join(""),
): string {
  if (!Number.isInteger(amount) || amount <= 0 || amount > RETOUR_MAX_AMOUNT) {
    throw new Error(`Сумма должна быть целым числом от 1 до ${RETOUR_MAX_AMOUNT}`);
  }
  if (!secret) throw new Error("RETOUR_SECRET не задан");
  const payload = `RT-${amount}-${yymmdd(validUntil)}-${id}`;
  return `${payload}-${sign(payload, secret)}`;
}

export type RetourCheck =
  | { ok: true; amount: number; validUntil: string }
  | { ok: false; reason: string };

export function verifyRetourCode(code: string, secret: string, now = new Date()): RetourCheck {
  const match = /^RT-(\d{1,5})-(\d{6})-([A-Z0-9]{4})-([0-9A-F]{8})$/.exec(code.trim().toUpperCase());
  if (!match || !secret) return { ok: false, reason: "Промокод не найден" };
  const [, amountRaw, date, id, signature] = match;
  const expected = sign(`RT-${amountRaw}-${date}-${id}`, secret);
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    return { ok: false, reason: "Промокод не найден" };
  }
  const amount = Number(amountRaw);
  if (amount <= 0 || amount > RETOUR_MAX_AMOUNT) return { ok: false, reason: "Промокод не найден" };
  if (date < yymmdd(now)) return { ok: false, reason: "Срок действия промокода истёк" };
  return { ok: true, amount, validUntil: `20${date.slice(0, 2)}-${date.slice(2, 4)}-${date.slice(4)}` };
}
