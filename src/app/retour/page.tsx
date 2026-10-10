import type { Metadata } from "next";
import { RetourForm } from "@/components/RetourForm";
import { retourRewards } from "@/data/site";

export const metadata: Metadata = {
  title: "Retour — верни банку и получи скидку",
  description: "Программа возврата банок AMBRE': сдай пустую банку и получи скидку до 250 ₽ на следующий заказ.",
};

const STEPS = [
  ["Догорело", "Когда на дне остаётся около 1 см воска, погаси свечу в последний раз."],
  ["Очисти", "Убери банку в морозилку на 2–3 часа: остатки воска выйдут одним куском. Вымой банку тёплой водой."],
  ["Сдай", "Курьеру при следующей доставке, в точке партнёра, при самовывозе или посылкой от 3 банок."],
  ["Получи скидку", "После проверки пришлём персональный промокод. Банку отмоем и зальём в неё новый момент."],
];

export default function RetourPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <p className="eyebrow">Retour · «возвращение»</p>
      <h1 className="mt-3 font-display text-5xl">Верни банку — получи скидку</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Момент догорел, а банка возвращается за новым. Стекло служит снова, а у тебя — скидка на следующий заказ.
      </p>

      <ul className="mt-10 grid grid-cols-3 gap-3 text-center">
        {retourRewards.map((r) => (
          <li key={r.label} className="rounded-3xl border border-line p-6">
            <p className="font-display text-4xl text-amber-strong">−{r.reward} ₽</p>
            <p className="mt-1 text-sm text-muted">за банку {r.label}</p>
          </li>
        ))}
      </ul>

      <ol className="mt-12 grid gap-4 md:grid-cols-4">
        {STEPS.map(([title, text], i) => (
          <li key={title} className="rounded-3xl bg-surface p-6">
            <p className="font-display text-3xl text-amber-strong">{i + 1}</p>
            <h2 className="mt-2 font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted">{text}</p>
          </li>
        ))}
      </ol>

      <section className="mt-12 grid gap-10 md:grid-cols-2">
        <div className="prose-ambre text-muted">
          <h2 className="!mt-0 text-ink">Условия</h2>
          <ul>
            <li>Принимаем только банки AMBRE&apos; — целые, без сколов и трещин, очищенные от воска.</li>
            <li>Скидка выдаётся персональным промокодом, за несколько банок суммируется.</li>
            <li>Скидка — не больше 30% от суммы товаров в заказе.</li>
            <li>Промокод действует 6 месяцев и не обменивается на деньги.</li>
            <li>Не суммируется с другими промокодами.</li>
          </ul>
        </div>
        <div>
          <h2 className="font-display text-2xl">Заявка на возврат</h2>
          <div className="mt-4">
            <RetourForm />
          </div>
        </div>
      </section>
    </div>
  );
}
