// Генерирует подписанный код на фиксированную сумму.
// Запуск: npm run code -- <retour|gift|sample> <сумма в рублях> [срок в месяцах]
//   retour — скидка за возвращённые банки (по умолчанию 6 мес.)
//   gift   — подарочный сертификат (по умолчанию 12 мес.)
//   sample — скидка на первую свечу для набора пробников (по умолчанию 6 мес.)
// Нужен тот же RETOUR_SECRET, что и на сервере (берётся из .env.local или окружения).
import { createCode, defaultValidUntil, type CodeKind } from "../src/lib/codes.ts";

const KINDS: Record<string, CodeKind> = { retour: "RT", gift: "GC", sample: "PB" };
const [kindArg, amountArg, monthsArg] = process.argv.slice(2);
const kind = KINDS[kindArg ?? ""];
const secret = process.env.RETOUR_SECRET ?? "";

if (!kind) {
  console.error("Тип кода: retour, gift или sample. Пример: npm run code -- gift 3000");
  process.exit(1);
}
if (!secret) {
  console.error("Задайте RETOUR_SECRET в .env.local или в окружении.");
  process.exit(1);
}

let validUntil = defaultValidUntil(kind);
if (monthsArg) {
  const months = Number(monthsArg);
  if (!Number.isInteger(months) || months < 1 || months > 36) {
    console.error("Срок — целое число месяцев от 1 до 36.");
    process.exit(1);
  }
  validUntil = new Date();
  validUntil.setMonth(validUntil.getMonth() + months);
}

try {
  const code = createCode(kind, Number(amountArg), secret, validUntil);
  console.log(code);
  console.log(`${amountArg} ₽, действует до ${validUntil.toLocaleDateString("ru-RU")}.`);
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}
