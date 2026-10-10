import type { Metadata } from "next";
import Link from "next/link";
import { TextPage } from "@/components/TextPage";
import { GIFT_WRAP_PRICE, shippingOptions } from "@/data/site";
import { formatRub } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Доставка и оплата",
  description: "Доставка свечей AMBRE' по России: СДЭК, Почта России, самовывоз. Оплата картой и через СБП.",
};

export default function DeliveryPage() {
  return (
    <TextPage eyebrow="Покупателям" title="Доставка и оплата">
      <h2 className="!mt-0 text-ink">Доставка</h2>
      <ul>
        {shippingOptions.map((o) => (
          <li key={o.id}>
            <b className="text-ink">{o.label}</b> — {o.price ? formatRub(o.price) : "бесплатно"}
            {o.freeFrom ? `, бесплатно от ${formatRub(o.freeFrom)}` : ""}. {o.hint}.
          </li>
        ))}
      </ul>
      <p>
        Отправляем в течение 1–3 рабочих дней после оплаты. Каждую свечу упаковываем в гофровставку, чтобы стекло
        доехало целым. Подарочная упаковка с открыткой — {formatRub(GIFT_WRAP_PRICE)}.
      </p>

      <h2 className="text-ink">Оплата</h2>
      <p>
        Банковской картой или через СБП на защищённой странице ЮKassa. Чек придёт на e-mail, указанный в заказе.
      </p>

      <h2 className="text-ink">Если свеча разбилась</h2>
      <p>
        Сфотографируйте посылку и свечу при получении и напишите нам в течение 3 дней — заменим свечу или вернём
        деньги. Подробности — в <Link href="/legal/offer">оферте</Link>.
      </p>

      <h2 className="text-ink">Частые вопросы</h2>
      <ul>
        <li>
          <b className="text-ink">Можно вернуть свечу, если не понравился аромат?</b> Свечу, которую не зажигали,
          можно вернуть в течение 7 дней после получения.
        </li>
        <li>
          <b className="text-ink">Сколько горит свеча?</b> Мини — около 12 часов, 200 мл — около 40, 400 мл — до 60.
        </li>
        <li>
          <b className="text-ink">Что делать с пустой банкой?</b> Вернуть нам по программе{" "}
          <Link href="/retour">Retour</Link> и получить скидку.
        </li>
      </ul>
    </TextPage>
  );
}
