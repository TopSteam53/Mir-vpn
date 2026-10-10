import { builderWicks } from "@/data/builder";
import { builderError, builderPrice, describeBuilder, type BuilderConfig } from "@/lib/builder";
import {
  GIFT_MAX_DELAY_DAYS,
  GIFT_MESSAGE_MAX,
  GIFT_NAME_MAX,
  GIFT_SLUG,
  giftAmounts,
  type GiftDetails,
} from "@/data/gift";
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
  /** Фитиль для свечи из каталога; по умолчанию хлопковый */
  wick?: WickId;
  /** Выбранные моменты для набора «Пролог» */
  picks?: string[];
  /** Конфигурация из конструктора, когда slug = CUSTOM_SLUG */
  custom?: BuilderConfig;
  /** Номинал и данные получателя, когда slug = GIFT_SLUG */
  amount?: number;
  gift?: GiftDetails;
  qty: number;
};

export const CUSTOM_SLUG = "custom";

export type WickId = (typeof builderWicks)[number]["id"];

export type PricedLine = {
  title: string;
  /** Подробности для сборщика: состав своей свечи */
  details?: string;
  /** Подарочный сертификат: не товар, на него не действуют скидки и доставка */
  certificate?: boolean;
  unitPrice: number;
  qty: number;
  sum: number;
};

export type Promo = {
  code: string;
  /** percent — процент от товаров; fixed — сумма, не больше 30% товаров (Retour, пробники);
   * certificate — подарочный сертификат, оплачивает товары целиком */
  kind: "percent" | "fixed" | "certificate";
  value: number;
  label: string;
};

export type Totals = {
  /** Сумма товаров, на которые действуют скидки и доставка (без сертификатов) */
  goods: number;
  subtotal: number;
  discount: number;
  giftWrap: number;
  shipping: number;
  total: number;
};

export const MAX_QTY = 20;

export function lineKey(line: Omit<CartLine, "qty">): string {
  return [
    line.slug,
    line.variant ?? "",
    line.wick && line.wick !== "cotton" ? line.wick : "",
    (line.picks ?? []).join("+"),
    line.custom ? JSON.stringify(line.custom) : "",
    line.amount ?? "",
    line.gift ? JSON.stringify(line.gift) : "",
  ].join("|");
}

/** Проверяет строку корзины по каталогу и считает цену. Возвращает строку ошибки, если товар нельзя купить. */
export function priceLine(line: CartLine): PricedLine | string {
  if (line.slug === CUSTOM_SLUG) {
    if (!Number.isInteger(line.qty) || line.qty < 1 || line.qty > MAX_QTY) return "Неверное количество";
    if (!line.custom) return "Не хватает настроек своей свечи";
    const error = builderError(line.custom);
    if (error) return error;
    const price = builderPrice(line.custom);
    return { ...describeBuilder(line.custom), unitPrice: price, qty: line.qty, sum: price * line.qty };
  }

  if (line.slug === GIFT_SLUG) return priceGift(line);

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
    const wick = builderWicks.find((w) => w.id === (line.wick ?? "cotton"));
    if (!wick) return "Неизвестный фитиль";
    if (wick.id === "wood" && variant.id === "mini") return "Деревянный фитиль не подходит для мини-свечи";
    const unitPrice = variant.price + wick.price;
    return {
      title: `№ ${product.code} ${product.name}, ${variant.label}${
        wick.id === "wood" ? (variant.id === "400" ? ", фитили деревянные" : ", деревянный фитиль") : ""
      }`,
      unitPrice,
      qty: line.qty,
      sum: unitPrice * line.qty,
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

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function giftError(gift: GiftDetails | undefined, today = new Date()): string | null {
  if (!gift) return "Заполните данные получателя сертификата";
  if (gift.to.trim().length < 2 || gift.to.length > GIFT_NAME_MAX) return "Укажите имя получателя";
  if (gift.from.trim().length < 2 || gift.from.length > GIFT_NAME_MAX) return "Укажите, от кого подарок";
  if (!EMAIL.test(gift.email.trim()) || gift.email.length > 120) return "Укажите e-mail получателя";
  if (gift.message.length > GIFT_MESSAGE_MAX) return "Слишком длинное поздравление";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(gift.date)) return "Укажите дату отправки";
  const day = today.toISOString().slice(0, 10);
  const latest = new Date(today);
  latest.setDate(latest.getDate() + GIFT_MAX_DELAY_DAYS);
  if (gift.date < day || gift.date > latest.toISOString().slice(0, 10)) {
    return "Дата отправки — от сегодня и не дальше чем через полгода";
  }
  return null;
}

function priceGift(line: CartLine): PricedLine | string {
  if (!giftAmounts.includes(line.amount as (typeof giftAmounts)[number])) return "Выберите номинал сертификата";
  if (!Number.isInteger(line.qty) || line.qty < 1 || line.qty > MAX_QTY) return "Неверное количество";
  const error = giftError(line.gift);
  if (error) return error;
  const g = line.gift!;
  const amount = line.amount!;
  return {
    title: `Подарочный сертификат на ${formatRub(amount)}`,
    details: [
      `кому: ${g.to.trim()}, от: ${g.from.trim()}`,
      `отправить ${g.date.split("-").reverse().join(".")} на ${g.email.trim()}`,
      g.message.trim() ? `«${g.message.trim()}»` : "",
    ]
      .filter(Boolean)
      .join("; "),
    certificate: true,
    unitPrice: amount,
    qty: line.qty,
    sum: amount * line.qty,
  };
}

export function promoDiscount(goods: number, promo: Promo | null): number {
  if (!promo || goods <= 0) return 0;
  if (promo.kind === "percent") return Math.round((goods * promo.value) / 100);
  if (promo.kind === "certificate") return Math.min(promo.value, goods);
  return Math.min(promo.value, Math.floor(goods * RETOUR_MAX_SHARE));
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
  const goods = lines.reduce((s, l) => s + (l.certificate ? 0 : l.sum), 0);
  const discount = promoDiscount(goods, promo);
  const wrap = giftWrap && goods > 0 ? GIFT_WRAP_PRICE : 0;
  // Оплата сертификатом не отнимает бесплатную доставку: порог считаем по товарам до сертификата
  const ship = goods > 0 ? shippingPrice(shipping, promo?.kind === "certificate" ? goods : goods - discount) : 0;
  return {
    goods,
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
