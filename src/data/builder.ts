// Варианты конструктора «Своя свеча». Цены — доплаты к базовой цене объёма.

export type Option<Id extends string = string> = {
  id: Id;
  label: string;
  hint?: string;
  price: number;
};

export const builderSizes = [
  { id: "mini", label: "Мини 70 мл", hint: "~12 часов", price: 790 },
  { id: "200", label: "200 мл", hint: "~40 часов", price: 1690 },
  { id: "400", label: "400 мл, 2 фитиля", hint: "~60 часов", price: 2590 },
] as const satisfies readonly Option[];

export const builderJars = [
  { id: "amber", label: "Янтарное стекло", hint: "фирменное", price: 0, glass: "#c8862e", glassDark: "#7a4a17", opacity: 0.92 },
  { id: "black", label: "Чёрное матовое", hint: "для вечера", price: 150, glass: "#2b2724", glassDark: "#0f0d0c", opacity: 0.97 },
  { id: "clear", label: "Прозрачное", hint: "виден воск", price: 0, glass: "#e8eeec", glassDark: "#a9b6b3", opacity: 0.35 },
  { id: "frost", label: "Белое матовое", hint: "минимализм", price: 100, glass: "#f1ece4", glassDark: "#cfc6b8", opacity: 0.95 },
] as const satisfies readonly (Option & { glass: string; glassDark: string; opacity: number })[];

export const builderWaxes = [
  { id: "natural", label: "Натуральный", price: 0, color: "#f4e6cc" },
  { id: "blush", label: "Пудровый", price: 100, color: "#efc9c0" },
  { id: "sage", label: "Шалфейный", price: 100, color: "#c9d3b8" },
  { id: "graphite", label: "Графитовый", price: 100, color: "#6b6560" },
] as const satisfies readonly (Option & { color: string })[];

export const builderWicks = [
  { id: "cotton", label: "Хлопковый", hint: "ровное тихое пламя", price: 0 },
  { id: "wood", label: "Деревянный", hint: "потрескивает, как камин", price: 150 },
] as const satisfies readonly Option[];

export const builderLids = [
  { id: "none", label: "Без крышки", price: 0 },
  { id: "bamboo", label: "Бамбуковая", price: 120 },
  { id: "metal", label: "Металлическая, золото", price: 150 },
] as const satisfies readonly Option[];

export const builderIntensity = [
  { id: "soft", label: "Мягкий", hint: "для спальни", price: 0 },
  { id: "medium", label: "Средний", hint: "для комнаты", price: 0 },
  { id: "strong", label: "Яркий", hint: "для большой гостиной", price: 100 },
] as const satisfies readonly Option[];

export type NoteLevel = "top" | "heart" | "base";

export const noteLevels: { id: NoteLevel; label: string; hint: string }[] = [
  { id: "top", label: "Верхняя нота", hint: "первое впечатление" },
  { id: "heart", label: "Нота сердца", hint: "характер аромата" },
  { id: "base", label: "Базовая нота", hint: "то, что остаётся" },
];

export const builderNotes: { id: string; label: string; level: NoteLevel; color: string }[] = [
  { id: "bergamot", label: "Бергамот", level: "top", color: "#c9d36a" },
  { id: "mandarin", label: "Мандарин", level: "top", color: "#f29a3a" },
  { id: "grapefruit", label: "Грейпфрут", level: "top", color: "#f07a6a" },
  { id: "lime", label: "Лайм", level: "top", color: "#9bcf53" },
  { id: "mint", label: "Мята", level: "top", color: "#7fd1b9" },
  { id: "sea-salt", label: "Морская соль", level: "top", color: "#8fc3d9" },
  { id: "lavender", label: "Лаванда", level: "heart", color: "#a58fd1" },
  { id: "rose", label: "Роза", level: "heart", color: "#e07a95" },
  { id: "jasmine", label: "Жасмин", level: "heart", color: "#f2e3a0" },
  { id: "fig", label: "Инжир", level: "heart", color: "#8a5a7a" },
  { id: "black-tea", label: "Чёрный чай", level: "heart", color: "#8a5a2b" },
  { id: "cardamom", label: "Кардамон", level: "heart", color: "#b7b06a" },
  { id: "pine", label: "Хвоя", level: "heart", color: "#3f7a52" },
  { id: "vanilla", label: "Ваниль", level: "base", color: "#f0d9a8" },
  { id: "sandalwood", label: "Сандал", level: "base", color: "#c09a6b" },
  { id: "cedar", label: "Кедр", level: "base", color: "#9a6b45" },
  { id: "amber", label: "Амбра", level: "base", color: "#c8862e" },
  { id: "tobacco", label: "Табак", level: "base", color: "#7a5230" },
  { id: "leather", label: "Кожа", level: "base", color: "#5a3a26" },
  { id: "cocoa", label: "Какао", level: "base", color: "#6b4430" },
  { id: "musk", label: "Белый мускус", level: "base", color: "#e6e0d6" },
];

/** Доплата за собственную композицию из нот (ручной подбор отдушек). */
export const CUSTOM_BLEND_PRICE = 200;

export const LABEL_TITLE_MAX = 24;
export const LABEL_TEXT_MAX = 60;

/** Сколько дней на изготовление: соевому воску нужно 7–14 дней созревания после заливки. */
export const BUILDER_LEAD_DAYS = "10–14";
