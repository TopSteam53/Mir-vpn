export type VariantId = "mini" | "200" | "400";

export type Variant = {
  id: VariantId;
  label: string;
  volumeMl: number;
  burnHours: number;
  price: number;
};

export type Family = "fresh" | "woody" | "gourmand" | "spicy" | "floral";

export const familyLabels: Record<Family, string> = {
  fresh: "Свежие",
  woody: "Древесные",
  gourmand: "Сладкие",
  spicy: "Пряные",
  floral: "Цветочные",
};

export type Moment = {
  kind: "moment";
  slug: string;
  storySlug: string;
  number: number;
  /** Сквозной номер: первая цифра — история, две последние — момент (101, 205…) */
  code: number;
  /** Короткое название, одно слово */
  name: string;
  /** Момент, о котором свеча: «Каток в парке» */
  title: string;
  scene: string;
  notes: { top: string; heart: string; base: string };
  family: Family;
  /** Сила аромата, 1–5 */
  strength: number;
  /** 1 — свежий, 5 — тёплый */
  warmth: number;
  variants: Variant[];
};

export type SetProduct = {
  kind: "set";
  slug: string;
  storySlug: string;
  name: string;
  description: string;
  /** Сколько мини-свечей нужно выбрать; 0 — состав фиксированный (все моменты истории) */
  picks: number;
  price: number;
};

export type Product = Moment | SetProduct;

const VARIANTS: Variant[] = [
  { id: "mini", label: "Мини 70 мл", volumeMl: 70, burnHours: 12, price: 590 },
  { id: "200", label: "200 мл", volumeMl: 200, burnHours: 40, price: 1390 },
  { id: "400", label: "400 мл, 2 фитиля", volumeMl: 400, burnHours: 60, price: 2290 },
];

const STORY_INDEX: Record<string, number> = {
  "tot-samyj-dekabr": 1,
  "gorod-ne-spit": 2,
  "gde-to-na-yuge": 3,
  "pervaya-svoya-kvartira": 4,
};

function moment(
  storySlug: string,
  number: number,
  slug: string,
  name: string,
  title: string,
  scene: string,
  notes: [string, string, string],
  family: Family,
  strength: number,
  warmth: number,
): Moment {
  return {
    kind: "moment",
    slug,
    storySlug,
    number,
    code: STORY_INDEX[storySlug] * 100 + number,
    name,
    title,
    scene,
    notes: { top: notes[0], heart: notes[1], base: notes[2] },
    family,
    strength,
    warmth,
    variants: VARIANTS,
  };
}

const DEC = "tot-samyj-dekabr";
const CITY = "gorod-ne-spit";
const SOUTH = "gde-to-na-yuge";
const FLAT = "pervaya-svoya-kvartira";

export const moments: Moment[] = [
  moment(DEC, 1, "inej", "Иней", "Каток в парке",
    "Вечер, гирлянды, музыка из колонок. Щёки мёрзнут, а уходить не хочется.",
    ["морозная мята", "хвоя", "белый мускус"], "fresh", 3, 2),
  moment(DEC, 2, "cedra", "Цедра", "Мандарин в кармане",
    "Ты чистишь его прямо на улице, и пальцы пахнут мандарином до самого дома.",
    ["мандарин", "гвоздика", "снежная свежесть"], "spicy", 4, 3),
  moment(DEC, 3, "smola", "Смола", "Ёлка в съёмной квартире",
    "Первая своя ёлка. Игрушки с распродажи, но лучше неё нет.",
    ["хвоя", "смола", "корица"], "woody", 4, 4),
  moment(DEC, 4, "iskry", "Искры", "Бенгальские огни",
    "Без пяти полночь, балкон, все загадывают желание.",
    ["искристый апельсин", "дымок", "ваниль"], "gourmand", 3, 4),
  moment(DEC, 5, "pled", "Плед", "Первое утро января",
    "Тишина, плед, какао и никаких планов.",
    ["какао", "маршмеллоу", "кашемир"], "gourmand", 3, 5),

  moment(CITY, 1, "zakat", "Закат", "Крыша на закате",
    "Нагретый за день бетон, город внизу становится оранжевым.",
    ["апельсин", "амбра", "тёплый камень"], "woody", 3, 4),
  moment(CITY, 2, "neon", "Неон", "Неон после дождя",
    "Час ночи, асфальт ещё мокрый, вывески отражаются в лужах.",
    ["лайм", "озон", "холодный металл"], "fresh", 3, 1),
  moment(CITY, 3, "vinil", "Винил", "Винил в баре",
    "Кто-то поставил пластинку, и все замолчали.",
    ["вишня", "кожа", "дубовая бочка"], "woody", 4, 4),
  moment(CITY, 4, "polnoch", "Полночь", "Такси в 3:00",
    "Тёплый салон, кожаные сиденья, огни за окном.",
    ["кожа", "табак", "ветивер"], "woody", 4, 4),
  moment(CITY, 5, "obzharka", "Обжарка", "Кофейня до открытия",
    "Ты первый гость, бариста ещё раскладывает выпечку.",
    ["эспрессо", "кардамон", "сливочная ваниль"], "gourmand", 4, 4),

  moment(SOUTH, 1, "trassa", "Трасса", "Трасса на рассвете",
    "Выехали в пять утра, окна открыты, впереди полторы тысячи километров.",
    ["грейпфрут", "свежая трава", "утренний воздух"], "fresh", 3, 1),
  moment(SOUTH, 2, "inzhir", "Инжир", "Инжир с рынка",
    "Остановка у дороги, тёплые фрукты прямо из ящика.",
    ["инжир", "зелёный лист", "мёд"], "gourmand", 3, 3),
  moment(SOUTH, 3, "zagar", "Загар", "Солнцезащитный крем",
    "Пляж, полотенце, и крем пахнет летом.",
    ["кокос", "тиаре", "солёная кожа"], "floral", 3, 3),
  moment(SOUTH, 4, "priboj", "Прибой", "Ночное море",
    "Костёр, гитара, волны в темноте.",
    ["морская соль", "водоросли", "дымок плавника"], "fresh", 3, 2),
  moment(SOUTH, 5, "pesok", "Песок", "Дорога домой",
    "Песок в кроссовках и фотки, которые разбирать до осени.",
    ["сухая трава", "кедр", "тёплый мускус"], "woody", 3, 4),

  moment(FLAT, 1, "pereezd", "Переезд", "Коробки и пицца",
    "Вещи ещё не разобраны, едите прямо на полу.",
    ["базилик", "томатный лист", "тёплое тесто"], "fresh", 3, 3),
  moment(FLAT, 2, "monstera", "Монстера", "Монстера на подоконнике",
    "Первое растение, у него уже есть имя.",
    ["зелёные листья", "бамбук", "влажная земля"], "fresh", 2, 2),
  moment(FLAT, 3, "hlopok", "Хлопок", "Свежие простыни",
    "Новая постель, впервые спишь на своём.",
    ["лаванда", "хлопок", "белый мускус"], "floral", 2, 2),
  moment(FLAT, 4, "subbota", "Суббота", "Субботние блины",
    "Никто не торопит, на кухне играет музыка.",
    ["сливочное масло", "ваниль", "кленовый сироп"], "gourmand", 4, 5),
  moment(FLAT, 5, "klyuch", "Ключ", "Ключи от дома",
    "Ты возвращаешься, и это правда твой дом.",
    ["бергамот", "чай", "сандал"], "woody", 3, 4),
];

export const sets: SetProduct[] = [
  {
    kind: "set",
    slug: "vsya-istoriya-dekabr",
    storySlug: DEC,
    name: "Вся история: Тот самый декабрь",
    description:
      "Все пять моментов истории в мини-формате и буклет с историей. Зажигай по порядку — с первого до пятого.",
    picks: 0,
    price: 2490,
  },
  {
    kind: "set",
    slug: "prolog-dekabr",
    storySlug: DEC,
    name: "Пролог: три момента декабря",
    description: "Три мини-свечи на твой выбор, чтобы познакомиться с историей.",
    picks: 3,
    price: 1490,
  },
];

export const products: Product[] = [...moments, ...sets];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getMoment(slug: string): Moment | undefined {
  return moments.find((m) => m.slug === slug);
}

export function momentsOf(storySlug: string): Moment[] {
  return moments
    .filter((m) => m.storySlug === storySlug)
    .sort((a, b) => a.number - b.number);
}

export function setsOf(storySlug: string): SetProduct[] {
  return sets.filter((s) => s.storySlug === storySlug);
}

export function momentNumber(code: number): string {
  return `№ ${code}`;
}

export function minPrice(p: Product): number {
  return p.kind === "set" ? p.price : Math.min(...p.variants.map((v) => v.price));
}
