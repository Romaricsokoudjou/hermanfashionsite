import type { Metadata } from "next";
import Link from "next/link";
import { getNews } from "@/lib/data";
import { Media } from "@/components/Media";
import { EmptyState, PageHero } from "@/components/ui";
import { dateFr } from "@/lib/format";

export const metadata: Metadata = { title: "Actualités", description: "Les actualités, événements et rentrées de Herman FASHION." };

export default async function ActualitesPage() {
  const items = await getNews();
  return (
    <>
      <PageHero eyebrow="Actualités" title={<>La vie de <em className="text-brand-600">l&apos;établissement</em></>} text="Rentrées, événements, remises de diplômes et informations importantes." />
      <section className="py-14 md:py-20">
        <div className="container-x">
          {items.length === 0 ? (
            <EmptyState title="Aucune actualité pour le moment" text="Les prochaines annonces de Herman FASHION seront publiées ici. Suivez-nous également sur Facebook et TikTok." />
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {items.map((n) => (
                <Link key={n.id} href={`/actualites/${n.slug}`} className="reveal group">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[1.4rem] bg-sand">
                    <Media src={n.image} alt={n.title} sizes="(min-width:1024px) 33vw, 100vw" className="transition-transform duration-[1.2s] group-hover:scale-105" />
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">{dateFr(n.publishedAt)}</p>
                  <h2 className="mt-2 font-display text-2xl leading-snug group-hover:text-brand-700">{n.title}</h2>
                  {n.excerpt && <p className="mt-2 line-clamp-3 text-sm text-ink-soft">{n.excerpt}</p>}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
