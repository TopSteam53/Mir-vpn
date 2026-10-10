import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CandleArt } from "@/components/CandleArt";
import { MomentPhoto } from "@/components/MomentPhoto";
import { momentPhoto } from "@/data/photos";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { WaitlistForm } from "@/components/WaitlistForm";
import { momentNumber, momentsOf, setsOf } from "@/data/products";
import { site } from "@/data/site";
import { getStory, stories } from "@/data/stories";
import { formatRub } from "@/lib/pricing";

export function generateStaticParams() {
  return stories.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/stories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) return {};
  return { title: `История «${story.title}»`, description: story.tagline };
}

export default async function StoryPage({ params }: PageProps<"/stories/[slug]">) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();
  const moments = momentsOf(story.slug);
  const available = story.status === "available";

  return (
    <>
      <section
        className="text-white"
        style={{ background: `linear-gradient(180deg, #1b120b, ${story.color} 160%)` }}
      >
        <div className="mx-auto max-w-4xl px-4 py-20 text-center md:py-28">
          <p className="eyebrow !text-white/70">
            История · {available ? story.season : `выход: ${story.release}`}
          </p>
          <h1 className="mt-4 font-display text-5xl sm:text-6xl">{story.title}</h1>
          <div className="mx-auto mt-6 max-w-2xl space-y-4 text-lg text-white/80">
            {story.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <ol className="space-y-20 md:space-y-28">
          {moments.map((m, i) => (
            <li key={m.slug}>
              <Reveal
                className={`grid items-center gap-8 md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}
              >
                {momentPhoto(m.slug) ? (
                  <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-[2rem] border border-line">
                    <MomentPhoto photo={momentPhoto(m.slug)!} sizes="(min-width: 768px) 384px, 100vw" />
                  </div>
                ) : (
                  <div className="relative mx-auto w-full max-w-xs">
                    <div className="glow absolute -inset-8" aria-hidden="true" />
                    <CandleArt color={story.color} code={m.code} name={m.name} caption={m.title.toLowerCase()} lit={available} className="relative w-full" />
                  </div>
                )}
                <div>
                  <p className="font-display text-6xl" style={{ color: story.color }}>
                    {momentNumber(m.code)}
                  </p>
                  <h2 className="mt-2 font-display text-5xl tracking-wide">{m.name}</h2>
                  <p className="mt-1 text-lg italic text-muted">{m.title.toLowerCase()}</p>
                  <p className="mt-4 text-lg text-muted">{m.scene}</p>
                  <dl className="mt-6 grid grid-cols-3 gap-3 text-sm">
                    {(
                      [
                        ["Верх", m.notes.top],
                        ["Сердце", m.notes.heart],
                        ["База", m.notes.base],
                      ] as const
                    ).map(([label, note]) => (
                      <div key={label} className="rounded-2xl border border-line p-3">
                        <dt className="eyebrow">{label}</dt>
                        <dd className="mt-1">{note}</dd>
                      </div>
                    ))}
                  </dl>
                  {available ? (
                    <Link href={`/product/${m.slug}`} className="btn btn-primary mt-6">
                      Выбрать объём · от {formatRub(m.variants[0].price)}
                    </Link>
                  ) : (
                    <p className="mt-6 text-sm text-muted">В продаже с выходом истории.</p>
                  )}
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-8">
        {available ? (
          <Reveal>
            <h2 className="text-center font-display text-4xl">Собери всю историю</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-muted">
              Все пять моментов в мини-формате, чтобы прожить историю целиком, или три на выбор.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {setsOf(story.slug).map((s) => (
                <ProductCard key={s.slug} product={s} />
              ))}
            </div>
          </Reveal>
        ) : (
          <div className="rounded-3xl border border-line p-8 text-center">
            <h2 className="font-display text-3xl">Выход истории: {story.release}</h2>
            <p className="mt-3 text-muted">Оставь контакт — сообщим о старте предзаказа первым.</p>
            <div className="mx-auto mt-6 max-w-md">
              <WaitlistForm story={story.slug} />
            </div>
            <p className="mt-6 text-sm text-muted">
              Или следи за новостями в{" "}
              <a href={site.contacts.telegram} className="text-amber-strong underline">
                Telegram-канале
              </a>
              .
            </p>
          </div>
        )}
      </section>
    </>
  );
}
