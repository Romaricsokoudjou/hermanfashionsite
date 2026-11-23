import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, Clock3, Smartphone, CreditCard, ArrowRight } from "lucide-react";
import { getPlans, getSettings } from "@/lib/data";
import { PlanCard } from "@/components/PlanCard";
import { PageHero, SectionHeading } from "@/components/ui";
import { StatusBadge } from "@/components/StatusBadge";
import { fcfa } from "@/lib/format";

export const metadata: Metadata = {
  title: "Tarifs & admission",
  description: "Tarifs officiels Herman FASHION : formation de 3 mois (150 000 FCFA, AQP), 6 mois (250 000 FCFA, CQP), 1 an (350 000 FCFA, DQP). Inscription et polo : 10 000 FCFA.",
};

export default async function TarifsPage() {
  const [plans, s] = await Promise.all([getPlans(), getSettings()]);
  const procedure = [
    "Vous sélectionnez votre formation.",
    "Vous consultez le montant à payer.",
    "Vous soumettez votre demande d'inscription.",
    "Le site vous indique les modalités de règlement auprès de la direction.",
    "Vous vous rendez à l'établissement pour effectuer votre paiement en espèces.",
    "L'administration confirme le paiement depuis son tableau de bord.",
    "Le statut de votre inscription est automatiquement actualisé.",
  ];
  return (
    <>
      <PageHero eyebrow="Tarifs & admission" title={<>Des tarifs <em className="text-brand-600">clairs</em>, un paiement adapté</>} text="Trois parcours diplômants, des frais d'inscription uniques de 10 000 FCFA (inscription et polo) et la possibilité de régler en trois tranches." />

      <section className="py-16 md:py-24">
        <div className="container-x">
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((p, i) => (
              <PlanCard key={p.id} plan={p} highlight={i === 1} />
            ))}
          </div>

          <div className="reveal mt-14 overflow-x-auto rounded-[1.5rem] border border-line">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-ivory text-xs uppercase tracking-wider text-ink-mute">
                <tr>
                  <th className="px-6 py-4">Parcours</th>
                  <th className="px-6 py-4">Formation</th>
                  <th className="px-6 py-4">Inscription & polo</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Tranches</th>
                  <th className="px-6 py-4">Diplôme indiqué</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {plans.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 font-semibold">{p.label}</td>
                    <td className="px-6 py-4">{fcfa(p.price)}</td>
                    <td className="px-6 py-4">{fcfa(p.registrationFee)}</td>
                    <td className="px-6 py-4 font-semibold">{fcfa(p.price + p.registrationFee)}</td>
                    <td className="px-6 py-4 text-ink-soft">{p.installments.map(fcfa).join(" + ")}</td>
                    <td className="px-6 py-4"><span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-800">{p.diploma}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="reveal mt-4 text-sm text-ink-mute">
            Les frais d&apos;inscription de 10 000 FCFA sont les frais initiaux d&apos;accès à l&apos;inscription. Les durées disponibles pour chaque spécialité sont précisées sur sa fiche.
          </p>
        </div>
      </section>

      <section className="bg-ivory py-16 md:py-24">
        <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <SectionHeading eyebrow="Paiement — première version" title={<>Le règlement se fait <em className="text-brand-600">en espèces</em>, auprès de la direction</>} text={s.payment_instructions} />
            <div className="reveal mt-8 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl border border-brand-200 bg-white p-4">
                <Banknote className="h-5 w-5 text-brand-600" />
                <div><p className="text-sm font-semibold">Espèces</p><p className="text-xs text-emerald-700">Disponible</p></div>
              </div>
              {[
                [Smartphone, "Orange Money / MTN MoMo"],
                [CreditCard, "Carte bancaire"],
              ].map(([Icon, label]) => {
                const I = Icon as typeof Banknote;
                return (
                  <div key={label as string} className="flex items-center gap-3 rounded-2xl border border-line bg-white/60 p-4">
                    <I className="h-5 w-5 text-ink-mute" />
                    <div><p className="text-sm font-semibold text-ink-soft">{label as string}</p><p className="flex items-center gap-1 text-xs text-ink-mute"><Clock3 className="h-3 w-3" /> Bientôt disponible</p></div>
                  </div>
                );
              })}
            </div>
          </div>
          <ol className="reveal relative space-y-4 border-l border-brand-200 pl-8">
            {procedure.map((p, i) => (
              <li key={p} className="relative rounded-2xl bg-white p-5 shadow-soft">
                <span className="absolute -left-[2.85rem] top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-sm font-bold text-white">{i + 1}</span>
                <p className="text-[0.95rem] text-ink">{p}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-x">
          <SectionHeading eyebrow="Suivi de dossier" title="Les statuts de votre inscription" text="Votre statut évolue automatiquement à chaque paiement enregistré par l'administration. Aucun paiement n'est affiché comme confirmé sans validation de la direction." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["en_attente", "Votre demande est reçue. Aucun paiement n'est encore enregistré."],
              ["paiement_partiel", "Une ou plusieurs tranches sont réglées. Le reste à payer est indiqué dans votre espace."],
              ["paiement_confirme", "La totalité des frais est réglée et confirmée par l'administration."],
              ["validee", "La direction a validé votre inscription. Bienvenue chez Herman FASHION !"],
            ].map(([st, d]) => (
              <div key={st} className="reveal card p-6">
                <StatusBadge status={st} />
                <p className="mt-4 text-sm leading-relaxed text-ink-soft">{d}</p>
              </div>
            ))}
          </div>
          {s.admission_conditions && (
            <div className="reveal mt-12 rounded-[1.5rem] border border-line p-8">
              <h3 className="font-display text-2xl">Conditions d&apos;admission</h3>
              <p className="mt-3 whitespace-pre-line text-ink-soft">{s.admission_conditions}</p>
            </div>
          )}
          <div className="reveal mt-12 flex flex-col gap-3 sm:flex-row">
            <Link href="/inscription" className="btn btn-primary">Créer mon compte <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/formations" className="btn btn-ghost">Choisir une formation</Link>
          </div>
        </div>
      </section>
    </>
  );
}
