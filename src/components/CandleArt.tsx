import { CandleRender } from "@/components/CandleRender";

type Props = {
  /** Цвет истории для полосы на этикетке */
  color: string;
  /** Сквозной номер момента, например 102 */
  code?: number;
  /** Название свечи, печатается на этикетке */
  name?: string;
  /** Строка-момент под названием */
  caption?: string;
  lit?: boolean;
  className?: string;
};

/** Свеча в фирменной янтарной банке. Временная замена фотографиям. */
export function CandleArt({ color, code, name, caption, lit = true, className }: Props) {
  return (
    <CandleRender
      accent={color}
      name={name}
      code={code !== undefined ? `№ ${code}` : undefined}
      caption={caption}
      lit={lit}
      className={className}
    />
  );
}
