import { requireUser } from "@/lib/auth";
import { getCentres, getFormationPlanMap, getFormations, getPlans, getSettings } from "@/lib/data";
import { EnrollForm } from "@/components/EnrollForm";

export const metadata = { title: "Nouvelle inscription" };

export default async function NouvelleInscription({ searchParams }: { searchParams: Promise<{ formation?: string }> }) {
  const { formation } = await searchParams;
  await requireUser(`/espace/inscriptions/nouvelle${formation ? `?formation=${formation}` : ""}`);
  const [formations, plans, map, centres, s] = await Promise.all([getFormations(), getPlans(), getFormationPlanMap(), getCentres(), getSettings()]);
  return (
    <div>
      <p className="eyebrow">Demande d&apos;inscription</p>
      <h1 className="mt-3 font-display text-4xl md:text-5xl">Votre formation, en trois étapes</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">Sélectionnez votre spécialité et sa durée, vérifiez le récapitulatif puis soumettez votre demande. Vous recevrez une référence à présenter à la direction.</p>
      <div className="mt-8">
        <EnrollForm
          initialSlug={formation}
          formations={formations.map((f) => ({ id: f.id, slug: f.slug, title: f.title, planIds: map.get(f.id) || [] }))}
          plans={plans.map(({ id, label, price, registrationFee, diploma, installments }) => ({ id, label, price, registrationFee, diploma, installments }))}
          centres={centres.map(({ id, name }) => ({ id, name }))}
          instructions={s.payment_instructions}
        />
      </div>
    </div>
  );
}
