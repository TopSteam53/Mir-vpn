// Фотореалистичные 3D-рендеры (Blender) — стоят вместо фотографий до настоящей съёмки.
// Когда появятся снимки, положите их в public/images/candles/ с теми же именами.

export type Photo = { src: string; alt: string };

const momentPhotos: Record<string, Photo> = {
  inej: { src: "/images/candles/101-inej.webp", alt: "Свеча AMBRE' № 101 «Иней» в янтарной банке 200 мл, горит" },
  cedra: { src: "/images/candles/102-cedra.webp", alt: "Свеча AMBRE' № 102 «Цедра» в янтарной банке 200 мл, горит" },
  smola: { src: "/images/candles/103-smola.webp", alt: "Свеча AMBRE' № 103 «Смола» в янтарной банке 200 мл, горит" },
  iskry: { src: "/images/candles/104-iskry.webp", alt: "Свеча AMBRE' № 104 «Искры» в янтарной банке 200 мл, горит" },
  pled: { src: "/images/candles/105-pled.webp", alt: "Свеча AMBRE' № 105 «Плед» в янтарной банке 200 мл, горит" },
};

export function momentPhoto(slug: string): Photo | undefined {
  return momentPhotos[slug];
}
