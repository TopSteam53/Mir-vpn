import { useId } from "react";

export type CandleRenderProps = {
  glass?: "amber" | "black" | "clear" | "frost";
  /** Цвет воска, hex */
  wax?: string;
  /** Цвет истории для полосы на этикетке */
  accent: string;
  name?: string;
  code?: string;
  caption?: string;
  lit?: boolean;
  wick?: "cotton" | "wood";
  wicks?: 1 | 2;
  lid?: "none" | "bamboo" | "metal";
  className?: string;
  title?: string;
};

type Glass = NonNullable<CandleRenderProps["glass"]>;

/** Тона стекла. alpha — плотность передней стенки: чем меньше, тем лучше виден воск. */
export const GLASS_TONES: Record<Glass, { edge: string; body: string; light: string; base: string; rim: string; alpha: number }> = {
  amber: { edge: "#3a1c05", body: "#a65d17", light: "#eab062", base: "#5c2f08", rim: "#ffd99a", alpha: 0.72 },
  black: { edge: "#000000", body: "#191513", light: "#3b342e", base: "#050404", rim: "#9a8672", alpha: 1 },
  clear: { edge: "#5f7c75", body: "#dce8e4", light: "#ffffff", base: "#9fbdb5", rim: "#ffffff", alpha: 0.14 },
  frost: { edge: "#b3a897", body: "#ebe5da", light: "#fdfaf5", base: "#d3c9b9", rim: "#ffffff", alpha: 0.82 },
};

export const SERIF = "var(--font-playfair, 'Playfair Display'), Georgia, 'Times New Roman', serif";
export const SANS = "var(--font-manrope, Manrope), system-ui, sans-serif";

function rgb(hex: string): [number, number, number] {
  let h = hex.trim().replace("#", "");
  if (h.length === 3) h = h.replace(/./g, (c) => c + c);
  const n = parseInt(h.slice(0, 6), 16);
  return /^[0-9a-f]{6}/i.test(h) && !Number.isNaN(n) ? [(n >> 16) & 255, (n >> 8) & 255, n & 255] : [244, 230, 204];
}

/** Смешивает два hex-цвета: t = 0 → a, t = 1 → b. */
export function mix(a: string, b: string, t: number) {
  const x = rgb(a);
  const y = rgb(b);
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

function isLight(hex: string) {
  const [r, g, b] = rgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 150;
}

type Stop = [offset: number, color: string, opacity?: number];

/** Компактная запись стопов градиента. */
export function Stops({ list }: { list: Stop[] }) {
  return list.map(([offset, color, opacity], i) => <stop key={i} offset={offset} stopColor={color} stopOpacity={opacity} />);
}

/** Градиенты бумаги этикетки: CandleLabel ссылается на них по id. */
export function LabelDefs({ id, dark }: { id: string; dark?: boolean }) {
  return (
    <>
      <linearGradient id={`${id}-paper`} x1="0" y1="0" x2="0" y2="1">
        <Stops list={[[0, "#fffaf0", dark ? 0.04 : 0.4], [1, "#7a5a32", dark ? 0.1 : 0.06]]} />
      </linearGradient>
      <linearGradient id={`${id}-curl`} x1="0" x2="1">
        <Stops list={[[0, "#4a2e14", 0.3], [0.12, "#4a2e14", 0.06], [0.32, "#fffaf0", dark ? 0.07 : 0.3], [0.52, "#fffaf0", 0], [0.86, "#4a2e14", 0.08], [1, "#4a2e14", 0.36]]} />
      </linearGradient>
    </>
  );
}

/** Высота точки на передней дуге эллипса относительно центра. */
const arcY = (dx: number, rx: number, ry: number) => ry * Math.sqrt(Math.max(0, 1 - (dx / rx) ** 2));

/** sag — прогиб краёв этикетки по цилиндру банки */
type LabelProps = Pick<CandleRenderProps, "accent" | "name" | "code" | "caption"> & { id: string; cx: number; y: number; w: number; h: number; sag: number; dark?: boolean };

/** Бумажная этикетка, изогнутая по банке. Используется и в сборке. */
export function CandleLabel({ id, cx, y, w, h, sag, accent, name, code, caption, dark }: LabelProps) {
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const curve = (top: number, bottom: number, s: number, i = 0) =>
    `M${x0 + i} ${top} Q${cx} ${top + 2 * s} ${x1 - i} ${top} V${bottom} Q${cx} ${bottom + 2 * s} ${x0 + i} ${bottom} Z`;
  const title = (name?.trim() || "AMBRE'").toUpperCase();
  const avail = w - 18;
  const len = Math.max(title.length, 1);
  const size = Math.max(5.5, Math.min(w * 0.15, avail / (len * 0.8)));
  const ls = size * 0.12;
  const tooLong = len * 0.8 * size > avail;
  const cap = caption?.trim();
  const capSize = cap ? Math.min(w * 0.06, (avail + 4) / (cap.length * 0.5)) : 0;
  const paper = dark ? "#16110c" : "#f7eddb";
  const ink = dark ? "#e4c47e" : "#2a1c12";
  const soft = dark ? "#b8975a" : "#7a6450";
  const s = sag;
  const bandTop = y + h - h * 0.22;
  const bandBottom = y + h - h * 0.07;
  // название и подпись центрируются между маркой и цветной полосой
  const regionTop = y + h * 0.27 + s;
  const regionBottom = bandTop + s - 3;
  const block = size * 0.72 + (cap ? capSize * 1.7 : 0);
  const nameY = (regionTop + regionBottom - block) / 2 + size * 0.72;
  return (
    <g>
      <path d={curve(y, y + h, s)} fill={paper} />
      <path d={curve(y, y + h, s)} fill={`url(#${id}-paper)`} />
      <path d={curve(y + 3, y + h - 3, s, 3)} fill="none" stroke={dark ? "#c8a25a" : "#2a1c12"} strokeOpacity={dark ? 0.55 : 0.16} strokeWidth="0.5" />
      {name?.trim() && (
        <text x={cx + 1.2} y={y + h * 0.2 + s} textAnchor="middle" fontSize={w * 0.058} letterSpacing={w * 0.024} fill={soft} style={{ fontFamily: SERIF }}>
          AMBRE&apos;
        </text>
      )}
      <text x={cx + ls / 2} y={nameY} textAnchor="middle" fontSize={size} fontWeight={500} letterSpacing={ls} fill={ink} style={{ fontFamily: SERIF }}
        textLength={tooLong ? avail : undefined} lengthAdjust={tooLong ? "spacingAndGlyphs" : undefined}>
        {title}
      </text>
      {cap && (
        <text x={cx} y={nameY + capSize * 1.7} textAnchor="middle" fontSize={capSize} fontStyle="italic" fill={soft} style={{ fontFamily: SERIF }}>
          {cap}
        </text>
      )}
      <path d={curve(bandTop, bandBottom, s * 1.05)} fill={accent} opacity={dark ? 0.9 : 1} />
      {code && (
        <text x={cx + 0.6} y={(bandTop + bandBottom) / 2 + s * 1.05 + (bandBottom - bandTop) * 0.27} textAnchor="middle" fontSize={(bandBottom - bandTop) * 0.72}
          fontWeight={600} letterSpacing="1.2" fill={isLight(accent) ? "#2a1c12" : "#fbf5ea"} style={{ fontFamily: SANS }}>
          {code}
        </text>
      )}
      <path d={curve(y, y + h, s)} fill={`url(#${id}-curl)`} />
    </g>
  );
}

/** Многослойное пламя: синее основание, оранжевая оболочка, белое ядро. */
function Flame({ id, x, y, wood }: { id: string; x: number; y: number; wood: boolean }) {
  const h = wood ? 34 : 40;
  const hw = wood ? 10 : 7.4;
  const shape = (fh: number, fw: number, base: number) =>
    `M${x} ${base - fh} C${x + fw * 0.5} ${base - fh * 0.72} ${x + fw * 1.06} ${base - fh * 0.44} ${x + fw} ${base - fh * 0.2} ` +
    `C${x + fw * 0.94} ${base - 1} ${x + fw * 0.46} ${base + 3} ${x} ${base + 3} ` +
    `C${x - fw * 0.46} ${base + 3} ${x - fw * 0.94} ${base - 1} ${x - fw} ${base - fh * 0.2} ` +
    `C${x - fw * 1.06} ${base - fh * 0.44} ${x - fw * 0.5} ${base - fh * 0.72} ${x} ${base - fh} Z`;
  return (
    <g className="flame">
      <ellipse cx={x} cy={y - h * 0.42} rx={hw * 2.6} ry={h * 0.85} fill={`url(#${id}-fh)`} />
      <path d={shape(h, hw, y)} fill={`url(#${id}-fo)`} filter={`url(#${id}-soft)`} />
      <path d={shape(h * 0.78, hw * 0.74, y - 1)} fill={`url(#${id}-fm)`} filter={`url(#${id}-soft)`} />
      <ellipse cx={x} cy={y - 1} rx={hw * 0.66} ry="4" fill={`url(#${id}-fb)`} />
      <path d={shape(h * 0.5, hw * 0.36, y - 4)} fill={`url(#${id}-fc)`} />
    </g>
  );
}

// Геометрия банки во viewBox 240×300
const CX = 120;
const RX = 64;
const RY = 12;
const TOP = 124;
const BOT = 262;
const WALL = 4;
const BASE = 15;
const WAX_Y = TOP + 14;
const L = CX - RX;
const R = CX + RX;
const BY = arcY(RX - 8, RX, RY);
const LIP = arcY(RX - 6, RX, RY);
const IRX = RX - WALL;
const IRY = RY * (IRX / RX);

const bottomContour = `V${BOT - 6} Q${R} ${BOT + 3.5} ${R - 8} ${BOT + BY} A${RX} ${RY} 0 0 1 ${L + 8} ${BOT + BY} Q${L} ${BOT + 3.5} ${L} ${BOT - 6} Z`;
const FRONT = `M${L} ${TOP} A${RX} ${RY} 0 0 0 ${R} ${TOP} ${bottomContour}`;
const BASE_BAND = `M${L} ${BOT - BASE} H${L + WALL} A${IRX} ${IRY} 0 0 0 ${R - WALL} ${BOT - BASE} H${R} ${bottomContour}`;
const WAX_COLUMN = `M${L + WALL} ${WAX_Y} V${BOT - BASE} A${IRX} ${IRY} 0 0 0 ${R - WALL} ${BOT - BASE} V${WAX_Y} Z`;
const INTERIOR = `M${L + WALL} ${TOP} A${IRX} ${IRY} 0 0 1 ${R - WALL} ${TOP} V${WAX_Y} H${L + WALL} Z`;
const RIM = `M${L} ${TOP} A${RX} ${RY} 0 1 0 ${R} ${TOP} A${RX} ${RY} 0 1 0 ${L} ${TOP} Z M${L + WALL} ${TOP} A${IRX} ${IRY} 0 1 1 ${R - WALL} ${TOP} A${IRX} ${IRY} 0 1 1 ${L + WALL} ${TOP} Z`;

/** Реалистичная свеча в стеклянной банке: стекло, воск, этикетка, живое пламя. */
export function CandleRender(props: CandleRenderProps) {
  const { glass = "amber", wax = "#f4e6cc", accent, name, code, caption, lit = true, wick = "cotton", wicks = 1, lid = "none", className, title } = props;
  const id = "cr" + useId().replace(/:/g, "");
  const g = GLASS_TONES[glass];
  const dark = glass === "black";
  const wood = wick === "wood";
  const xs = wicks === 2 ? [CX - 24, CX + 24] : [CX];
  const top = mix(wax, "#ffffff", 0.22);
  const poolRx = IRX * (wicks === 2 ? 0.86 : 0.6);
  const flameY = WAX_Y - (wood ? 6.5 : 6);
  const ground = lid === "none" ? BOT + RY : BOT + 25;
  const warm = { amber: 0.38, black: 0, clear: 0.28, frost: 0.6 }[glass];
  const op = (v: number) => Math.min(1, v);
  const lidSide = lid === "metal" ? ["#5e4317", "#f6dd98", "#a77d2f", "#e5c271", "#5a3f14"] : ["#6e4824", "#c99660", "#a2703c", "#bf8b55", "#5f3d1e"];

  return (
    <svg viewBox="0 0 240 300" className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <linearGradient id={`${id}-front`} x1="0" x2="1">
          <Stops
            list={
              dark
                ? [[0, "#000"], [0.16, "#2b2520"], [0.5, "#120f0d"], [0.86, "#221d19"], [1, "#000"]]
                : [
                    [0, g.edge, op(g.alpha + 0.4)],
                    [0.06, g.body, g.alpha],
                    [0.2, g.light, g.alpha * 0.75],
                    [0.42, g.body, g.alpha],
                    [0.8, g.body, g.alpha],
                    [0.94, mix(g.body, g.edge, 0.5), op(g.alpha + 0.15)],
                    [1, g.edge, op(g.alpha + 0.45)],
                  ]
            }
          />
        </linearGradient>
        <linearGradient id={`${id}-depth`} x1="0" y1="0" x2="0" y2="1">
          <Stops list={[[0, "#000", 0], [0.65, "#000", 0], [1, "#000", dark ? 0.3 : 0.16]]} />
        </linearGradient>
        <linearGradient id={`${id}-streak`} x1="0" y1="0" x2="0" y2="1">
          <Stops list={[[0, "#fff", 0], [0.12, "#fff", 0.85], [0.7, "#fff", 0.45], [1, "#fff", 0]]} />
        </linearGradient>
        <linearGradient id={`${id}-wax`} x1="0" x2="1">
          <Stops list={[[0, "#000", 0.26], [0.28, "#000", 0], [0.45, "#fff", 0.14], [0.65, "#000", 0], [1, "#000", 0.3]]} />
        </linearGradient>
        <linearGradient id={`${id}-surface`} x1="0" y1="0" x2="0" y2="1">
          <Stops list={[[0, mix(wax, "#000", 0.14)], [1, top]]} />
        </linearGradient>
        <linearGradient id={`${id}-inner`} x1="0" y1="0" x2="0" y2="1">
          <Stops list={dark ? [[0, "#1d1815"], [1, "#050403"]] : [[0, g.light, g.alpha * 0.6], [1, g.edge, op(g.alpha + 0.2)]]} />
        </linearGradient>
        <radialGradient id={`${id}-pool`}>
          <Stops list={[[0, mix(wax, "#ffcf80", 0.5)], [0.6, mix(wax, "#d49a50", 0.3)], [0.92, mix(wax, "#8a5a2a", 0.35)], [1, mix(wax, "#ffffff", 0.3)]]} />
        </radialGradient>
        <radialGradient id={`${id}-warm`} cx={CX} cy={WAX_Y} r="96" gradientUnits="userSpaceOnUse">
          <Stops list={[[0, "#ffc56a", warm], [0.55, "#ffb04a", warm * 0.35], [1, "#ffb04a", 0]]} />
        </radialGradient>
        <radialGradient id={`${id}-glow`} cx={CX} cy={flameY - 16} r="118" gradientUnits="userSpaceOnUse">
          <Stops list={[[0, "#ffd383", 0.62], [0.22, "#ffc35c", 0.3], [0.55, "#ffb04a", 0.09], [1, "#ffb04a", 0]]} />
        </radialGradient>
        <radialGradient id={`${id}-shadow`}>
          <Stops list={[[0, "#1a0f06", 0.42], [0.6, "#1a0f06", 0.16], [1, "#1a0f06", 0]]} />
        </radialGradient>
        <LabelDefs id={id} dark={dark} />
        <linearGradient id={`${id}-lid`} x1="0" x2="1">
          <Stops list={lidSide.map((c, i) => [i / (lidSide.length - 1), c])} />
        </linearGradient>
        <radialGradient id={`${id}-lidtop`} cx="0.4" cy="0.35" r="0.8">
          <Stops list={lid === "metal" ? [[0, "#fbe7ad"], [1, "#b48a3a"]] : [[0, "#e2bb84"], [1, "#b98552"]]} />
        </radialGradient>
        <filter id={`${id}-soft`} x="-50%" y="-20%" width="200%" height="140%">
          <feGaussianBlur stdDeviation="0.7" />
        </filter>
        <radialGradient id={`${id}-fh`}>
          <Stops list={[[0, "#ffe3a0", 0.55], [0.5, "#ffbf5a", 0.18], [1, "#ffbf5a", 0]]} />
        </radialGradient>
        <linearGradient id={`${id}-fo`} x1="0" y1="1" x2="0" y2="0">
          <Stops list={[[0, "#ff9b3d", 0.1], [0.14, "#ffb648", 0.8], [0.45, "#ffcf62"], [0.8, "#ff9a2e", 0.95], [1, "#ff6d18", 0.55]]} />
        </linearGradient>
        <radialGradient id={`${id}-fm`} cx="0.5" cy="0.62" r="0.6">
          <Stops list={[[0, "#fff6d6"], [0.6, "#ffe08a", 0.85], [1, "#ffc24f", 0]]} />
        </radialGradient>
        <linearGradient id={`${id}-fc`} x1="0" y1="1" x2="0" y2="0">
          <Stops list={[[0, "#fff", 0.2], [0.3, "#fff"], [1, "#fff8de", 0.9]]} />
        </linearGradient>
        <radialGradient id={`${id}-fb`} cx="0.5" cy="0.75" r="0.6">
          <Stops list={[[0, "#3f6dff", 0.75], [0.6, "#6c8cff", 0.4], [1, "#6c8cff", 0]]} />
        </radialGradient>
      </defs>

      {lit && <circle cx={CX} cy={flameY - 16} r="118" fill={`url(#${id}-glow)`} />}

      {/* тень и тёплый отсвет на поверхности */}
      <ellipse cx={CX} cy={ground} rx={RX + 30} ry="11" fill={`url(#${id}-shadow)`} />
      {lit && <ellipse cx={CX} cy={ground + 2} rx={RX + 44} ry="9" fill="#ffb04a" opacity="0.1" />}

      {/* крышка-подставка: банка стоит на своей крышке */}
      {lid !== "none" && (
        <g>
          <path d={`M${CX - 76} ${BOT + 3} A76 14 0 0 0 ${CX + 76} ${BOT + 3} V${BOT + 11} A76 14 0 0 1 ${CX - 76} ${BOT + 11} Z`} fill={`url(#${id}-lid)`} />
          <ellipse cx={CX} cy={BOT + 3} rx="76" ry="14" fill={`url(#${id}-lidtop)`} />
          {[66, 52, 38].map((r) => (
            <ellipse key={r} cx={CX} cy={BOT + 3} rx={r} ry={(r * 14) / 76} fill="none" stroke={lid === "metal" ? "#fff" : "#7a4f26"} strokeOpacity={lid === "metal" ? 0.3 : 0.22} strokeWidth="0.6" />
          ))}
          <ellipse cx={CX} cy={BOT + 6} rx={RX + 2} ry="9" fill="#000" opacity="0.28" />
        </g>
      )}

      {/* внутренняя задняя стенка над воском */}
      <path d={INTERIOR} fill={`url(#${id}-inner)`} />
      {lit && <path d={INTERIOR} fill={`url(#${id}-warm)`} />}

      {/* воск сквозь стекло */}
      {!dark && (
        <g>
          <path d={WAX_COLUMN} fill={wax} />
          <path d={WAX_COLUMN} fill={`url(#${id}-wax)`} />
          {lit && <path d={WAX_COLUMN} fill={`url(#${id}-warm)`} />}
        </g>
      )}

      {/* поверхность воска и лужица расплава */}
      <ellipse cx={CX} cy={WAX_Y} rx={IRX} ry={IRY} fill={`url(#${id}-surface)`} />
      <ellipse cx={CX} cy={WAX_Y - 0.6} rx={IRX - 1} ry={IRY - 1} fill="none" stroke="#000" strokeOpacity="0.12" strokeWidth="1" />
      {lit ? (
        <g>
          <ellipse cx={CX} cy={WAX_Y + 0.5} rx={poolRx} ry={(poolRx * RY) / RX} fill={`url(#${id}-pool)`} />
          <path d={`M${CX - poolRx * 0.7} ${WAX_Y - 1.2} Q${CX} ${WAX_Y - (poolRx * RY) / RX - 0.6} ${CX + poolRx * 0.7} ${WAX_Y - 1.2}`}
            fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.8" strokeLinecap="round" />
          {xs.map((x) => (
            <ellipse key={x} cx={x} cy={WAX_Y + 2.6} rx="3" ry="0.9" fill="#fff1c4" opacity="0.7" />
          ))}
        </g>
      ) : (
        <ellipse cx={CX} cy={WAX_Y + 0.8} rx={IRX * 0.5} ry={IRY * 0.45} fill={mix(wax, "#000", 0.1)} opacity="0.35" />
      )}

      {/* фитили */}
      {xs.map((x) =>
        wood ? (
          <g key={x}>
            <path d={`M${x - 4.5} ${WAX_Y + 1} V${WAX_Y - 7} H${x + 4.5} V${WAX_Y + 1} Z`} fill="#a87a4a" />
            <path d={`M${x - 4.5} ${WAX_Y - 3} H${x + 4.5} M${x - 4.5} ${WAX_Y - 0.5} H${x + 4.5}`} stroke="#7a5432" strokeWidth="0.4" />
            <path d={`M${x - 4.5} ${WAX_Y - 7} H${x + 4.5} V${WAX_Y - 5} H${x - 4.5} Z`} fill={lit ? "#3a1608" : "#24170e"} />
            {lit && <path d={`M${x - 3.6} ${WAX_Y - 7.2} H${x + 3.6}`} stroke="#ff7a2a" strokeWidth="0.8" strokeLinecap="round" />}
          </g>
        ) : (
          <g key={x}>
            <path d={lit ? `M${x} ${WAX_Y + 1} C${x} ${WAX_Y - 4} ${x - 0.6} ${WAX_Y - 8} ${x + 1.2} ${WAX_Y - 11}` : `M${x} ${WAX_Y + 1} V${WAX_Y - 8} Q${x + 0.4} ${WAX_Y - 11.5} ${x + 3} ${WAX_Y - 11}`}
              fill="none" stroke="#24170e" strokeWidth="1.8" strokeLinecap="round" />
            {lit && <circle cx={x + 1.2} cy={WAX_Y - 11} r="1.3" fill="#ff7a2a" />}
          </g>
        ),
      )}

      {/* передняя стенка: тонировка, преломление, толстое дно */}
      <path d={FRONT} fill={`url(#${id}-front)`} />
      <path d={FRONT} fill={`url(#${id}-depth)`} />
      <path d={BASE_BAND} fill={g.base} opacity={dark ? 0.9 : Math.max(0.35, g.alpha * 0.7)} />
      <path d={`M${L + WALL + 2} ${BOT - BASE + 1} A${IRX} ${IRY} 0 0 0 ${R - WALL - 2} ${BOT - BASE + 1}`} fill="none" stroke={g.rim} strokeOpacity={dark ? 0.25 : 0.7} strokeWidth="1.1" />
      <path d={`M${L + 10} ${BOT + BY + 1.5} A${RX - 8} ${RY - 2} 0 0 0 ${R - 10} ${BOT + BY + 1.5}`} fill="none" stroke={g.light} strokeOpacity={dark ? 0.2 : 0.55} strokeWidth="0.9" />
      {lit && <path d={FRONT} fill={`url(#${id}-warm)`} />}
      {!dark && (
        <g fill="none" strokeOpacity={0.4}>
          <path d={`M${L + WALL} ${TOP + 10} V${BOT - BASE}`} stroke={g.light} strokeWidth="0.8" />
          <path d={`M${R - WALL} ${TOP + 10} V${BOT - BASE}`} stroke={g.light} strokeWidth="0.6" />
          <path d={`M${L + 0.8} ${TOP + 4} V${BOT - 6}`} stroke={g.edge} strokeWidth="1.2" />
          <path d={`M${R - 0.8} ${TOP + 4} V${BOT - 6}`} stroke={g.edge} strokeWidth="1.2" />
        </g>
      )}
      <rect x={L + 11} y={TOP + 14} width="7" height={BOT - TOP - 26} rx="3.5" fill={`url(#${id}-streak)`} opacity={dark ? 0.22 : 0.6} />
      <rect x={L + 21} y={TOP + 22} width="1.8" height={BOT - TOP - 44} rx="0.9" fill={`url(#${id}-streak)`} opacity={dark ? 0.12 : 0.45} />
      <rect x={R - 22} y={TOP + 18} width="9" height={BOT - TOP - 34} rx="4.5" fill={`url(#${id}-streak)`} opacity={dark ? 0.1 : 0.2} />
      {dark && <path d={FRONT} fill="none" stroke="#6d5f53" strokeOpacity="0.55" strokeWidth="0.8" />}

      {/* кромка стекла */}
      <path d={RIM} fillRule="evenodd" fill={dark ? "#2c2622" : g.light} fillOpacity={dark ? 1 : 0.55} />
      <ellipse cx={CX} cy={TOP} rx={RX} ry={RY} fill="none" stroke={g.rim} strokeOpacity={dark ? 0.4 : 0.6} strokeWidth="0.8" />
      <ellipse cx={CX} cy={TOP} rx={IRX} ry={IRY} fill="none" stroke={g.edge} strokeOpacity="0.35" strokeWidth="0.6" />
      <path d={`M${L + 6} ${TOP + LIP} A${RX} ${RY} 0 0 0 ${R - 6} ${TOP + LIP}`} fill="none" stroke={lit ? "#ffe2a6" : g.rim}
        strokeOpacity={dark ? 0.55 : 0.85} strokeWidth="1.1" strokeLinecap="round" />

      <CandleLabel id={id} cx={CX} y={170} w={104} h={74} sag={4} accent={accent} name={name} code={code} caption={caption} dark={dark} />

      {lit && xs.map((x) => <Flame key={x} id={id} x={x + (wood ? 0 : 0.6)} y={flameY} wood={wood} />)}
    </svg>
  );
}
