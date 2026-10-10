import { getProduct, type VariantId } from "@/data/products";
import { getStory } from "@/data/stories";
import {
  GIFT_WRAP_PRICE,
  RETOUR_MAX_SHARE,
  shippingOptions,
  type ShippingId,
} from "@/data/site";

export type CartLine = {
  slug: string;
  variant?: VariantId;
  /** Выбранные моменты для набора «Пролог» */
  picks?: string[];
  qty: number;
};

export type PricedLine = {
  title: string;
  unitPrice: number;
  qty: number;
  sum: number;
};

export type Promo =
  | { code: string; kind: "percent"; value: number; label: string }
  | { code: string; kind: "retour"; value: number; label: string };

export type Totals = {
  subtotal: number;
  discount: number;
  giftWrap: number;
  shipping: number;
  total: number;
};

export const MAX_QTY = 20;

export function lineKey(line: Omit<CartLine, "qty">): string {
  return [line.slug, line.variant ?? "", (line.picks ?? []).join("+")].join("|");
}

/** Проверяет строку корзины по каталогу и считает цену. Возвращает строку ошибки, если товар нельзя купить. */
export function priceLine(line: CartLine): PricedLine | string {
  const product = getProduct(line.slug);
  if (!product) return `Товар не найден: ${line.slug}`;
  if (getStory(product.storySlug)?.status !== "available") {
    return `«${product.name}» ещё не в продаже`;
  }
  if (!Number.isInteger(line.qty) || line.qty < 1 || line.qty > MAX_QTY) {
    return `Неверное количество для «${product.name}»`;
  }

  if (product.kind === "moment") {
    const variant = product.variants.find((v) => v.id === line.variant);
    if (!variant) return `Выберите объём для «${product.name}»`;
    return {
      title: `${product.name}, ${variant.label}`,
      unitPrice: variant.price,
      qty: line.qty,
      sum: variant.price * line.qty,
    };
  }

  let title = product.name;
  if (product.picks > 0) {
    const picks = line.picks ?? [];
    const valid =
      picks.length === product.picks &&
      new Set(picks).size === picks.length &&
      picks.every((slug) => {
        const p = getProduct(slug);
        return p?.kind === "moment" && p.storySlug === product.storySlug;
      });
    if (!valid) return `Выберите ${product.picks} разных момента для «${product.name}»`;
    const names = picks.map((slug) => getProduct(slug)!.name);
    title = `${product.name} (${names.join(", ")})`;
  }
  return { title, unitPrice: product.price, qty: line.qty, sum: product.price * line.qty };
}

export function promoDiscount(subtotal: number, promo: Promo | null): number {
  if (!promo || subtotal <= 0) return 0;
  if (promo.kind === "percent") return Math.round((subtotal * promo.value) / 100);
  return Math.min(promo.value, Math.floor(subtotal * RETOUR_MAX_SHARE));
}

export function shippingPrice(id: ShippingId, goodsAfterDiscount: number): number {
  const option = shippingOptions.find((o) => o.id === id);
  if (!option) return 0;
  if (option.freeFrom !== null && goodsAfterDiscount >= option.freeFrom) return 0;
  return option.price;
}

export function computeTotals(
  lines: PricedLine[],
  shipping: ShippingId,
  giftWrap: boolean,
  promo: Promo | null,
): Totals {
  const subtotal = lines.reduce((s, l) => s + l.sum, 0);
  const discount = promoDiscount(subtotal, promo);
  const wrap = giftWrap && subtotal > 0 ? GIFT_WRAP_PRICE : 0;
  const ship = subtotal > 0 ? shippingPrice(shipping, subtotal - discount) : 0;
  return {
    subtotal,
    discount,
    giftWrap: wrap,
    shipping: ship,
    total: subtotal - discount + wrap + ship,
  };
}

export type ReceiptItem = {
  title: string;
  qty: number;
  /** Цена за единицу в копейках */
  unitKopecks: number;
};

/**
 * Раскладывает скидку по строкам заказа для чека (54-ФЗ): сумма позиций чека должна
 * точно совпадать с суммой платежа. Скидка распределяется пропорционально в копейках;
 * если её нельзя поровну разделить между единицами товара, строка делится на две позиции.
 */
export function allocateReceipt(lines: PricedLine[], discount: number): ReceiptItem[] {
  const subtotalK = lines.reduce((s, l) => s + l.sum * 100, 0);
  const discountK = Math.round(discount * 100);
  if (subtotalK === 0) return [];

  const shares = lines.map((l) => Math.floor((discountK * l.sum * 100) / subtotalK));
  let rest = discountK - shares.reduce((a, b) => a + b, 0);
  for (let i = 0; rest > 0; i = (i + 1) % lines.length) {
    if (shares[i] < lines[i].sum * 100) {
      shares[i] += 1;
      rest -= 1;
    }
  }

  const items: ReceiptItem[] = [];
  lines.forEach((line, i) => {
    const lineK = line.sum * 100 - shares[i];
    const base = Math.floor(lineK / line.qty);
    const extra = lineK - base * line.qty;
    if (extra === 0) {
      items.push({ title: line.title, qty: line.qty, unitKopecks: base });
    } else {
      if (line.qty > 1) items.push({ title: line.title, qty: line.qty - 1, unitKopecks: base });
      items.push({ title: line.title, qty: 1, unitKopecks: base + extra });
    }
  });
  return items;
}

export function formatRub(value: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}
