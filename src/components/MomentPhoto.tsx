import Image from "next/image";
import type { Photo } from "@/data/photos";

/** Снимок свечи на сливочном фоне, заполняет родительский блок. */
export function MomentPhoto({ photo, sizes, preload, className = "" }: { photo: Photo; sizes: string; preload?: boolean; className?: string }) {
  return (
    <Image
      src={photo.src}
      alt={photo.alt}
      fill
      sizes={sizes}
      preload={preload}
      className={`object-cover ${className}`}
    />
  );
}
