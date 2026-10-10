import { useId, type ReactNode } from "react";
import { CandleLabel, GLASS_TONES, LabelDefs, SANS, Stops, mix, type CandleRenderProps } from "@/components/CandleRender";

type Notes = { top: string; heart: string; base: string };

type Part = {
  key: string;
  /** Высота детали во viewBox */
  h: number;
  /** Правый край детали — отсюда идёт выноска */
  edge: number;
  title: string;
  lines: string[];
  draw: (y: number) => ReactNode;
};

const W = 400;
const CX = 120;
const GAP = 30;
const TEXT_X = 236;

/** Переносит подпись по словам, чтобы она не вылезала за viewBox. */
function wrap(lines: string[], max = 27) {
  return lines.flatMap((line) => {
    const out = [""];
    for (const word of line.split(" ")) {
      const last = out[out.length - 1];
      if (!last || (last + " " + word).length <= max) out[out.length - 1] = last ? last + " " + word : word;
      else out.push(word);
    }
    return out;
  });
}

/** Разобранная свеча: крышка, фитиль, воск, банка, этикетка, дно — с подписями. */
export function CandleAssembly({
  glass = "amber",
  wax = "#f4e6cc",
  accent,
  name,
  code,
  caption,
  wick = "cotton",
  wicks = 1,
  lid = "none",
  notes,
  className,
  title,
}: CandleRenderProps & { notes?: Notes }) {
  const id = "ca" + useId().replace(/:/g, "");
  const g = GLASS_TONES[glass];
  const dark = glass === "black";
  const wood = wick === "wood";
  const xs = wicks === 2 ? [CX - 22, CX + 22] : [CX];
  const metal = lid === "metal";

  // цилиндр: верхний эллипс + боковина
  const cylinder = (y: number, rx: number, ry: number, hgt: number) =>
    `M${CX - rx} ${y} A${rx} ${ry} 0 0 0 ${CX + rx} ${y} V${y + hgt} A${rx} ${ry} 0 0 1 ${CX - rx} ${y + hgt} Z`;

  const parts: Part[] = [];

  if (lid !== "none") {
    parts.push({
      key: "lid",
      h: 34,
      edge: CX + 72,
      title: "Крышка",
      lines: [metal ? "металл, золото" : "бамбук", "и подставка под банку"],
      draw: (y) => (
        <g>
          <path d={cylinder(y + 11, 72, 11, 12)} fill={`url(#${id}-lid)`} />
          <ellipse cx={CX} cy={y + 11} rx="72" ry="11" fill={metal ? "#f1d48c" : "#d8ad75"} />
          {[60, 46, 32].map((r) => (
            <ellipse key={r} cx={CX} cy={y + 11} rx={r} ry={(r * 11) / 72} fill="none" stroke={metal ? "#fff" : "#8a5a2c"} strokeOpacity={metal ? 0.35 : 0.25} strokeWidth="0.6" />
          ))}
        </g>
      ),
    });
  }

  parts.push({
    key: "wick",
    h: 50,
    edge: xs[xs.length - 1] + (wood ? 9 : 8),
    title: wood ? "Деревянный фитиль" : "Хлопковый фитиль",
    lines: [wood ? "потрескивает, как камин" : "ровное тихое пламя"],
    draw: (y) => (
      <g>
        {xs.map((x) =>
          wood ? (
            <g key={x}>
              <rect x={x - 6} y={y} width="12" height="42" rx="1" fill="#b8895a" />
              <path d={`M${x - 3} ${y + 2} V${y + 40} M${x + 2} ${y + 3} V${y + 39}`} stroke="#8a5f36" strokeWidth="0.5" />
              <path d={`M${x - 6} ${y + 40} H${x + 6} L${x + 9} ${y + 50} H${x - 9} Z`} fill="#9a9590" />
            </g>
          ) : (
            <g key={x}>
              <path d={`M${x} ${y + 2} C${x - 1.5} ${y + 14} ${x + 1.5} ${y + 28} ${x} ${y + 42}`} fill="none" stroke="#f1e8d8" strokeWidth="2.6" strokeLinecap="round" />
              <path d={`M${x} ${y + 2} C${x - 1.5} ${y + 14} ${x + 1.5} ${y + 28} ${x} ${y + 42}`} fill="none" stroke="#a8977e" strokeWidth="2.6" strokeDasharray="1 1.6" strokeLinecap="round" />
              <path d={`M${x - 3} ${y + 40} H${x + 3} L${x + 8} ${y + 50} H${x - 8} Z`} fill="#9a9590" />
            </g>
          ),
        )}
      </g>
    ),
  });

  parts.push({
    key: "wax",
    h: 46,
    edge: CX + 62,
    title: "Растительный воск",
    lines: notes ? [`верх — ${notes.top}`, `сердце — ${notes.heart}`, `база — ${notes.base}`] : ["без парафина"],
    draw: (y) => (
      <g>
        <path d={cylinder(y + 10, 62, 10, 26)} fill={wax} />
        <path d={cylinder(y + 10, 62, 10, 26)} fill={`url(#${id}-shade)`} />
        <ellipse cx={CX} cy={y + 10} rx="62" ry="10" fill={mix(wax, "#ffffff", 0.25)} />
        <ellipse cx={CX} cy={y + 10} rx="62" ry="10" fill="none" stroke="#000" strokeOpacity="0.1" strokeWidth="0.6" />
      </g>
    ),
  });

  parts.push({
    key: "jar",
    h: 118,
    edge: CX + 66,
    title: "Стеклянная банка",
    lines: ["многоразовая"],
    draw: (y) => {
      const top = y + 12;
      const bot = y + 104;
      return (
        <g>
          <ellipse cx={CX} cy={top} rx="62" ry="11.5" fill={dark ? "#0b0908" : g.edge} opacity={dark ? 1 : Math.min(1, g.alpha + 0.15)} />
          <path
            d={`M${CX - 66} ${top} A66 12 0 0 0 ${CX + 66} ${top} V${bot - 6} Q${CX + 66} ${bot + 4} ${CX + 58} ${bot + 6} A66 12 0 0 1 ${CX - 58} ${bot + 6} Q${CX - 66} ${bot + 4} ${CX - 66} ${bot - 6} Z`}
            fill={`url(#${id}-glass)`}
          />
          <rect x={CX - 54} y={top + 12} width="6" height={bot - top - 22} rx="3" fill="#fff" opacity={dark ? 0.12 : 0.45} />
          <rect x={CX + 38} y={top + 16} width="8" height={bot - top - 30} rx="4" fill="#fff" opacity={dark ? 0.06 : 0.16} />
          <path d={`M${CX - 62} ${bot - 8} A62 11 0 0 0 ${CX + 62} ${bot - 8}`} fill="none" stroke={g.rim} strokeOpacity={dark ? 0.25 : 0.6} />
          <ellipse cx={CX} cy={top} rx="66" ry="12" fill="none" stroke={g.rim} strokeOpacity={dark ? 0.5 : 0.75} strokeWidth="1.4" />
          <ellipse cx={CX} cy={top} rx="62" ry="11.5" fill="none" stroke={g.edge} strokeOpacity="0.35" strokeWidth="0.6" />
        </g>
      );
    },
  });

  parts.push({
    key: "label",
    h: 72,
    edge: CX + 52,
    title: "Этикетка",
    lines: [[name && `«${name}»`, code].filter(Boolean).join(" · ") || "плотная бумага"],
    draw: (y) => <CandleLabel id={id} cx={CX} y={y} w={104} h={68} sag={4} accent={accent} name={name} code={code} caption={caption} dark={dark} />,
  });

  parts.push({
    key: "base",
    h: 40,
    edge: CX + 66,
    title: "Дно",
    lines: ["«Retour — верни меня»"],
    draw: (y) => {
      const cy = y + 20;
      const mark = dark ? "#d9b56a" : glass === "amber" ? "#fff2d6" : "#6f5b4a";
      return (
        <g>
          <ellipse cx={CX} cy={cy + 4} rx="66" ry="17" fill={dark ? "#050404" : g.base} opacity={dark ? 1 : 0.85} />
          <ellipse cx={CX} cy={cy} rx="66" ry="17" fill={`url(#${id}-glass)`} />
          <ellipse cx={CX} cy={cy} rx="48" ry="12" fill="none" stroke={g.rim} strokeOpacity={dark ? 0.35 : 0.6} strokeWidth="0.8" />
          <g transform={`translate(${CX} ${cy}) scale(1 0.26)`} fill="none" stroke={mark} strokeOpacity="0.9" strokeWidth="2.6">
            <path d="M-26 -10 A28 28 0 0 1 20 -18" />
            <path d="M26 10 A28 28 0 0 1 -20 18" />
            <path d="M20 -18 l-1 -9 M20 -18 l-9 2 M-20 18 l1 9 M-20 18 l9 -2" strokeLinecap="round" />
          </g>
          <text x={CX + 1} y={cy + 2.6} textAnchor="middle" fontSize="7.5" fontWeight={600} letterSpacing="2" fill={mark} style={{ fontFamily: SANS }}>
            RETOUR
          </text>
        </g>
      );
    },
  });

  let cursor = 22;
  const placed = parts.map((p) => {
    const lines = wrap(p.lines);
    const h = Math.max(p.h, lines.length * 13 + 18);
    const y = cursor + (h - p.h) / 2;
    cursor += h + GAP;
    return { ...p, lines, y };
  });
  const height = cursor - GAP + 22;
  const label = title ?? `Из чего сделана свеча${name ? ` «${name}»` : ""}`;

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className={className} role="img" aria-label={label}>
      <defs>
        <linearGradient id={`${id}-glass`} x1="0" x2="1">
          <Stops
            list={
              dark
                ? [[0, "#000"], [0.18, "#2b2520"], [0.55, "#120f0d"], [1, "#000"]]
                : [[0, g.edge, Math.min(1, g.alpha + 0.45)], [0.08, g.body, Math.max(0.22, g.alpha)], [0.22, g.light, Math.max(0.18, g.alpha * 0.7)], [0.75, g.body, Math.max(0.22, g.alpha)], [1, g.edge, Math.min(1, g.alpha + 0.5)]]
            }
          />
        </linearGradient>
        <linearGradient id={`${id}-shade`} x1="0" x2="1">
          <Stops list={[[0, "#000", 0.22], [0.35, "#fff", 0.15], [1, "#000", 0.28]]} />
        </linearGradient>
        <linearGradient id={`${id}-lid`} x1="0" x2="1">
          <Stops list={(metal ? ["#5e4317", "#f6dd98", "#a77d2f", "#5a3f14"] : ["#6e4824", "#c99660", "#a2703c", "#5f3d1e"]).map((c, i) => [[0, 0.3, 0.7, 1][i], c])} />
        </linearGradient>
        <LabelDefs id={id} dark={dark} />
      </defs>

      {/* ось сборки */}
      <path d={`M${CX} 10 V${height - 10}`} style={{ stroke: "var(--line, currentColor)" }} strokeOpacity="0.9" strokeDasharray="2 4" />

      {placed.map((p, i) => {
        const mid = p.y + p.h / 2;
        const textTop = mid - (p.lines.length * 13 + 15) / 2 + 12;
        return (
          <g key={p.key}>
            {p.draw(p.y)}
            <path d={`M${p.edge + 4} ${mid} H${TEXT_X - 8}`} style={{ stroke: "var(--muted, currentColor)" }} strokeOpacity="0.55" strokeWidth="0.75" />
            <circle cx={p.edge + 4} cy={mid} r="2" style={{ fill: "var(--amber, currentColor)" }} />
            <text x={TEXT_X} y={textTop} fontSize="14" style={{ fontFamily: SANS }}>
              <tspan fontSize="10" fontWeight={600} letterSpacing="1" style={{ fill: "var(--amber, currentColor)" }}>
                {String(i + 1).padStart(2, "0")}
              </tspan>
              <tspan dx="7" fontWeight={600} style={{ fill: "var(--ink, currentColor)" }}>
                {p.title}
              </tspan>
            </text>
            {p.lines.map((line, j) => (
              <text key={j} x={TEXT_X} y={textTop + 16 + j * 13} fontSize="11" style={{ fontFamily: SANS, fill: "var(--muted, currentColor)" }}>
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
