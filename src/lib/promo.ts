import "server-only";
import { verifyCode } from "@/lib/codes";
import { formatRub, type Promo } from "@/lib/pricing";

// Общие промокоды. Меняются здесь, без базы данных.
const STATIC_PROMOS: Record<string, { value: number; label: string }> = {
  WELCOME10: { value: 10, label: "−10% на первый заказ" },
};

export type PromoResult = { ok: true; promo: Promo } | { ok: false; reason: string };

export function resolvePromo(raw: string | undefined | null): PromoResult | null {
  const code = raw?.trim().toUpperCase();
  if (!code) return null;

  const fixed = STATIC_PROMOS[code];
  if (fixed) {
    return { ok: true, promo: { code, kind: "percent", value: fixed.value, label: fixed.label } };
  }

  if (/^(RT|GC|PB)-/.test(code)) {
    const check = verifyCode(code, process.env.RETOUR_SECRET ?? "");
    if (!check.ok) return check;
    const amount = formatRub(check.amount);
    if (check.kind === "GC") {
      return {
        ok: true,
        promo: {
          code,
          kind: "certificate",
          value: check.amount,
          label: `Сертификат на ${amount}: оплачивает товары, остаток пришлём новым кодом`,
        },
      };
    }
    const name = check.kind === "RT" ? "Retour" : "Скидка за пробники";
    return {
      ok: true,
      promo: { code, kind: "fixed", value: check.amount, label: `${name}: −${amount} (не больше 30% от суммы товаров)` },
    };
  }

  return { ok: false, reason: "Промокод не найден" };
}
