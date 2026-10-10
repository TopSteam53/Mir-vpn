import { z } from "zod";
import { MAX_QTY } from "@/lib/pricing";

const phone = z
  .string()
  .trim()
  .refine((v) => v.replace(/\D/g, "").length >= 10 && v.replace(/\D/g, "").length <= 15, {
    message: "Укажите телефон",
  });

export const cartLineSchema = z.object({
  slug: z.string().max(80),
  variant: z.enum(["mini", "200", "400"]).optional(),
  picks: z.array(z.string().max(80)).max(10).optional(),
  qty: z.number().int().min(1).max(MAX_QTY),
});

export const orderSchema = z
  .object({
    name: z.string().trim().min(2, "Укажите имя").max(100),
    phone,
    email: z.email("Укажите e-mail").max(120),
    shipping: z.enum(["cdek_pvz", "cdek_courier", "post", "pickup"]),
    city: z.string().trim().max(100).default(""),
    address: z.string().trim().max(300).default(""),
    comment: z.string().trim().max(1000).default(""),
    giftWrap: z.boolean().default(false),
    cardText: z.string().trim().max(300).default(""),
    promoCode: z.string().trim().max(40).default(""),
    consent: z.literal(true, { error: "Нужно согласие на обработку персональных данных" }),
    items: z.array(cartLineSchema).min(1, "Корзина пуста").max(30),
    website: z.string().max(0).optional(), // ловушка для ботов, у людей поле скрыто
  })
  .refine((o) => o.shipping === "pickup" || (o.city.length > 1 && o.address.length > 3), {
    message: "Укажите город и адрес или пункт выдачи",
    path: ["address"],
  });

export type OrderInput = z.infer<typeof orderSchema>;

export const requestSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("retour"),
    name: z.string().trim().min(2, "Укажите имя").max(100),
    contact: z.string().trim().min(5, "Укажите телефон, e-mail или Telegram").max(120),
    mini: z.number().int().min(0).max(50),
    medium: z.number().int().min(0).max(50),
    large: z.number().int().min(0).max(50),
    method: z.enum(["courier", "partner", "parcel", "pickup"]),
    orderNumber: z.string().trim().max(40).default(""),
    consent: z.literal(true, { error: "Нужно согласие на обработку персональных данных" }),
    website: z.string().max(0).optional(),
  }),
  z.object({
    type: z.literal("corporate"),
    name: z.string().trim().min(2, "Укажите имя").max(100),
    company: z.string().trim().max(150).default(""),
    contact: z.string().trim().min(5, "Укажите телефон, e-mail или Telegram").max(120),
    quantity: z.number().int().min(1).max(100000),
    deadline: z.string().trim().max(60).default(""),
    budget: z.string().trim().max(60).default(""),
    logo: z.boolean().default(false),
    comment: z.string().trim().max(1500).default(""),
    consent: z.literal(true, { error: "Нужно согласие на обработку персональных данных" }),
    website: z.string().max(0).optional(),
  }),
]);

export type RequestInput = z.infer<typeof requestSchema>;

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Проверьте поля формы";
}
