"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCartCount } from "@/lib/cart-store";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV = [
  { href: "/stories", label: "Истории" },
  { href: "/catalog", label: "Каталог" },
  { href: "/builder", label: "Конструктор" },
  { href: "/gift", label: "Сертификаты" },
  { href: "/retour", label: "Retour" },
  { href: "/corporate", label: "Компаниям" },
  { href: "/about", label: "О нас" },
];

export function Header() {
  const count = useCartCount();
  const pathname = usePathname();
  const [openFor, setOpenFor] = useState<string | null>(null);
  // Меню закрывается само при переходе на другую страницу
  const open = openFor === pathname;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="wordmark text-lg" aria-label="AMBRE' — на главную">
          AMBRE&apos;
        </Link>

        <nav className="hidden items-center gap-7 text-sm md:flex" aria-label="Основное меню">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                pathname.startsWith(item.href)
                  ? "text-amber-strong"
                  : "text-ink/80 transition-colors hover:text-ink"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            href="/cart"
            className="relative flex h-11 w-11 items-center justify-center rounded-full hover:bg-ink/5"
            aria-label={`Корзина, товаров: ${count}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 8h12l-1 12H7L6 8Z M9 8V6a3 3 0 0 1 6 0v2"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
            {count > 0 && (
              <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber px-1 text-[11px] font-bold text-on-amber">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-ink/5 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setOpenFor(open ? null : pathname)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" />
              ) : (
                <path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="1.6" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" className="border-t border-line md:hidden" aria-label="Меню">
          <ul className="mx-auto max-w-6xl px-4 py-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block py-3 text-lg">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
