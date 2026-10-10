export type StoryStatus = "available" | "soon";

export type Story = {
  slug: string;
  title: string;
  /** Короткая подпись для карточек */
  tagline: string;
  /** Вступление на странице истории */
  intro: string[];
  /** Цвет-акцент истории */
  color: string;
  season: string;
  status: StoryStatus;
  /** Когда выходит, для историй со статусом soon */
  release?: string;
};

export const stories: Story[] = [
  {
    slug: "tot-samyj-dekabr",
    title: "Тот самый декабрь",
    tagline: "Не открыточный Новый год, а тот, который правда помнишь.",
    intro: [
      "Каток с друзьями, мандарины в карманах куртки, первая своя ёлка, бенгальские огни на балконе и тихое утро первого января.",
      "Пять моментов — пять свечей. Зажигай по порядку, и декабрь проиграется заново.",
    ],
    color: "#A3262A",
    season: "Зима",
    status: "available",
  },
  {
    slug: "gorod-ne-spit",
    title: "Город не спит",
    tagline: "Одна ночь в большом городе — от заката на крыше до первого кофе.",
    intro: [
      "Нагретый бетон крыши, неон в лужах после дождя, винил в баре, такси в три часа ночи и кофейня, которая ещё не открылась.",
      "История для тех, кто любит город ночью.",
    ],
    color: "#6B4EFF",
    season: "Всесезонная",
    status: "soon",
    release: "февраль 2027",
  },
  {
    slug: "gde-to-na-yuge",
    title: "Где-то на юге",
    tagline: "Спонтанная поездка к морю с друзьями.",
    intro: [
      "Трасса на рассвете, инжир с придорожного рынка, солнцезащитный крем, костёр у ночного моря и песок в кроссовках по дороге домой.",
    ],
    color: "#2F9C95",
    season: "Лето",
    status: "soon",
    release: "май 2027",
  },
  {
    slug: "pervaya-svoya-kvartira",
    title: "Первая своя квартира",
    tagline: "Переезд, пустые стены и первые свои правила.",
    intro: [
      "Коробки и пицца на полу, первая монстера, свежие простыни, субботние блины и ключи от дома, который правда твой.",
    ],
    color: "#8FA58A",
    season: "Осень",
    status: "soon",
    release: "сентябрь 2027",
  },
];

export function getStory(slug: string): Story | undefined {
  return stories.find((s) => s.slug === slug);
}
