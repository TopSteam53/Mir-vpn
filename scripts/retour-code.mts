// Генерирует персональный промокод Retour после приёмки банок.
// Запуск: npm run retour:code -- <сумма в рублях> [срок в месяцах, по умолчанию 6]
// Нужен тот же RETOUR_SECRET, что и на сервере (берётся из .env.local или окружения).
import { createRetourCode } from "../src/lib/retour.ts";

const [amountArg, monthsArg = "6"] = process.argv.slice(2);
const amount = Number(amountArg);
const months = Number(monthsArg);
const secret = process.env.RETOUR_SECRET ?? "";

if (!secret) {
  console.error("Задайте RETOUR_SECRET в .env.local или в окружении.");
  process.exit(1);
}
if (!Number.isInteger(months) || months < 1 || months > 24) {
  console.error("Срок — целое число месяцев от 1 до 24.");
  process.exit(1);
}

const validUntil = new Date();
validUntil.setMonth(validUntil.getMonth() + months);

try {
  const code = createRetourCode(amount, secret, validUntil);
  console.log(code);
  console.log(`Скидка ${amount} ₽, действует до ${validUntil.toLocaleDateString("ru-RU")}.`);
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}
