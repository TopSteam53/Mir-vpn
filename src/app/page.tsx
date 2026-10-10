import Link from "next/link";
import { CandleArt } from "@/components/CandleArt";
import { GiftCard } from "@/components/GiftCard";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { momentsOf, setsOf } from "@/data/products";
import { retourRewards, site } from "@/data/site";
import { stories } from "@/data/stories";

const current = stories.find((s) => s.status === "available")!;
const hero = momentsOf(current.slug)[1];

const FEATURES = [
  { title: "Растительный воск", text: "Соевый и кокосовый воск горит чисто и ровно, без копоти." },
  { title: "Парфюмерные ароматы", text: "Сложные композиции с верхними, средними и базовыми нотами." },
  { title: "До 60 часов горения", text: "200 мл — около 40 часов, 400 мл с двумя фитилями — до 60." },
  { title: "Ручная работа", text: "Каждую партию варим и тестируем сами, на банке — номер момента." },
];

export default function Home() {
  return (
    <>
      {/* Первый экран */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-16 pt-12 md:grid-cols-2 md:pb-24 md:pt-20">
          <div>
            <p className="eyebrow">Ароматические свечи из растительного воска</p>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] sm:text-6xl">
              Моменты, застывшие в янтаре
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted">
              Каждая свеча — сохранённый момент, каждая коллекция — история. Зажги, и ты снова там.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/stories/${current.slug}`} className="btn btn-primary">
                Смотреть историю
              </Link>
              <Link href="/catalog" className="btn btn-ghost">
                Каталог
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="glow absolute -inset-10" aria-hidden="true" />
            <CandleArt
              color={current.color}
              code={hero.code}
              name={hero.name}
              caption={hero.title.toLowerCase()}
              className="relative w-full"
            />
          </div>
        </div>
      </section>

      {/* Текущая история */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow" style={{ color: current.color }}>
                Новая история
              </p>
              <h2 className="mt-2 font-display text-4xl">{current.title}</h2>
              <p className="mt-3 max-w-xl text-muted">{current.tagline}</p>
            </div>
            <Link href={`/stories/${current.slug}`} className="text-amber-strong underline underline-offset-4">
              Читать историю
            </Link>
          </div>
        </Reveal>
        <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4">
          {momentsOf(current.slug).map((m) => (
            <div key={m.slug} className="w-72 shrink-0 snap-start">
              <ProductCard product={m} />
            </div>
          ))}
        </div>
      </section>

      {/* Как это работает */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <Reveal className="grid gap-6 md:grid-cols-3">
          {[
            ["1 свеча = 1 момент", "Иней — каток в парке. Неон — город после дождя. Плед — первое утро января. Одно слово и момент, переведённый в аромат."],
            ["5 моментов = история", "Свечи коллекции складываются в историю. Зажигай по порядку, и она проиграется заново."],
            ["Новая история — каждый сезон", "Четыре истории в год, лимитки к праздникам и коллаборации."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-3xl border border-line p-6">
              <h3 className="font-display text-2xl">{title}</h3>
              <p className="mt-3 text-muted">{text}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Конструктор */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <Reveal className="grid items-center gap-8 rounded-[2rem] border border-line bg-surface p-8 md:grid-cols-[1fr_auto] md:p-12">
          <div>
            <p className="eyebrow">Конструктор</p>
            <h2 className="mt-3 font-display text-4xl">Собери свою свечу</h2>
            <p className="mt-4 max-w-xl text-muted">
              Выбери банку, собери аромат из нот, цвет воска и фитиль, а на этикетке напиши свой момент: «Наш первый
              отпуск», дату или имя. Сварим вручную за 10–14 дней: воску нужно созреть.
            </p>
            <Link href="/builder" className="btn btn-primary mt-6">
              Собрать свечу
            </Link>
          </div>
          <div className="flex items-end justify-center gap-3" aria-hidden="true">
            <CandleArt color="#6b4eff" className="h-36" />
            <CandleArt color="#c8862e" className="h-48" />
            <CandleArt color="#2f9c95" className="h-36" />
          </div>
        </Reveal>
      </section>

      {/* Все истории */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <Reveal>
          <h2 className="font-display text-4xl">Истории</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stories.map((s) => (
            <Link
              key={s.slug}
              href={`/stories/${s.slug}`}
              className="group relative flex min-h-64 flex-col justify-end overflow-hidden rounded-3xl p-6 text-white"
              style={{ background: `linear-gradient(160deg, ${s.color}, #1b120b 85%)` }}
            >
              <span className="eyebrow !text-white/70">
                {s.status === "available" ? s.season : `Скоро · ${s.release}`}
              </span>
              <span className="mt-2 font-display text-2xl">{s.title}</span>
              <span className="mt-2 text-sm text-white/75">{s.tagline}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Retour */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <Reveal className="grid items-center gap-8 rounded-[2rem] bg-resin p-8 text-on-resin md:grid-cols-2 md:p-12">
          <div>
            <p className="eyebrow !text-honey">Retour</p>
            <h2 className="mt-3 font-display text-4xl">Верни банку — получи скидку</h2>
            <p className="mt-4 text-on-resin/75">
              Сдай пустую банку AMBRE&apos; и получи персональный промокод на следующий заказ. Мы отмоем
              банку и зальём в неё новый момент.
            </p>
            <Link href="/retour" className="btn btn-primary mt-6">
              Как это работает
            </Link>
          </div>
          <ul className="grid grid-cols-3 gap-3 text-center">
            {retourRewards.map((r) => (
              <li key={r.label} className="rounded-2xl border border-on-resin/15 p-4">
                <p className="font-display text-3xl text-honey">−{r.reward} ₽</p>
                <p className="mt-1 text-xs text-on-resin/70">{r.label}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* Подарки */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <Reveal>
          <h2 className="font-display text-4xl">В подарок</h2>
          <p className="mt-3 max-w-xl text-muted">
            Наборы мини-свечей, пробники ароматов и сертификат, если не знаешь, какой момент выбрать. К любому заказу
            можно добавить подарочную упаковку и открытку с твоим текстом.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {setsOf(current.slug).map((s) => (
            <ProductCard key={s.slug} product={s} />
          ))}
          <Link
            href="/gift"
            className="group flex flex-col rounded-3xl border border-line bg-surface p-4 transition-colors hover:border-amber"
          >
            <div className="flex aspect-[4/3] items-center rounded-2xl bg-bg p-4">
              <div className="w-full transition-transform duration-500 group-hover:-translate-y-1">
                <GiftCard amount={3000} />
              </div>
            </div>
            <p className="eyebrow mt-4">Электронный</p>
            <h3 className="mt-1 font-display text-2xl tracking-wide">Подарочный сертификат</h3>
            <p className="mt-2 flex-1 text-sm text-muted">Придёт получателю письмом в нужный день. Действует год.</p>
            <p className="mt-3 font-semibold">1 500 · 3 000 · 5 000 ₽</p>
          </Link>
        </div>
      </section>

      {/* Почему AMBRE' */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <Reveal className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <div className="h-px w-12 bg-amber" aria-hidden="true" />
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted">{f.text}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Компаниям и Telegram */}
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-12 md:grid-cols-2">
        <div className="rounded-3xl border border-line p-8">
          <h2 className="font-display text-3xl">Подарки для команды и клиентов</h2>
          <p className="mt-3 text-muted">
            Свечи с вашим логотипом или своей этикеткой от 30 штук. Пришлём коммерческое предложение за день.
          </p>
          <Link href="/corporate" className="btn btn-ghost mt-6">
            Получить предложение
          </Link>
        </div>
        <div className="rounded-3xl border border-line p-8">
          <h2 className="font-display text-3xl">−10% на первый заказ</h2>
          <p className="mt-3 text-muted">
            Промокод <b className="text-ink">WELCOME10</b>. В Telegram-канале — новые истории раньше всех,
            закулисье и лимитки.
          </p>
          <a href={site.contacts.telegram} className="btn btn-primary mt-6">
            Подписаться в Telegram
          </a>
        </div>
      </section>
    </>
  );
}
