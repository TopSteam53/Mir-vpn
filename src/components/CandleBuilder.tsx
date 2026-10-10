"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { BuilderPreview } from "@/components/BuilderPreview";
import {
  BUILDER_LEAD_DAYS,
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
  type NoteLevel,
} from "@/data/builder";
import {
  builderError,
  builderPrice,
  cleanLabel,
  defaultBuilderConfig,
  type BuilderConfig,
} from "@/lib/builder";
import { cart } from "@/lib/cart-store";
import { reachGoal } from "@/lib/metrika";
import { CUSTOM_SLUG, formatRub } from "@/lib/pricing";

type ScentOption = { slug: string; name: string; notes: string };

function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-8" aria-labelledby={`step-${n}`}>
      <div className="flex items-baseline gap-3">
        <span className="font-display text-2xl text-amber-strong">{String(n).padStart(2, "0")}</span>
        <h2 id={`step-${n}`} className="font-display text-2xl">
          {title}
        </h2>
      </div>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Choice({
  selected,
  disabled,
  onClick,
  children,
  className = "",
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-2xl border border-line p-3 text-left transition-colors hover:border-amber aria-checked:border-amber aria-checked:bg-amber/10 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

const extra = (price: number) => (price ? `+${formatRub(price)}` : "включено");

export function CandleBuilder({ scents }: { scents: ScentOption[] }) {
  const [config, setConfig] = useState<BuilderConfig>(defaultBuilderConfig);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const update = (patch: Partial<BuilderConfig>) => {
    setAdded(false);
    setConfig((c) => {
      const next = { ...c, ...patch };
      // Деревянный фитиль не помещается в мини-банку
      if (next.size === "mini" && next.wick === "wood") next.wick = "cotton";
      return next;
    });
  };

  const toggleNote = (level: NoteLevel, id: string) =>
    update({ notes: { ...config.notes, [level]: config.notes[level] === id ? undefined : id } });

  const price = builderPrice(config);
  const error = builderError(config);

  function add() {
    if (error) {
      setShowErrors(true);
      return;
    }
    cart.add({
      slug: CUSTOM_SLUG,
      custom: { ...config, title: cleanLabel(config.title, LABEL_TITLE_MAX), text: cleanLabel(config.text, LABEL_TEXT_MAX) },
      qty,
    });
    reachGoal("builder_add_to_cart");
    setAdded(true);
  }

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_420px]">
      <div className="space-y-10 pb-24 lg:order-1 lg:pb-0">
        <Step n={1} title="Объём">
          <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Объём">
            {builderSizes.map((s) => (
              <Choice key={s.id} selected={config.size === s.id} onClick={() => update({ size: s.id })}>
                <span className="block font-semibold">{s.label}</span>
                <span className="block text-sm text-muted">
                  {s.hint} · от {formatRub(s.price)}
                </span>
              </Choice>
            ))}
          </div>
        </Step>

        <Step n={2} title="Банка" hint="Все банки многоразовые — их можно вернуть по программе Retour.">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Банка">
            {builderJars.map((j) => (
              <Choice key={j.id} selected={config.jar === j.id} onClick={() => update({ jar: j.id })}>
                <span
                  className="mb-2 block h-10 w-8 rounded-md border border-line"
                  style={{ background: `linear-gradient(90deg, ${j.glassDark}, ${j.glass}, ${j.glassDark})` }}
                  aria-hidden="true"
                />
                <span className="block text-sm font-semibold">{j.label}</span>
                <span className="block text-xs text-muted">{extra(j.price)}</span>
              </Choice>
            ))}
          </div>
        </Step>

        <Step n={3} title="Аромат" hint="Возьми аромат одного из моментов или собери свой из нот.">
          <div className="flex gap-2" role="radiogroup" aria-label="Способ выбора аромата">
            <button
              type="button"
              role="radio"
              aria-checked={config.scent === null}
              className="chip"
              onClick={() => update({ scent: null })}
            >
              Собрать из нот · +{formatRub(CUSTOM_BLEND_PRICE)}
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={config.scent !== null}
              className="chip"
              onClick={() => update({ scent: config.scent ?? scents[0]?.slug ?? null })}
            >
              Готовый аромат
            </button>
          </div>

          {config.scent === null ? (
            <div className="mt-6 space-y-5">
              {noteLevels.map((level) => (
                <fieldset key={level.id}>
                  <legend className="text-sm">
                    <b>{level.label}</b> <span className="text-muted">— {level.hint}</span>
                  </legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {builderNotes
                      .filter((n) => n.level === level.id)
                      .map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          role="checkbox"
                          aria-checked={config.notes[level.id] === n.id}
                          className="chip flex items-center gap-2"
                          onClick={() => toggleNote(level.id, n.id)}
                        >
                          <span className="h-3 w-3 rounded-full border border-line" style={{ background: n.color }} aria-hidden="true" />
                          {n.label}
                        </button>
                      ))}
                  </div>
                </fieldset>
              ))}
              <p className="text-sm text-muted">
                По одной ноте на уровень. Перед заливкой проверим сочетание и, если ноты спорят друг с другом, предложим замену.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Готовый аромат">
              {scents.map((s) => (
                <Choice key={s.slug} selected={config.scent === s.slug} onClick={() => update({ scent: s.slug })}>
                  <span className="block font-semibold">{s.name}</span>
                  <span className="block text-sm text-muted">{s.notes}</span>
                </Choice>
              ))}
            </div>
          )}

          <fieldset className="mt-6">
            <legend className="text-sm font-semibold">Насыщенность</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3" role="radiogroup">
              {builderIntensity.map((i) => (
                <Choice key={i.id} selected={config.intensity === i.id} onClick={() => update({ intensity: i.id })}>
                  <span className="block font-semibold">{i.label}</span>
                  <span className="block text-xs text-muted">
                    {i.hint} · {extra(i.price)}
                  </span>
                </Choice>
              ))}
            </div>
          </fieldset>
        </Step>

        <Step n={4} title="Воск, фитиль и крышка">
          <fieldset>
            <legend className="text-sm font-semibold">Цвет воска</legend>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup">
              {builderWaxes.map((w) => (
                <Choice key={w.id} selected={config.wax === w.id} onClick={() => update({ wax: w.id })}>
                  <span className="mb-2 block h-6 w-6 rounded-full border border-line" style={{ background: w.color }} aria-hidden="true" />
                  <span className="block text-sm font-semibold">{w.label}</span>
                  <span className="block text-xs text-muted">{extra(w.price)}</span>
                </Choice>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-6">
            <legend className="text-sm font-semibold">Фитиль</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2" role="radiogroup">
              {builderWicks.map((w) => (
                <Choice
                  key={w.id}
                  selected={config.wick === w.id}
                  disabled={w.id === "wood" && config.size === "mini"}
                  onClick={() => update({ wick: w.id })}
                >
                  <span className="block font-semibold">{w.label}</span>
                  <span className="block text-xs text-muted">
                    {w.id === "wood" && config.size === "mini" ? "не для мини-свечи" : `${w.hint} · ${extra(w.price)}`}
                  </span>
                </Choice>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-6">
            <legend className="text-sm font-semibold">Крышка</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3" role="radiogroup">
              {builderLids.map((l) => (
                <Choice key={l.id} selected={config.lid === l.id} onClick={() => update({ lid: l.id })}>
                  <span className="block text-sm font-semibold">{l.label}</span>
                  <span className="block text-xs text-muted">{extra(l.price)}</span>
                </Choice>
              ))}
            </div>
          </fieldset>
        </Step>

        <Step n={5} title="Этикетка" hint="Назови свой момент — это напечатаем на банке.">
          <div className="grid gap-4">
            <label className="block">
              <span className="text-sm text-muted">
                Название · {config.title.length}/{LABEL_TITLE_MAX}
              </span>
              <input
                value={config.title}
                maxLength={LABEL_TITLE_MAX}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Например, «Наш первый отпуск»"
                className="field mt-1"
                aria-invalid={showErrors && cleanLabel(config.title, LABEL_TITLE_MAX).length < 2}
              />
            </label>
            <label className="block">
              <span className="text-sm text-muted">
                Подпись, необязательно · {config.text.length}/{LABEL_TEXT_MAX}
              </span>
              <input
                value={config.text}
                maxLength={LABEL_TEXT_MAX}
                onChange={(e) => update({ text: e.target.value })}
                placeholder="Дата, место или пара слов"
                className="field mt-1"
              />
            </label>
          </div>
        </Step>
      </div>

      {/* Превью и итог */}
      <aside className="order-first lg:order-2">
        <div className="space-y-5 lg:sticky lg:top-24">
          <div className="relative mx-auto aspect-[240/290] max-h-[45vh] w-full overflow-hidden rounded-[2rem] bg-resin lg:max-h-[60vh]">
            <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_35%,rgb(233_182_92/0.25),transparent_70%)]" aria-hidden="true" />
            <div className="relative h-full p-4">
              <BuilderPreview config={config} />
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-surface p-5">
            <div className="flex items-baseline justify-between">
              <span className="text-muted">Твоя свеча</span>
              <span className="font-display text-3xl">{formatRub(price * qty)}</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Сварим вручную за {BUILDER_LEAD_DAYS} дней: воску нужно время, чтобы аромат раскрылся.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 items-center rounded-full border border-line">
                <button type="button" className="h-12 w-11" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Меньше">
                  −
                </button>
                <span className="w-6 text-center">{qty}</span>
                <button type="button" className="h-12 w-11" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Больше">
                  +
                </button>
              </div>
              <button type="button" className="btn btn-primary flex-1" onClick={add}>
                В корзину
              </button>
            </div>
            <p className="mt-3 min-h-5 text-sm" aria-live="polite">
              {showErrors && error ? (
                <span className="text-error">{error}</span>
              ) : added ? (
                <>
                  Добавлено.{" "}
                  <Link href="/cart" className="text-amber-strong underline underline-offset-4">
                    Перейти в корзину
                  </Link>
                </>
              ) : null}
            </p>
          </div>
        </div>
      </aside>

      {/* На телефоне цена и кнопка всегда под рукой */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="flex-1">
            <p className="font-display text-2xl leading-none">{formatRub(price * qty)}</p>
            <p className="mt-1 text-xs text-muted">
              {showErrors && error ? <span className="text-error">{error}</span> : `готово за ${BUILDER_LEAD_DAYS} дней`}
            </p>
          </div>
          {added ? (
            <Link href="/cart" className="btn btn-ghost">
              В корзине ✓
            </Link>
          ) : (
            <button type="button" className="btn btn-primary" onClick={add}>
              В корзину
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
