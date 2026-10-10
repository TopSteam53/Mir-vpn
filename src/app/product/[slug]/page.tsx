import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/AddToCart";
import { CandleArt } from "@/components/CandleArt";
import { MomentPhoto } from "@/components/MomentPhoto";
import { momentPhoto } from "@/data/photos";
import { CandleAssembly } from "@/components/CandleAssembly";
import {
  familyLabels,
  getProduct,
  minPrice,
  momentNumber,
  momentsOf,
  products,
  type Moment,
} from "@/data/products";
import { retourRewards, site } from "@/data/site";
import { getStory } from "@/data/stories";
import { formatRub } from "@/lib/pricing";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const description =
    product.kind === "moment"
      ? `${product.scene} Ноты: ${product.notes.top}, ${product.notes.heart}, ${product.notes.base}.`
      : product.description;
  const title = product.kind === "moment" ? `${product.name} № ${product.code} — свеча «${product.title}»` : product.name;
  return { title, description, openGraph: { title, description } };
}

function Scale({ label, value, left, right }: { label: string; value: number; left?: string; right?: string }) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <div className="mt-2 flex gap-1" role="img" aria-label={`${label}: ${value} из 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= value ? "bg-amber" : "bg-line"}`} />
        ))}
      </div>
      {left && (
        <p className="mt-1 flex justify-between text-xs text-muted">
          <span>{left}</span>
          <span>{right}</span>
        </p>
      )}
    </div>
  );
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const story = getStory(product.storySlug)!;
  const available = story.status === "available";
  const storyMoments = momentsOf(story.slug);
  const isMoment = product.kind === "moment";
  const index = isMoment ? storyMoments.findIndex((m) => m.slug === product.slug) : -1;
  const prev: Moment | undefined = storyMoments[index - 1];
  const next: Moment | undefined = index >= 0 ? storyMoments[index + 1] : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: site.name },
    description: isMoment ? product.scene : product.description,
    offers: {
      "@type": "Offer",
      priceCurrency: "RUB",
      price: minPrice(product),
      availability: available ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      url: `${site.url}/product/${product.slug}`,
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav className="text-sm text-muted" aria-label="Навигация">
        <Link href="/catalog" className="hover:text-ink">Каталог</Link>
        <span className="mx-2">/</span>
        <Link href={`/stories/${story.slug}`} className="hover:text-ink">{story.title}</Link>
      </nav>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[2rem] border border-line bg-surface md:sticky md:top-24">
          {isMoment && momentPhoto(product.slug) ? (
            <MomentPhoto photo={momentPhoto(product.slug)!} sizes="(min-width: 768px) 50vw, 100vw" preload />
          ) : (
            <div className="glow absolute inset-0" aria-hidden="true" />
          )}
          {isMoment && momentPhoto(product.slug) ? null : isMoment ? (
            <CandleArt color={story.color} code={product.code} name={product.name} caption={product.title.toLowerCase()} lit={available} className="relative h-4/5" />
          ) : (
            <div className="relative flex items-end gap-2">
              {storyMoments.slice(0, product.picks || 5).map((m) => (
                <CandleArt key={m.slug} color={story.color} code={m.code} name={m.name} className="h-28 sm:h-36" />
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="eyebrow flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: story.color }} aria-hidden="true" />
            {story.title}
            {isMoment && ` · ${momentNumber(product.code)}`}
          </p>
          <h1 className="mt-3 font-display text-5xl tracking-wide sm:text-6xl">{product.name}</h1>
          {isMoment && <p className="mt-1 text-lg italic text-muted">{product.title.toLowerCase()}</p>}
          <p className="mt-5 text-lg text-muted">{isMoment ? product.scene : product.description}</p>

          {isMoment && (
            <>
              <dl className="mt-8 grid grid-cols-3 gap-3 text-sm">
                {(
                  [
                    ["Верхние ноты", product.notes.top],
                    ["Сердце", product.notes.heart],
                    ["База", product.notes.base],
                  ] as const
                ).map(([label, note]) => (
                  <div key={label} className="rounded-2xl border border-line p-3">
                    <dt className="eyebrow">{label}</dt>
                    <dd className="mt-1">{note}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Scale label="Сила аромата" value={product.strength} />
                <Scale label="Характер" value={product.warmth} left="свежий" right="тёплый" />
              </div>
              <p className="mt-4 text-sm text-muted">Семейство: {familyLabels[product.family]}</p>
            </>
          )}

          {product.kind === "set" && product.picks === 0 && (
            <ul className="mt-6 space-y-1 text-sm">
              {storyMoments.map((m) => (
                <li key={m.slug}>
                  {momentNumber(m.code)} · {m.name}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 border-t border-line pt-8">
            {available ? (
              <AddToCart
                product={product}
                pickOptions={storyMoments.map((m) => ({
                  slug: m.slug,
                  name: m.name,
                  label: momentNumber(m.code),
                }))}
              />
            ) : (
              <div className="rounded-2xl border border-line p-5">
                <p className="font-semibold">Выход истории: {story.release}</p>
                <p className="mt-1 text-sm text-muted">
                  Цена — от {formatRub(minPrice(product))}. Сообщим о старте предзаказа в{" "}
                  <a href={site.contacts.telegram} className="text-amber-strong underline">Telegram</a>.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl bg-resin p-5 text-sm text-on-resin">
            <b className="text-honey">Retour.</b> Когда свеча догорит, верни банку и получи скидку до{" "}
            {retourRewards[2].reward} ₽ на следующий заказ.{" "}
            <Link href="/retour" className="underline">Подробнее</Link>
          </div>

          <div className="mt-6 divide-y divide-line border-y border-line">
            <details className="group py-4">
              <summary className="cursor-pointer font-semibold">Состав и характеристики</summary>
              <ul className="mt-3 space-y-1 text-sm text-muted">
                <li>Воск: соево-кокосовый, растительный</li>
                <li>Фитиль: хлопковый — ровное тихое пламя, или деревянный — потрескивает, как камин (+150 ₽, для 200 и 400 мл)</li>
                <li>Аромат: парфюмерная отдушка для свечей</li>
                <li>Банка: стекло, можно вернуть по программе Retour</li>
                {isMoment && (
                  <li>
                    Время горения: {product.variants.map((v) => `${v.label} — ~${v.burnHours} ч`).join("; ")}
                  </li>
                )}
              </ul>
            </details>
            <details className="py-4">
              <summary className="cursor-pointer font-semibold">Как ухаживать за свечой</summary>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
                <li>Первый раз жги 2–3 часа, пока воск не расплавится до краёв банки — так не будет «тоннеля».</li>
                <li>Перед каждым зажиганием подрезай фитиль до 5 мм.</li>
                <li>Не оставляй горящую свечу без присмотра и не жги дольше 4 часов подряд.</li>
                <li>Гаси, когда на дне остаётся около 1 см воска.</li>
              </ul>
            </details>
          </div>

          {(prev || next) && (
            <nav className="mt-8 flex justify-between gap-4 text-sm" aria-label="Другие моменты истории">
              {prev ? (
                <Link href={`/product/${prev.slug}`} className="hover:text-amber-strong">
                  ← {momentNumber(prev.code)} {prev.name}
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link href={`/product/${next.slug}`} className="text-right hover:text-amber-strong">
                  {momentNumber(next.code)} {next.name} →
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>

      {isMoment && (
        <section className="mt-20 grid items-center gap-10 border-t border-line pt-16 md:grid-cols-2" aria-labelledby="assembly">
          <div>
            <p className="eyebrow">Из чего собрана</p>
            <h2 id="assembly" className="mt-3 font-display text-4xl">
              {product.name} в разборе
            </h2>
            <p className="mt-4 text-muted">
              Растительный воск, хлопковый фитиль, стеклянная банка и бумажная этикетка с номером момента. На дне —
              отметка Retour: когда свеча догорит, банку можно вернуть и получить скидку.
            </p>
          </div>
          <CandleAssembly
            accent={story.color}
            name={product.name}
            code={momentNumber(product.code)}
            caption={product.title.toLowerCase()}
            lid="bamboo"
            wicks={1}
            notes={product.notes}
            className="mx-auto w-full max-w-md text-ink"
            title={`Свеча ${product.name} в разборе`}
          />
        </section>
      )}
    </div>
  );
}
