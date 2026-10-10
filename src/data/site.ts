export const site = {
  name: "AMBRE'",
  slogan: "Моменты, застывшие в янтаре",
  description:
    "Ароматические свечи из растительного воска. Каждая свеча — сохранённый момент, каждая коллекция — история.",
  // Заменить на реальный домен, когда он появится (или задать NEXT_PUBLIC_SITE_URL).
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  // TODO: заполнить реальными контактами и реквизитами перед запуском.
  contacts: {
    email: "hello@example.ru",
    phone: "+7 (900) 000-00-00",
    telegram: "https://t.me/ambre_candles",
    vk: "https://vk.com/ambre_candles",
  },
  legal: {
    seller: "ИП / самозанятый — ФИО (заполнить)",
    inn: "000000000000",
  },
};

export type ShippingId = "cdek_pvz" | "cdek_courier" | "post" | "pickup";

export type ShippingOption = {
  id: ShippingId;
  label: string;
  hint: string;
  price: number;
  /** Бесплатно от этой суммы товаров; null — без бесплатной доставки */
  freeFrom: number | null;
  needsAddress: boolean;
};

export const shippingOptions: ShippingOption[] = [
  {
    id: "cdek_pvz",
    label: "СДЭК — пункт выдачи",
    hint: "2–6 дней по России",
    price: 390,
    freeFrom: 5000,
    needsAddress: true,
  },
  {
    id: "cdek_courier",
    label: "СДЭК — курьер до двери",
    hint: "2–6 дней по России",
    price: 590,
    freeFrom: null,
    needsAddress: true,
  },
  {
    id: "post",
    label: "Почта России",
    hint: "5–14 дней",
    price: 350,
    freeFrom: null,
    needsAddress: true,
  },
  {
    id: "pickup",
    label: "Самовывоз",
    hint: "Адрес пришлём после подтверждения заказа",
    price: 0,
    freeFrom: null,
    needsAddress: false,
  },
];

export const GIFT_WRAP_PRICE = 390;

/** Скидки программы Retour за одну банку */
export const retourRewards = [
  { label: "Мини (70 мл)", reward: 70 },
  { label: "200 мл", reward: 150 },
  { label: "400 мл", reward: 250 },
];

/** Максимальная доля скидки Retour от суммы товаров */
export const RETOUR_MAX_SHARE = 0.3;
