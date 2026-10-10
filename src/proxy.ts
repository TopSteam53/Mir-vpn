import { NextResponse, type NextRequest } from "next/server";
import { products } from "@/data/products";
import { stories } from "@/data/stories";

const KNOWN = {
  product: new Set(products.map((p) => p.slug)),
  stories: new Set(stories.map((s) => s.slug)),
};

// С Cache Components неизвестный адрес товара или истории рендерится потоком и получает статус 200.
// Отсекаем такие адреса заранее, чтобы поисковики видели настоящий 404.
export function proxy(request: NextRequest) {
  const [, section, slug] = request.nextUrl.pathname.split("/");
  const known = KNOWN[section as keyof typeof KNOWN];
  if (known && slug && !known.has(decodeURIComponent(slug))) {
    return NextResponse.rewrite(new URL("/_not-found", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/product/:slug", "/stories/:slug"],
};
