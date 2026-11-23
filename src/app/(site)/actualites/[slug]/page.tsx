import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getNewsBySlug } from "@/lib/data";
import { Media } from "@/components/Media";
import { dateFr } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const n = await getNewsBySlug((await params).slug);
  return n ? { title: n.title, description: n.excerpt } : {};
}

export default async function NewsPage({ params }: Props) {
  const n = await getNewsBySlug((await params).slug);
  if (!n) notFound();
  return (
    <article className="py-12 md:py-20">
      <div className="container-x max-w-3xl">
        <Link href="/actualites" className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-brand-700"><ArrowLeft className="h-4 w-4" /> Actualités</Link>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">{dateFr(n.publishedAt)}</p>
        <h1 className="h-display mt-3 text-[2.6rem] md:text-[3.4rem]">{n.title}</h1>
        {n.excerpt && <p className="mt-5 text-lg text-ink-soft">{n.excerpt}</p>}
        {n.image && (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[1.6rem]">
            <Media src={n.image} alt={n.title} priority />
          </div>
        )}
        <div className="prose-hf mt-10 whitespace-pre-line text-[1.05rem]">{n.body}</div>
      </div>
    </article>
  );
}
