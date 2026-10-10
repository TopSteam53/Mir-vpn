import { resolvePromo } from "@/lib/promo";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { code?: unknown } | null;
  const code = typeof body?.code === "string" ? body.code.slice(0, 40) : "";
  const result = resolvePromo(code);
  if (!result) return Response.json({ error: "Введите промокод" }, { status: 400 });
  if (!result.ok) return Response.json({ error: result.reason }, { status: 404 });
  return Response.json({ promo: result.promo });
}
