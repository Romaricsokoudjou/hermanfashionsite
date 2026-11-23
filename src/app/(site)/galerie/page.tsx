import type { Metadata } from "next";
import { getGallery } from "@/lib/data";
import { GalleryGrid } from "@/components/GalleryGrid";
import { VideoEmbed } from "@/components/VideoEmbed";
import { EmptyState, PageHero, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Galerie photos et vidéos",
  description: "Locaux, apprenantes, travaux pratiques et moments de formation : la galerie authentique de Herman FASHION à Douala.",
};

const SLOTS: Record<string, string> = { presentation: "Présentation de Herman FASHION", immersion: "Immersion dans les formations", temoignages: "Réalisations et témoignages" };

export default async function GaleriePage() {
  const [images, videos] = await Promise.all([getGallery("image"), getGallery("video")]);
  return (
    <>
      <PageHero eyebrow="Galerie" title={<>Herman FASHION, <em className="text-brand-600">en images</em></>} text="Des photographies authentiques de nos salles, de nos apprenantes et de nos séances de travaux pratiques." />
      <section className="py-14 md:py-20">
        <div className="container-x">
          <GalleryGrid items={images.map(({ id, url, title, category }) => ({ id, url, title, category }))} />
        </div>
      </section>
      <section className="bg-ivory py-16 md:py-24">
        <div className="container-x">
          <SectionHeading eyebrow="Vidéos" title={<>Vivez l&apos;expérience <em className="text-brand-600">Herman FASHION</em></>} />
          {videos.length === 0 ? (
            <div className="mt-10">
              <EmptyState title="Nos vidéos arrivent bientôt" text="Présentation de l'établissement, immersion dans les formations, réalisations et témoignages : les vidéos seront publiées ici très prochainement." />
            </div>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videos.map((v) => (
                <div key={v.id} className="reveal">
                  <div className="relative aspect-video overflow-hidden rounded-[1.4rem] bg-black shadow-soft">
                    <VideoEmbed url={v.url} title={v.title || "Vidéo"} />
                  </div>
                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-brand-700">{SLOTS[v.slot] || "Vidéo"}</p>
                  {v.title && <p className="mt-1 font-semibold">{v.title}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
