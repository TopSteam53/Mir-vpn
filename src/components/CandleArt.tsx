import { useId } from "react";

type Props = {
  /** Цвет истории для этикетки и отблеска */
  color: string;
  /** Сквозной номер момента, например 102 */
  code?: number;
  /** Название свечи, печатается на этикетке */
  name?: string;
  lit?: boolean;
  className?: string;
};

/** Иллюстрация свечи в янтарной банке. Временная замена фотографиям. */
export function CandleArt({ color, code, name, lit = true, className }: Props) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 200 260" className={className} role="img" aria-hidden="true">
      <defs>
        <linearGradient id={`glass-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#7a4a17" />
          <stop offset="0.35" stopColor="#c8862e" />
          <stop offset="0.6" stopColor="#e9b65c" />
          <stop offset="1" stopColor="#8a5419" />
        </linearGradient>
        <radialGradient id={`halo-${id}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`flame-${id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="0.5" stopColor="#ffc85a" />
          <stop offset="1" stopColor="#ff8a2a" />
        </linearGradient>
      </defs>

      {lit && <circle cx="100" cy="66" r="62" fill={`url(#halo-${id})`} />}

      {/* банка */}
      <rect x="38" y="96" width="124" height="150" rx="18" fill={`url(#glass-${id})`} />
      <rect x="38" y="96" width="124" height="150" rx="18" fill={color} opacity="0.12" />
      <ellipse cx="100" cy="100" rx="58" ry="8" fill="#f4e6cc" />
      <ellipse cx="100" cy="100" rx="58" ry="8" fill="none" stroke="#5c3610" strokeOpacity="0.35" />
      <rect x="50" y="108" width="10" height="122" rx="5" fill="#fff" opacity="0.18" />

      {/* этикетка */}
      <rect x="62" y="146" width="76" height="62" rx="4" fill="#fbf5ea" />
      <rect x="62" y="146" width="76" height="5" rx="2" fill={color} />
      <text
        x="100"
        y={name ? 162 : 172}
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="7.5"
        letterSpacing="2.5"
        fill="#2a1c12"
      >
        AMBRE&apos;
      </text>
      {name && (
        <text
          x="100"
          y="180"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize={name.length > 7 ? 10 : 12.5}
          letterSpacing="1.5"
          fill="#2a1c12"
        >
          {name.toUpperCase()}
        </text>
      )}
      {code !== undefined && (
        <text
          x="100"
          y={name ? 197 : 194}
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize={name ? 9 : 13}
          fill={color}
        >
          № {code}
        </text>
      )}

      {/* фитиль и пламя */}
      <path d="M100 100 L100 86" stroke="#2a1c12" strokeWidth="2.5" strokeLinecap="round" />
      {lit && (
        <path
          className="flame"
          d="M100 40 C108 56 114 66 110 77 C107 85 93 85 90 77 C86 66 92 56 100 40 Z"
          fill={`url(#flame-${id})`}
        />
      )}
    </svg>
  );
}
