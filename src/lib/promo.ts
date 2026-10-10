import "server-only";
import type { Promo } from "@/lib/pricing";
import { verifyRetourCode } from "@/lib/retour";

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

  if (code.startsWith("RT-")) {
    const check = verifyRetourCode(code, process.env.RETOUR_SECRET ?? "");
    if (!check.ok) return check;
    return {
      ok: true,
      promo: {
        code,
        kind: "retour",
        value: check.amount,
        label: `Retour: −${check.amount} ₽ (не больше 30% от суммы товаров)`,
      },
    };
  }

  return { ok: false, reason: "Промокод не найден" };
}
