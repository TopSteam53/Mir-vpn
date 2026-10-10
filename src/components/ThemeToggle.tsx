"use client";

const STORAGE_KEY = "ambre-theme";

/** Скрипт для <head>: применяет сохранённую тему до первой отрисовки, чтобы не было вспышки. */
export const themeScript = `try{var t=localStorage.getItem("${STORAGE_KEY}");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;

export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const current =
      root.dataset.theme ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // тема просто не запомнится
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-ink/5"
      aria-label="Переключить светлую и тёмную тему"
    >
      {/* Иконка определяется темой через CSS, без состояния в React */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="dark:hidden">
        <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="hidden dark:block">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
