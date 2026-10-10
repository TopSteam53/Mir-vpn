import { CandleRender } from "@/components/CandleRender";
import { builderWaxes } from "@/data/builder";
import type { BuilderConfig } from "@/lib/builder";

/** Живое превью свечи из конструктора. */
export function BuilderPreview({ config }: { config: BuilderConfig }) {
  const title = config.title.trim() || "Твой момент";
  return (
    <CandleRender
      glass={config.jar}
      wax={builderWaxes.find((w) => w.id === config.wax)?.color}
      accent="#c8862e"
      name={title}
      caption={config.text.trim() || undefined}
      wick={config.wick}
      wicks={config.size === "400" ? 2 : 1}
      lid={config.lid}
      className="h-full w-full"
      title={`Превью свечи «${title}»`}
    />
  );
}
