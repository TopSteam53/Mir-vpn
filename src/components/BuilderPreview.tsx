import { useId } from "react";
import { builderJars, builderNotes, builderWaxes } from "@/data/builder";
import type { BuilderConfig } from "@/lib/builder";

const SIZES = {
  mini: { w: 92, h: 104 },
  "200": { w: 124, h: 150 },
  "400": { w: 164, h: 164 },
} as const;

function splitText(text: string, max = 28): string[] {
  const words = text.split(" ");
  const lines: string[] = [""];
  for (const word of words) {
    const last = lines[lines.length - 1];
    if ((last + " " + word).trim().length <= max) lines[lines.length - 1] = (last + " " + word).trim();
    else if (lines.length < 2) lines.push(word.slice(0, max));
    else break;
  }
  return lines.filter(Boolean);
}

/** Живое превью свечи из конструктора. */
export function BuilderPreview({ config, noteIds }: { config: BuilderConfig; noteIds: string[] }) {
  const id = useId().replace(/:/g, "");
  const jar = builderJars.find((j) => j.id === config.jar)!;
  const wax = builderWaxes.find((w) => w.id === config.wax)!;
  const { w, h } = SIZES[config.size];
  const x = 120 - w / 2;
  const bottom = 268;
  const y = bottom - h;
  const wood = config.wick === "wood";
  const wicks = config.size === "400" ? [120 - w / 5, 120 + w / 5] : [120];
  const dark = config.jar === "black";
  const labelW = Math.min(w - 20, 112);
  const labelH = config.size === "mini" ? 54 : 70;
  const labelY = y + h * 0.36;
  const title = config.title.trim() || "Твой момент";
  const titleSize = title.length > 16 ? 8.5 : title.length > 11 ? 10 : 12;
  const textLines = splitText(config.text.trim(), config.size === "mini" ? 20 : 26);
  const notes = noteIds
    .map((n) => builderNotes.find((note) => note.id === n))
    .filter((n): n is (typeof builderNotes)[number] => Boolean(n));

  return (
    <svg viewBox="0 0 240 290" className="h-full w-full" role="img" aria-label={`Превью свечи «${title}»`}>
      <defs>
        <linearGradient id={`g-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor={jar.glassDark} />
          <stop offset="0.4" stopColor={jar.glass} />
          <stop offset="0.65" stopColor={jar.glass} />
          <stop offset="1" stopColor={jar.glassDark} />
        </linearGradient>
        <radialGradient id={`h-${id}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.7" />
          <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`f-${id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="0.5" stopColor="#ffc85a" />
          <stop offset="1" stopColor="#ff8a2a" />
        </linearGradient>
        <linearGradient id={`lid-${id}`} x1="0" x2="1">
          {config.lid === "metal" ? (
            <>
              <stop offset="0" stopColor="#8a6a2a" />
              <stop offset="0.5" stopColor="#f0d488" />
              <stop offset="1" stopColor="#8a6a2a" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#a8794a" />
              <stop offset="0.5" stopColor="#d8b07c" />
              <stop offset="1" stopColor="#a8794a" />
            </>
          )}
        </linearGradient>
      </defs>

      <circle cx="120" cy={y - 26} r="70" fill={`url(#h-${id})`} />
      <ellipse cx="120" cy={bottom + 10} rx={w / 2 + 16} ry="6" fill="#000" opacity="0.25" />

      {/* крышка-подставка: банка стоит на своей крышке, пламя открыто */}
      {config.lid !== "none" && (
        <g>
          <rect x={x - 8} y={bottom - 4} width={w + 16} height="12" rx="5" fill={`url(#lid-${id})`} />
          <rect x={x - 8} y={bottom + 4} width={w + 16} height="4" rx="2" fill="#000" opacity="0.15" />
        </g>
      )}

      {/* воск внутри: виден сквозь прозрачное стекло */}
      <rect x={x + 4} y={y + 10} width={w - 8} height={h - 16} rx="14" fill={wax.color} />
      <rect x={x} y={y} width={w} height={h} rx="18" fill={`url(#g-${id})`} opacity={jar.opacity} />
      <rect x={x + 10} y={y + 12} width="8" height={h - 26} rx="4" fill="#fff" opacity={dark ? 0.08 : 0.22} />
      <ellipse cx="120" cy={y + 4} rx={w / 2 - 6} ry="7" fill={wax.color} />
      <ellipse cx="120" cy={y + 4} rx={w / 2 - 6} ry="7" fill="none" stroke="#000" strokeOpacity="0.15" />

      {/* этикетка */}
      <g>
        <rect x={120 - labelW / 2} y={labelY} width={labelW} height={labelH} rx="4" fill={dark ? "#1c1917" : "#fbf5ea"} stroke={dark ? "#c8a25a" : "none"} strokeWidth="0.8" />
        <text x="120" y={labelY + 13} textAnchor="middle" fontFamily="Georgia, serif" fontSize="7" letterSpacing="2.2" fill={dark ? "#d9b56a" : "#2a1c12"}>
          AMBRE&apos;
        </text>
        <text x="120" y={labelY + 29} textAnchor="middle" fontFamily="Georgia, serif" fontSize={titleSize} fill={dark ? "#f3e9da" : "#2a1c12"}>
          {title}
        </text>
        {textLines.map((line, i) => (
          <text key={i} x="120" y={labelY + 41 + i * 8} textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="5.6" fill={dark ? "#bfb2a2" : "#6f5b4a"}>
            {line}
          </text>
        ))}
        <g>
          {notes.map((n, i) => (
            <circle key={n.id} cx={120 + (i - (notes.length - 1) / 2) * 9} cy={labelY + labelH - 7} r="3" fill={n.color} stroke="#000" strokeOpacity="0.15" />
          ))}
        </g>
      </g>

      {/* фитили и пламя */}
      {wicks.map((cx) => (
        <g key={cx}>
          {wood ? (
            <rect x={cx - 5} y={y - 9} width="10" height="12" rx="1" fill="#6b4a2a" />
          ) : (
            <path d={`M${cx} ${y + 3} L${cx} ${y - 10}`} stroke="#2a1c12" strokeWidth="2.2" strokeLinecap="round" />
          )}
          <path
            className="flame"
            d={
              wood
                ? `M${cx} ${y - 44} C${cx + 12} ${y - 30} ${cx + 15} ${y - 20} ${cx + 11} ${y - 12} C${cx + 6} ${y - 6} ${cx - 6} ${y - 6} ${cx - 11} ${y - 12} C${cx - 15} ${y - 20} ${cx - 12} ${y - 30} ${cx} ${y - 44} Z`
                : `M${cx} ${y - 46} C${cx + 8} ${y - 32} ${cx + 12} ${y - 22} ${cx + 9} ${y - 15} C${cx + 6} ${y - 8} ${cx - 6} ${y - 8} ${cx - 9} ${y - 15} C${cx - 12} ${y - 22} ${cx - 8} ${y - 32} ${cx} ${y - 46} Z`
            }
            fill={`url(#f-${id})`}
          />
        </g>
      ))}

    </svg>
  );
}
