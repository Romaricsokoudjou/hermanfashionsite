import type { Metadata } from "next";
import Link from "next/link";
import { getFormationPlanMap, getFormations, getPlans } from "@/lib/data";
import { FormationCard, PageHero } from "@/components/ui";
import { fcfa } from "@/lib/format";

export const metadata: Metadata = {
  title: "Nos formations",
  description: "Coiffure femme, onglerie, esthétique bio, make-up, massage, pédicure-manucure, extension de cils, microblading et microshading : découvrez les formations de Herman FASHION à Douala.",
};

export default async function FormationsPage() {
  const [formations, plans, map] = await Promise.all([getFormations(), getPlans(), getFormationPlanMap()]);
  const min = Math.min(...plans.map((p) => p.price));
  return (
    <>
      <PageHero
        eyebrow="Catalogue des formations"
        title={<>Neuf métiers, <em className="text-brand-600">une passion</em></>}
        text="Chaque spécialité dispose de sa fiche détaillée : présentation, durées, tarifs, débouchés et inscription en ligne."
        image="/images/photos/hf-6337.webp"
      >
        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full border border-line bg-white px-4 py-2">À partir de <strong>{fcfa(min)}</strong></span>
          <span className="rounded-full border border-line bg-white px-4 py-2">Durées de 3 mois à 1 an</span>
          <span className="rounded-full border border-line bg-white px-4 py-2">Paiement en 3 tranches</span>
        </div>
      </PageHero>
      <section className="py-16 md:py-24">
        <div className="container-x grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {formations.map((f, i) => {
            const n = (map.get(f.id) || []).length;
            return (
              <div key={f.id} className="flex flex-col">
                <FormationCard f={f} index={i} />
                <p className="mt-3 px-2 text-xs text-ink-mute">
                  {n ? `${n} durée${n > 1 ? "s" : ""} disponible${n > 1 ? "s" : ""}` : "Durées communiquées par la direction"}
                </p>
              </div>
            );
          })}
        </div>
        <div className="container-x mt-16">
          <div className="reveal flex flex-col items-start justify-between gap-6 rounded-[1.75rem] bg-night p-8 text-white md:flex-row md:items-center md:p-10">
            <div>
              <p className="font-display text-3xl">Vous hésitez entre plusieurs spécialités ?</p>
              <p className="mt-2 text-white/65">Posez vos questions à HERMAN AI ou écrivez directement à la direction.</p>
            </div>
            <Link href="/contact" className="btn btn-primary shrink-0">Nous contacter</Link>
          </div>
        </div>
      </section>
    </>
  );
}
