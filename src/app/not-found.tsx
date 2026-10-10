import Link from "next/link";
import { CandleArt } from "@/components/CandleArt";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <CandleArt color="#c8862e" lit={false} className="h-40" />
      <h1 className="mt-6 font-display text-4xl">Этот момент не сохранился</h1>
      <p className="mt-3 text-muted">Страница не найдена. Возможно, ссылка устарела.</p>
      <Link href="/" className="btn btn-primary mt-8">
        На главную
      </Link>
    </div>
  );
}
