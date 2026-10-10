import Link from "next/link";
import { CandleArt } from "@/components/CandleArt";
import { MomentPhoto } from "@/components/MomentPhoto";
import { momentPhoto } from "@/data/photos";
import { minPrice, momentNumber, type Product } from "@/data/products";
import { getStory } from "@/data/stories";
import { formatRub } from "@/lib/pricing";

export function ProductCard({ product }: { product: Product }) {
  const story = getStory(product.storySlug)!;
  const available = story.status === "available";
  const isMoment = product.kind === "moment";
  const photo = isMoment ? momentPhoto(product.slug) : undefined;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col rounded-3xl border border-line bg-surface p-4 transition-colors hover:border-amber"
    >
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-bg ${isMoment ? "aspect-square" : "aspect-[4/3]"}`}
      >
        {!photo && <div className="glow absolute inset-0" aria-hidden="true" />}
        {photo ? (
          <MomentPhoto
            photo={photo}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : isMoment ? (
          <CandleArt
            color={story.color}
            code={product.code}
            name={product.name}
            caption={product.title.toLowerCase()}
            lit={available}
            className="relative h-4/5 transition-transform duration-500 group-hover:-translate-y-1"
          />
        ) : (
          <div className="relative flex items-end gap-1">
            {[0, 1, 2].map((i) => (
              <CandleArt key={i} color={story.color} className={i === 1 ? "h-32 sm:h-40" : "h-24 sm:h-32"} />
            ))}
          </div>
        )}
        {!available && (
          <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-xs text-bg">
            Скоро · {story.release}
          </span>
        )}
      </div>
      <div className="mt-4 flex flex-1 flex-col">
        <p className="eyebrow flex items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: story.color }} aria-hidden="true" />
          {story.title}
          {isMoment && ` · ${momentNumber(product.code)}`}
        </p>
        <h3 className="mt-1 font-display text-2xl tracking-wide">{product.name}</h3>
        {isMoment && <p className="text-sm italic text-muted">{product.title.toLowerCase()}</p>}
        <p className="mt-2 flex-1 text-sm text-muted">
          {isMoment
            ? [product.notes.top, product.notes.heart, product.notes.base].join(" · ")
            : product.description}
        </p>
        <p className="mt-3 font-semibold">
          {available ? `${isMoment ? "от " : ""}${formatRub(minPrice(product))}` : "Предзаказ скоро"}
        </p>
      </div>
    </Link>
  );
}
