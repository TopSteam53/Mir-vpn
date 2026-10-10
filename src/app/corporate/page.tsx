import type { Metadata } from "next";
import { CorporateForm } from "@/components/CorporateForm";

export const metadata: Metadata = {
  title: "Корпоративные подарки",
  description: "Ароматические свечи AMBRE' в подарок сотрудникам и клиентам: свой логотип и этикетка, от 30 штук.",
};

const POINTS = [
  ["От 30 штук", "Мини-свечи, 200 мл или наборы «Вся история»."],
  ["Ваш логотип", "Своя этикетка или открытка с текстом от компании."],
  ["Документы", "Счёт, договор и закрывающие документы."],
  ["К сроку", "Новогодние заказы принимаем до 1 декабря."],
];

export default function CorporatePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <p className="eyebrow">Компаниям</p>
      <h1 className="mt-3 font-display text-5xl">Подарки, которые запоминаются</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Свеча-момент вместо ещё одной кружки с логотипом: её зажгут дома и вспомнят, от кого подарок.
      </p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {POINTS.map(([title, text]) => (
          <li key={title} className="rounded-3xl border border-line p-6">
            <h2 className="font-display text-2xl">{title}</h2>
            <p className="mt-2 text-sm text-muted">{text}</p>
          </li>
        ))}
      </ul>

      <section className="mt-12 max-w-2xl">
        <h2 className="font-display text-3xl">Расскажите о задаче</h2>
        <p className="mt-2 text-muted">Пришлём коммерческое предложение и образцы ароматов.</p>
        <div className="mt-6">
          <CorporateForm />
        </div>
      </section>
    </div>
  );
}
