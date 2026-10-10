import type { Metadata } from "next";
import Link from "next/link";
import { CandleArt } from "@/components/CandleArt";
import { stories } from "@/data/stories";

export const metadata: Metadata = {
  title: "Истории",
  description: "Коллекции свечей AMBRE': каждая — история из пяти ароматов-моментов.",
};

export default function StoriesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <p className="eyebrow">Коллекции</p>
      <h1 className="mt-3 font-display text-5xl">Истории</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Каждая коллекция — история из пяти моментов. Новая выходит каждый сезон.
      </p>

      <div className="mt-12 space-y-6">
        {stories.map((s) => (
          <Link
            key={s.slug}
            href={`/stories/${s.slug}`}
            className="group grid items-center gap-6 overflow-hidden rounded-[2rem] p-8 text-white md:grid-cols-[1fr_auto] md:p-12"
            style={{ background: `linear-gradient(120deg, #1b120b 30%, ${s.color})` }}
          >
            <div>
              <p className="eyebrow !text-white/70">
                {s.status === "available" ? `${s.season} · в продаже` : `Скоро · ${s.release}`}
              </p>
              <h2 className="mt-3 font-display text-4xl">{s.title}</h2>
              <p className="mt-3 max-w-xl text-white/80">{s.tagline}</p>
              <span className="mt-6 inline-block text-sm text-white/90 underline underline-offset-4">
                {s.status === "available" ? "Смотреть историю" : "Заглянуть заранее"}
              </span>
            </div>
            <CandleArt
              color={s.color}
              lit={s.status === "available"}
              className="hidden h-48 transition-transform duration-500 group-hover:-translate-y-1 md:block"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
