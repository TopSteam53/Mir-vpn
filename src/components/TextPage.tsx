import type { ReactNode } from "react";

export function TextPage({ eyebrow, title, children }: { eyebrow?: string; title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="mt-3 font-display text-5xl">{title}</h1>
      <div className="prose-ambre mt-8 text-lg leading-relaxed text-muted">{children}</div>
    </div>
  );
}
