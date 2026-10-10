import Link from "next/link";
import { site } from "@/data/site";

const COLUMNS = [
  {
    title: "Магазин",
    links: [
      { href: "/stories", label: "Истории" },
      { href: "/catalog", label: "Каталог" },
      { href: "/retour", label: "Retour — возврат банок" },
      { href: "/corporate", label: "Корпоративные подарки" },
    ],
  },
  {
    title: "Покупателям",
    links: [
      { href: "/delivery", label: "Доставка и оплата" },
      { href: "/about", label: "О нас и уход за свечой" },
      { href: "/contacts", label: "Контакты" },
    ],
  },
  {
    title: "Документы",
    links: [
      { href: "/legal/offer", label: "Публичная оферта" },
      { href: "/legal/privacy", label: "Политика конфиденциальности" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-resin text-on-resin">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <p className="wordmark text-xl">AMBRE&apos;</p>
          <p className="mt-3 text-sm text-on-resin/70">{site.slogan}</p>
          <div className="mt-5 flex gap-4 text-sm">
            <a href={site.contacts.telegram} className="hover:text-honey">Telegram</a>
            <a href={site.contacts.vk} className="hover:text-honey">VK</a>
          </div>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-xs uppercase tracking-[0.2em] text-on-resin/60">{col.title}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-on-resin/85 hover:text-honey">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-on-resin/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-on-resin/55">
          {site.legal.seller}, ИНН {site.legal.inn}. Свечи из растительного воска ручной работы.
        </p>
      </div>
    </footer>
  );
}
