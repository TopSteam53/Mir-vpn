// Подарочные сертификаты: продаются на сайте, приходят получателю письмом с кодом.

export const GIFT_SLUG = "gift-certificate";

export const giftAmounts = [1500, 3000, 5000] as const;

export const GIFT_NAME_MAX = 40;
export const GIFT_MESSAGE_MAX = 200;
/** Сертификат действует 12 месяцев с момента оплаты */
export const GIFT_VALID_MONTHS = 12;
/** Насколько далеко вперёд можно назначить отправку */
export const GIFT_MAX_DELAY_DAYS = 180;

export type GiftDetails = {
  /** Имя получателя */
  to: string;
  /** От кого */
  from: string;
  /** Куда отправить код */
  email: string;
  message: string;
  /** Дата отправки, ГГГГ-ММ-ДД */
  date: string;
};
