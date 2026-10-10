import type { Metadata } from "next";
import { TextPage } from "@/components/TextPage";
import { site } from "@/data/site";

export const metadata: Metadata = { title: "Контакты" };

export default function ContactsPage() {
  return (
    <TextPage eyebrow="Связаться" title="Контакты">
      <ul>
        <li>
          Telegram: <a href={site.contacts.telegram}>{site.contacts.telegram.replace("https://", "")}</a>
        </li>
        <li>
          VK: <a href={site.contacts.vk}>{site.contacts.vk.replace("https://", "")}</a>
        </li>
        <li>
          E-mail: <a href={`mailto:${site.contacts.email}`}>{site.contacts.email}</a>
        </li>
        <li>
          Телефон: <a href={`tel:${site.contacts.phone.replace(/[^\d+]/g, "")}`}>{site.contacts.phone}</a>
        </li>
      </ul>
      <p>
        {site.legal.seller}, ИНН {site.legal.inn}.
      </p>
    </TextPage>
  );
}
