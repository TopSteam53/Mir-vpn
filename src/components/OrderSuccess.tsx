"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { site } from "@/data/site";
import { cart } from "@/lib/cart-store";

export function OrderSuccess() {
  const params = useSearchParams();
  const order = params.get("order");
  const manual = params.get("manual") === "1";

  useEffect(() => {
    if (order) cart.clear();
  }, [order]);

  return (
    <>
      <p className="mt-6 text-lg text-muted">
        {order ? (
          <>
            Номер заказа: <b className="text-ink">{order}</b>.{" "}
          </>
        ) : null}
        {manual
          ? "Мы свяжемся с вами в ближайшее время, чтобы подтвердить заказ и способ оплаты."
          : "Как только оплата пройдёт, мы начнём собирать заказ и пришлём трек-номер."}
      </p>
      <p className="mt-4 text-muted">
        Есть вопросы? Пишите в <a href={site.contacts.telegram} className="text-amber-strong underline">Telegram</a> или
        на {site.contacts.email}.
      </p>
      <Link href="/stories" className="btn btn-primary mt-8">
        К историям
      </Link>
    </>
  );
}
