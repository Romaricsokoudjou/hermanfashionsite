import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { ArrowLeft, CheckCircle2, Circle, PartyPopper, Ticket } from "lucide-react";
import { getDb } from "@/db";
import { centres, enrollments, payments } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { schedule } from "@/lib/enrollments";
import { StatusBadge } from "@/components/StatusBadge";
import { Progress } from "@/components/EnrollmentCard";
import { dateFr, fcfa, PAYMENT_METHODS } from "@/lib/format";

export const metadata = { title: "Mon inscription" };

export default async function InscriptionDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ nouveau?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { nouveau } = await searchParams;
  const db = await getDb();
  // Chaque utilisateur n'accède qu'à ses propres dossiers
  const [e] = await db.select().from(enrollments).where(and(eq(enrollments.id, Number(id)), eq(enrollments.userId, user.id))).limit(1);
  if (!e) notFound();
  const [pays, s, centre] = await Promise.all([
    db.select().from(payments).where(eq(payments.enrollmentId, e.id)).orderBy(desc(payments.receivedAt)),
    getSettings(),
    e.centreId ? db.select().from(centres).where(eq(centres.id, e.centreId)).then((r) => r[0]) : Promise.resolve(undefined),
  ]);
  const remaining = Math.max(0, e.totalDue - e.amountPaid);
  const steps = [
    { label: "Demande soumise", done: true },
    { label: "Premier paiement enregistré", done: e.amountPaid > 0 },
    { label: "Formation entièrement réglée", done: e.amountPaid >= e.totalDue },
    { label: "Inscription validée par la direction", done: e.validated },
  ];

  return (
    <div className="space-y-6">
      <Link href="/espace/inscriptions" className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-brand-700"><ArrowLeft className="h-4 w-4" /> Mes inscriptions</Link>

      {nouveau && (
        <div className="fade-up flex gap-4 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-6">
          <PartyPopper className="h-6 w-6 shrink-0 text-emerald-700" />
          <div>
            <p className="font-semibold text-emerald-900">Votre demande d&apos;inscription est enregistrée !</p>
            <p className="mt-1 text-sm text-emerald-800">Présentez-vous à la direction dans l&apos;un de nos centres avec votre référence <strong>{e.reference}</strong> pour effectuer votre règlement en espèces.</p>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-6 md:p-8">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-brand-700"><Ticket className="h-4 w-4" /> {e.reference}</p>
            <h1 className="mt-2 font-display text-4xl">{e.formationTitle}</h1>
            <p className="text-ink-soft">{e.planLabel}{e.diploma ? ` · Diplôme indiqué : ${e.diploma}` : ""} · demandée le {dateFr(e.createdAt)}</p>
            {!e.durationConfirmed && <p className="mt-2 text-xs text-amber-700">Durée en attente de confirmation par la direction.</p>}
          </div>
          <StatusBadge status={e.status} className="text-sm" />
        </div>
        <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-mute">Suivi du dossier</p>
            <ol className="mt-4 space-y-3">
              {steps.map((st) => (
                <li key={st.label} className="flex items-center gap-3 text-sm">
                  {st.done ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Circle className="h-5 w-5 text-line" />}
                  <span className={st.done ? "font-medium" : "text-ink-mute"}>{st.label}</span>
                </li>
              ))}
            </ol>
            {centre && <p className="mt-6 text-sm text-ink-soft">Centre souhaité : <strong>{centre.name}</strong></p>}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-mute">Situation financière</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-ink-soft">Total à régler</dt><dd className="font-semibold">{fcfa(e.totalDue)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-soft">Montant réglé</dt><dd className="font-semibold text-emerald-700">{fcfa(e.amountPaid)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-soft">Reste à régler</dt><dd className="font-semibold text-brand-700">{fcfa(remaining)}</dd></div>
            </dl>
            <div className="mt-4"><Progress paid={e.amountPaid} total={e.totalDue} /></div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-display text-2xl">Échéancier indicatif</h2>
          <p className="mt-1 text-xs text-ink-mute">{e.paymentMode === "unique" ? "Paiement en une fois" : "Paiement en tranches"}</p>
          <ul className="mt-4 divide-y divide-line text-sm">
            {schedule(e).map((r) => (
              <li key={r.label} className="flex items-center justify-between py-3">
                <span className="flex items-center gap-2">
                  {e.amountPaid >= r.cumul ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-line" />}
                  {r.label}
                </span>
                <span className="font-semibold">{fcfa(r.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="font-display text-2xl">Paiements confirmés</h2>
          {pays.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">Aucun paiement enregistré pour l&apos;instant. {s.payment_instructions}</p>
          ) : (
            <ul className="mt-4 divide-y divide-line text-sm">
              {pays.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3">
                  <span>
                    <span className="block font-medium">{p.label || "Paiement"}</span>
                    <span className="text-xs text-ink-mute">{dateFr(p.receivedAt)} · {PAYMENT_METHODS[p.method] || p.method}</span>
                  </span>
                  <span className="font-semibold text-emerald-700">{fcfa(p.amount)}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 rounded-xl bg-ivory p-3 text-xs text-ink-mute">Seuls les paiements confirmés par l&apos;administration apparaissent ici.</p>
        </div>
      </div>
      <Link href={`/contact`} className="inline-block text-sm font-semibold text-brand-700">Une question sur ce dossier ? Écrire à la direction →</Link>
    </div>
  );
}
