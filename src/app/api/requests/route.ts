import { retourRewards } from "@/data/site";
import { firstIssue, requestSchema } from "@/lib/schemas";
import { escapeHtml as e, notifyOwner } from "@/lib/telegram";

const RETOUR_METHODS = {
  courier: "Курьеру при следующей доставке",
  partner: "В точке партнёра",
  parcel: "Посылкой (от 3 банок)",
  pickup: "При самовывозе",
} as const;

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }
  const data = parsed.data;

  if (data.type === "retour") {
    const jars = data.mini + data.medium + data.large;
    if (jars === 0) return Response.json({ error: "Укажите, сколько банок вы сдаёте" }, { status: 400 });
    if (data.method === "parcel" && jars < 3) {
      return Response.json({ error: "Посылкой принимаем от 3 банок" }, { status: 400 });
    }
    const [mini, medium, large] = retourRewards.map((r) => r.reward);
    const reward = data.mini * mini + data.medium * medium + data.large * large;
    await notifyOwner(
      [
        "<b>Заявка Retour</b>",
        `👤 ${e(data.name)}, ${e(data.contact)}`,
        `Банки: мини × ${data.mini}, 200 мл × ${data.medium}, 400 мл × ${data.large}`,
        `Скидка после проверки: до ${reward} ₽`,
        `Способ: ${RETOUR_METHODS[data.method]}`,
        data.orderNumber ? `Прошлый заказ: ${e(data.orderNumber)}` : "",
        "",
        `Код после приёмки: npm run retour:code -- ${reward}`,
      ]
        .filter(Boolean)
        .join("\n"),
    );
    return Response.json({ ok: true, reward });
  }

  await notifyOwner(
    [
      "<b>Корпоративная заявка</b>",
      `👤 ${e(data.name)}${data.company ? `, ${e(data.company)}` : ""}, ${e(data.contact)}`,
      `Количество: ${data.quantity} шт.`,
      data.deadline ? `Срок: ${e(data.deadline)}` : "",
      data.budget ? `Бюджет: ${e(data.budget)}` : "",
      `Логотип/своя этикетка: ${data.logo ? "да" : "нет"}`,
      data.comment ? `💬 ${e(data.comment)}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return Response.json({ ok: true });
}
