// Подписанные коды на фиксированную сумму: Retour (возврат банок), подарочные сертификаты,
// скидка за набор пробников. Код подписан секретом (RETOUR_SECRET), поэтому сумму и срок нельзя подделать.
// Формат: <тип>-<сумма>-<действует до ГГММДД>-<id>-<подпись>, например RT-450-270410-K7QX-1A2B3C4D.
// Без базы данных одноразовость не проверяется автоматически: код приходит в уведомлении о заказе,
// и владелец сверяет его со списком выданных. Учёт в БД — в версии 2.
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const CODE_KINDS = {
  RT: { label: "Retour", max: 5000 },
  GC: { label: "Подарочный сертификат", max: 50000 },
  PB: { label: "Скидка за пробники", max: 2000 },
} as const;

export type CodeKind = keyof typeof CODE_KINDS;

const ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex").slice(0, 8).toUpperCase();
}

function yymmdd(date: Date): string {
  return date.toISOString().slice(2, 10).replaceAll("-", "");
}

/** Короткий id из случайных байтов или из seed (чтобы повторный вызов давал тот же код). */
export function codeId(seed?: string): string {
  const bytes = seed ? createHmac("sha256", "id").update(seed).digest() : randomBytes(4);
  return Array.from(bytes.subarray(0, 4), (b) => ID_ALPHABET[b % ID_ALPHABET.length]).join("");
}

export function createCode(
  kind: CodeKind,
  amount: number,
  secret: string,
  validUntil: Date,
  id = codeId(),
): string {
  const max = CODE_KINDS[kind].max;
  if (!Number.isInteger(amount) || amount <= 0 || amount > max) {
    throw new Error(`Сумма должна быть целым числом от 1 до ${max}`);
  }
  if (!secret) throw new Error("RETOUR_SECRET не задан");
  const payload = `${kind}-${amount}-${yymmdd(validUntil)}-${id}`;
  return `${payload}-${sign(payload, secret)}`;
}

export type CodeCheck =
  | { ok: true; kind: CodeKind; amount: number; validUntil: string }
  | { ok: false; reason: string };

export function verifyCode(code: string, secret: string, now = new Date()): CodeCheck {
  const match = /^(RT|GC|PB)-(\d{1,6})-(\d{6})-([A-Z0-9]{4})-([0-9A-F]{8})$/.exec(code.trim().toUpperCase());
  if (!match || !secret) return { ok: false, reason: "Промокод не найден" };
  const [, kindRaw, amountRaw, date, id, signature] = match;
  const kind = kindRaw as CodeKind;
  const expected = sign(`${kind}-${amountRaw}-${date}-${id}`, secret);
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    return { ok: false, reason: "Промокод не найден" };
  }
  const amount = Number(amountRaw);
  if (amount <= 0 || amount > CODE_KINDS[kind].max) return { ok: false, reason: "Промокод не найден" };
  if (date < yymmdd(now)) return { ok: false, reason: "Срок действия кода истёк" };
  return { ok: true, kind, amount, validUntil: `20${date.slice(0, 2)}-${date.slice(2, 4)}-${date.slice(4)}` };
}

/** Срок действия по умолчанию: Retour и пробники — 6 месяцев, сертификат — 12. */
export function defaultValidUntil(kind: CodeKind, from = new Date()): Date {
  const date = new Date(from);
  date.setMonth(date.getMonth() + (kind === "GC" ? 12 : 6));
  return date;
}
