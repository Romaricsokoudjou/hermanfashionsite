import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { enrollments, payments } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { dateFr, fcfa, PAYMENT_METHODS } from "@/lib/format";

export const metadata = { title: "Mes paiements" };

export default async function MesPaiements() {
  const user = await requireUser();
  const db = await getDb();
  const rows = await db
    .select({ p: payments, ref: enrollments.reference, formation: enrollments.formationTitle, eid: enrollments.id })
    .from(payments)
    .innerJoin(enrollments, eq(payments.enrollmentId, enrollments.id))
    .where(eq(enrollments.userId, user.id))
    .orderBy(desc(payments.receivedAt));
  const list = await db.select().from(enrollments).where(eq(enrollments.userId, user.id));
  const total = rows.reduce((a, r) => a + r.p.amount, 0);
  const remaining = list.filter((e) => e.status !== "annulee").reduce((a, e) => a + Math.max(0, e.totalDue - e.amountPaid), 0);
  return (
    <div>
      <h1 className="font-display text-4xl">Mes paiements</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card p-6"><p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">Total réglé</p><p className="mt-2 font-display text-4xl text-emerald-700">{fcfa(total)}</p></div>
        <div className="card p-6"><p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">Reste à régler</p><p className="mt-2 font-display text-4xl text-brand-700">{fcfa(remaining)}</p></div>
      </div>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wider text-ink-mute">
            <tr><th className="p-4">Date</th><th className="p-4">Dossier</th><th className="p-4">Libellé</th><th className="p-4">Mode</th><th className="p-4 text-right">Montant</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-ink-mute">Aucun paiement confirmé pour le moment.</td></tr>}
            {rows.map((r) => (
              <tr key={r.p.id}>
                <td className="p-4">{dateFr(r.p.receivedAt)}</td>
                <td className="p-4"><Link href={`/espace/inscriptions/${r.eid}`} className="font-medium text-brand-700">{r.ref}</Link><br /><span className="text-xs text-ink-mute">{r.formation}</span></td>
                <td className="p-4">{r.p.label || "—"}</td>
                <td className="p-4">{PAYMENT_METHODS[r.p.method] || r.p.method}</td>
                <td className="p-4 text-right font-semibold">{fcfa(r.p.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-ink-mute">Paiement en ligne (Orange Money, MTN Mobile Money, carte) : bientôt disponible.</p>
    </div>
  );
}
