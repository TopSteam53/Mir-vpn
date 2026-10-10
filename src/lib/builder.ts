import {
  builderIntensity,
  builderJars,
  builderLids,
  builderNotes,
  builderSizes,
  builderWaxes,
  builderWicks,
  CUSTOM_BLEND_PRICE,
  LABEL_TEXT_MAX,
  LABEL_TITLE_MAX,
  noteLevels,
} from "@/data/builder";
import { getMoment } from "@/data/products";
import { getStory } from "@/data/stories";

export type BuilderConfig = {
  size: (typeof builderSizes)[number]["id"];
  jar: (typeof builderJars)[number]["id"];
  wax: (typeof builderWaxes)[number]["id"];
  wick: (typeof builderWicks)[number]["id"];
  lid: (typeof builderLids)[number]["id"];
  intensity: (typeof builderIntensity)[number]["id"];
  /** Готовый аромат одного из моментов — или null, если композиция собрана из нот */
  scent: string | null;
  /** Ноты по уровням, используются, когда scent = null */
  notes: { top?: string; heart?: string; base?: string };
  title: string;
  text: string;
};

export const defaultBuilderConfig: BuilderConfig = {
  size: "200",
  jar: "amber",
  wax: "natural",
  wick: "cotton",
  lid: "bamboo",
  intensity: "medium",
  scent: null,
  notes: { top: "mandarin", heart: "black-tea", base: "vanilla" },
  title: "",
  text: "",
};

const find = <T extends { id: string }>(list: readonly T[], id: string) => list.find((o) => o.id === id);

export function cleanLabel(value: string, max: number): string {
  // Без управляющих символов и лишних пробелов: текст печатается на этикетке
  return value.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

/** Проверяет конфигурацию. Возвращает текст ошибки или null. */
export function builderError(c: BuilderConfig): string | null {
  if (!find(builderSizes, c.size)) return "Выберите объём";
  if (!find(builderJars, c.jar)) return "Выберите банку";
  if (!find(builderWaxes, c.wax)) return "Выберите цвет воска";
  if (!find(builderWicks, c.wick)) return "Выберите фитиль";
  if (!find(builderLids, c.lid)) return "Выберите крышку";
  if (!find(builderIntensity, c.intensity)) return "Выберите насыщенность";
  if (c.wick === "wood" && c.size === "mini") return "Деревянный фитиль не подходит для мини-свечи";

  if (c.scent !== null) {
    const moment = getMoment(c.scent);
    if (!moment || getStory(moment.storySlug)?.status !== "available") return "Этот аромат пока недоступен";
  } else {
    const picked = noteLevels.filter((l) => c.notes[l.id]);
    if (picked.length === 0) return "Выберите хотя бы одну ноту";
    for (const level of picked) {
      const note = builderNotes.find((n) => n.id === c.notes[level.id]);
      if (!note || note.level !== level.id) return "Неизвестная нота";
    }
  }

  if (cleanLabel(c.title, LABEL_TITLE_MAX).length < 2) return "Придумайте название для своей свечи";
  if (c.title.length > LABEL_TITLE_MAX || c.text.length > LABEL_TEXT_MAX) return "Слишком длинный текст этикетки";
  return null;
}

export function builderPrice(c: BuilderConfig): number {
  return (
    (find(builderSizes, c.size)?.price ?? 0) +
    (find(builderJars, c.jar)?.price ?? 0) +
    (find(builderWaxes, c.wax)?.price ?? 0) +
    (find(builderWicks, c.wick)?.price ?? 0) +
    (find(builderLids, c.lid)?.price ?? 0) +
    (find(builderIntensity, c.intensity)?.price ?? 0) +
    (c.scent === null ? CUSTOM_BLEND_PRICE : 0)
  );
}

export function scentLabel(c: BuilderConfig): string {
  if (c.scent !== null) return `аромат «${getMoment(c.scent)?.name ?? c.scent}»`;
  const notes = noteLevels
    .map((l) => builderNotes.find((n) => n.id === c.notes[l.id])?.label)
    .filter(Boolean);
  return `ноты: ${notes.join(", ").toLowerCase()}`;
}

/** Короткое название для корзины и чека и полное описание для заказа. */
export function describeBuilder(c: BuilderConfig): { title: string; details: string } {
  const size = find(builderSizes, c.size)?.label ?? c.size;
  return {
    title: `Своя свеча «${cleanLabel(c.title, LABEL_TITLE_MAX)}», ${size}`,
    details: [
      find(builderJars, c.jar)?.label,
      `воск: ${find(builderWaxes, c.wax)?.label.toLowerCase()}`,
      `фитиль: ${find(builderWicks, c.wick)?.label.toLowerCase()}`,
      `крышка: ${find(builderLids, c.lid)?.label.toLowerCase()}`,
      scentLabel(c),
      `насыщенность: ${find(builderIntensity, c.intensity)?.label.toLowerCase()}`,
      c.text ? `текст: «${cleanLabel(c.text, LABEL_TEXT_MAX)}»` : "",
    ]
      .filter(Boolean)
      .join("; "),
  };
}
