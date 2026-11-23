import type { MetadataRoute } from "next";
import { getFormations, getNews } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const [formations, news] = await Promise.all([getFormations(), getNews()]);
  const pages = ["", "/etablissement", "/formations", "/tarifs", "/centres", "/galerie", "/actualites", "/faq", "/contact", "/inscription"];
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...formations.map((f) => ({ url: `${base}/formations/${f.slug}`, lastModified: f.updatedAt, priority: 0.8 })),
    ...news.map((n) => ({ url: `${base}/actualites/${n.slug}`, lastModified: n.publishedAt, priority: 0.5 })),
  ];
}
