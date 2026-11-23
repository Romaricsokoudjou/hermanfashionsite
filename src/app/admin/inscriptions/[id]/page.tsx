import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { ArrowLeft, Mail, MapPin, Phone, Trash2 } from "lucide-react";
import { getDb } from "@/db";
import { centres, enrollments, payments, users } from "@/db/schema";
import { deletePaymentAction, recordPaymentAction, saveEnrollmentNoteAction, setEnrollmentStateAction } from "@/app/actions/admin";
import { AdminHeader, Area, Panel, Toggle } from "@/components/admin-ui";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { Progress } from "@/components/EnrollmentCard";
import { schedule } from "@/lib/enrollments";
import { dateFr, fcfa, PAYMENT_METHODS } from "@/lib/format";

export const metadata = { title: "Dossier d'inscription" };

export default async function AdminInscription({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const db = await getDb();
  const [row] = await db.select({ e: enrollments, u: users }).from(enrollments).innerJoin(users, eq(enrollments.userId, users.id)).where(eq(enrollments.id, id)).limit(1);
  if (!row) notFound();
  const { e, u } = row;
  const [pays, allCentres] = await Promise.all([db.select().from(payments).where(eq(payments.enrollmentId, id)).orderBy(desc(payments.receivedAt)), db.select().from(centres)]);
  const remaining = Math.max(0, e.totalDue - e.amountPaid);
  const sched = schedule(e);
  const nextDue = sched.find((s) => s.cumul > e.amountPaid);
  const suggested = nextDue ? Math.min(remaining, nextDue.cumul - e.amountPaid) : remaining;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <Link href="/admin/inscriptions" className="mb-4 inline-flex items-center gap-2 text-sm text-ink-soft hover:text-brand-700"><ArrowLeft className="h-4 w-4" /> Inscriptions</Link>
      <AdminHeader title={e.reference} text={`${e.formationTitle} · ${e.planLabel}${e.diploma ? ` · ${e.diploma}` : ""} — demandé le ${dateFr(e.createdAt, true)}`}>
        <StatusBadge status={e.status} className="text-sm" />
      </AdminHeader>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Panel title="Situation financière">
            <div className="grid gap-4 sm:grid-cols-3">
              <div><p className="text-xs text-ink-mute">Total dû</p><p className="font-display text-3xl">{fcfa(e.totalDue)}</p></div>
              <div><p className="text-xs text-ink-mute">Réglé</p><p className="font-display text-3xl text-emerald-700">{fcfa(e.amountPaid)}</p></div>
              <div><p className="text-xs text-ink-mute">Reste</p><p className="font-display text-3xl text-brand-700">{fcfa(remaining)}</p></div>
            </div>
            <div className="mt-4"><Progress paid={e.amountPaid} total={e.totalDue} /></div>
            <ul className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
              {sched.map((s) => (
                <li key={s.label} className={`flex justify-between rounded-lg px-3 py-2 ${e.amountPaid >= s.cumul ? "bg-emerald-50 text-emerald-900" : "bg-ivory"}`}>
                  <span>{s.label}</span><span className="font-semibold">{fcfa(s.amount)}</span>
                </li>
              ))}
            </ul>
          </Panel>

          {!e.cancelled && remaining > 0 && (
            <Panel title="Enregistrer un paiement en espèces">
              <form action={recordPaymentAction} className="grid gap-4 sm:grid-cols-2">
                <input type="hidden" name="enrollmentId" value={e.id} />
                <div>
                  <label className="field-label">Montant reçu (FCFA)</label>
                  <input name="amount" type="number" min={1} max={remaining} required defaultValue={suggested} className="field !min-h-[2.75rem] !py-2 text-sm" />
                </div>
                <div>
                  <label className="field-label">Libellé</label>
                  <select name="label" defaultValue={nextDue?.label} className="field !min-h-[2.75rem] !py-2 text-sm">
                    {sched.map((s) => <option key={s.label}>{s.label}</option>)}
                    <option>Paiement partiel</option>
                    <option>Solde</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Mode de paiement</label>
                  <select name="method" className="field !min-h-[2.75rem] !py-2 text-sm">
                    <option value="especes">Espèces</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Date de réception</label>
                  <input type="date" name="receivedAt" defaultValue={today} className="field !min-h-[2.75rem] !py-2 text-sm" />
                </div>
                <div>
                  <label className="field-label">N° de reçu (facultatif)</label>
                  <input name="reference" className="field !min-h-[2.75rem] !py-2 text-sm" />
                </div>
                <div>
                  <label className="field-label">Note interne</label>
                  <input name="note" className="field !min-h-[2.75rem] !py-2 text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <SubmitButton pendingText="Enregistrement…" confirm="Confirmer l'enregistrement de ce paiement ? L'apprenant sera notifié.">Confirmer le paiement</SubmitButton>
                </div>
              </form>
            </Panel>
          )}

          <Panel title={`Paiements enregistrés (${pays.length})`}>
            {pays.length === 0 ? <p className="text-sm text-ink-mute">Aucun paiement.</p> : (
              <ul className="divide-y divide-line text-sm">
                {pays.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                    <span>
                      <span className="font-semibold">{fcfa(p.amount)}</span> · {p.label || "Paiement"}
                      <span className="block text-xs text-ink-mute">{dateFr(p.receivedAt)} · {PAYMENT_METHODS[p.method] || p.method}{p.reference && ` · reçu ${p.reference}`}{p.note && ` · ${p.note}`}</span>
                    </span>
                    <form action={deletePaymentAction}>
                      <input type="hidden" name="paymentId" value={p.id} />
                      <SubmitButton className="btn-ghost btn-sm !h-9 !px-3 text-red-600" pendingText="…" confirm="Supprimer ce paiement (erreur de saisie) ? Les montants seront recalculés.">
                        <Trash2 className="h-4 w-4" />
                      </SubmitButton>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Apprenant">
            <p className="font-display text-2xl">{u.firstName} {u.lastName}</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              <li className="flex gap-2"><Phone className="h-4 w-4 text-brand-600" /> <a href={`tel:${u.phone}`}>{u.phone}</a></li>
              <li className="flex gap-2"><Mail className="h-4 w-4 text-brand-600" /> <a href={`mailto:${u.email}`}>{u.email}</a></li>
              <li className="flex gap-2"><MapPin className="h-4 w-4 text-brand-600" /> {u.city}, {u.country}</li>
            </ul>
            {e.message && <p className="mt-4 rounded-xl bg-ivory p-3 text-sm"><span className="block text-xs font-semibold text-ink-mute">Message du candidat</span>{e.message}</p>}
            <p className="mt-3 text-xs text-ink-mute">Mode souhaité : {e.paymentMode === "unique" ? "paiement unique" : "paiement en tranches"}</p>
          </Panel>

          <Panel title="Décision">
            <div className="flex flex-wrap gap-2">
              {[
                !e.validated && !e.cancelled && ["validate", "Valider l'inscription", "btn-primary"],
                e.validated && ["unvalidate", "Retirer la validation", "btn-ghost"],
                !e.cancelled && ["cancel", "Annuler le dossier", "btn-ghost text-red-600"],
                e.cancelled && ["restore", "Rétablir le dossier", "btn-ghost"],
              ]
                .filter(Boolean)
                .map((x) => {
                  const [op, label, cls] = x as string[];
                  return (
                    <form key={op} action={setEnrollmentStateAction}>
                      <input type="hidden" name="enrollmentId" value={e.id} />
                      <input type="hidden" name="op" value={op} />
                      <SubmitButton className={`${cls} btn-sm`} confirm={op === "cancel" ? "Annuler ce dossier ?" : undefined}>{label}</SubmitButton>
                    </form>
                  );
                })}
            </div>
            <p className="mt-3 text-xs text-ink-mute">Les statuts « en attente », « paiement partiel » et « paiement confirmé » sont calculés automatiquement à partir des paiements enregistrés.</p>
          </Panel>

          <Panel title="Suivi interne">
            <form action={saveEnrollmentNoteAction} className="space-y-4">
              <input type="hidden" name="enrollmentId" value={e.id} />
              <div>
                <label className="field-label">Centre</label>
                <select name="centreId" defaultValue={e.centreId ?? ""} className="field !min-h-[2.75rem] !py-2 text-sm">
                  <option value="">Non défini</option>
                  {allCentres.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <input type="hidden" name="durationConfirmed" value="false" />
              <Toggle name="durationConfirmed" label="Durée confirmée par la direction" defaultChecked={e.durationConfirmed} />
              <Area label="Note interne (non visible par l'apprenant)" name="adminNote" defaultValue={e.adminNote} rows={3} />
              <SubmitButton className="btn-dark btn-sm">Enregistrer</SubmitButton>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
}
