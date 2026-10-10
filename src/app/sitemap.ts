import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { site } from "@/data/site";
import { stories } from "@/data/stories";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/stories", "/catalog", "/retour", "/corporate", "/about", "/delivery", "/contacts"];
  return [
    ...pages.map((path) => ({ url: `${site.url}${path}` })),
    ...stories.map((s) => ({ url: `${site.url}/stories/${s.slug}` })),
    ...products.map((p) => ({ url: `${site.url}/product/${p.slug}` })),
  ];
}
