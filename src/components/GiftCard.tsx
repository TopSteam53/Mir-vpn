import { formatRub } from "@/lib/pricing";

/** Подарочный сертификат: превью карточки, которую получит адресат. */
export function GiftCard({
  amount,
  to,
  from,
  message,
  compact = false,
}: {
  amount: number;
  to?: string;
  from?: string;
  message?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#1f150d] text-[#f6efe4] shadow-xl ${compact ? "aspect-[4/3] p-2" : "aspect-[8/5] p-6 sm:p-8"}`}
      style={{
        backgroundImage:
          "radial-gradient(70% 90% at 85% 15%, rgb(233 182 92 / 0.35), transparent 60%), radial-gradient(60% 80% at 10% 100%, rgb(200 134 46 / 0.25), transparent 60%)",
      }}
    >
      <div className="absolute inset-2 rounded-xl border border-[#c8a25a]/40 sm:inset-3" aria-hidden="true" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className={`wordmark ${compact ? "text-[8px]" : "text-sm sm:text-base"}`}>AMBRE&apos;</span>
          {!compact && <span className="eyebrow !text-[#d9b56a]">Подарочный сертификат</span>}
        </div>
        <div>
          <p className={`font-display text-[#e9c27a] ${compact ? "text-sm" : "text-4xl sm:text-5xl"}`}>{formatRub(amount)}</p>
          {!compact && (
            <>
              <p className="mt-2 text-sm text-[#f6efe4]/80">
                {to?.trim() ? `Кому: ${to.trim()}` : "Для того, кто собирает моменты"}
                {from?.trim() ? ` · от: ${from.trim()}` : ""}
              </p>
              {message?.trim() && <p className="mt-2 line-clamp-2 text-sm italic text-[#f6efe4]/70">«{message.trim()}»</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
