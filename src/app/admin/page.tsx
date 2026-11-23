import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { ArrowRight } from "lucide-react";
import { getDb } from "@/db";
import { conversations, enrollments, payments, users } from "@/db/schema";
import { AdminHeader, Kpi, Panel } from "@/components/admin-ui";
import { StatusBadge } from "@/components/StatusBadge";
import { dateFr, fcfa } from "@/lib/format";

export const metadata = { title: "Tableau de bord" };

export default async function AdminDashboard() {
  const db = await getDb();
  const count = (q: Promise<{ c: number }[]>) => q.then((r) => r[0]?.c ?? 0);
  const [nbUsers, nbEnroll, nbValid, nbPending, nbPayments, total, recent, recentPays, byFormation, unread] = await Promise.all([
    count(db.select({ c: sql<number>`count(*)::int` }).from(users).where(eq(users.role, "apprenant"))),
    count(db.select({ c: sql<number>`count(*)::int` }).from(enrollments).where(sql`${enrollments.status} <> 'annulee'`)),
    count(db.select({ c: sql<number>`count(*)::int` }).from(enrollments).where(eq(enrollments.status, "validee"))),
    count(db.select({ c: sql<number>`count(*)::int` }).from(enrollments).where(eq(enrollments.status, "en_attente"))),
    count(db.select({ c: sql<number>`count(*)::int` }).from(payments)),
    db.select({ t: sql<number>`coalesce(sum(${payments.amount}),0)::bigint` }).from(payments).then((r) => Number(r[0]?.t ?? 0)),
    db.select({ e: enrollments, u: users }).from(enrollments).innerJoin(users, eq(enrollments.userId, users.id)).orderBy(desc(enrollments.createdAt)).limit(8),
    db.select({ p: payments, ref: enrollments.reference, eid: enrollments.id }).from(payments).innerJoin(enrollments, eq(payments.enrollmentId, enrollments.id)).orderBy(desc(payments.createdAt)).limit(6),
    db
      .select({ title: enrollments.formationTitle, c: sql<number>`count(*)::int`, paid: sql<number>`coalesce(sum(${enrollments.amountPaid}),0)::bigint` })
      .from(enrollments)
      .where(sql`${enrollments.status} <> 'annulee'`)
      .groupBy(enrollments.formationTitle)
      .orderBy(desc(sql`count(*)`)),
    count(db.select({ c: sql<number>`count(*)::int` }).from(conversations).where(eq(conversations.unreadForAdmin, true))),
  ]);
  const max = Math.max(1, ...byFormation.map((b) => b.c));

  return (
    <div>
      <AdminHeader title="Tableau de bord" text="Statistiques calculées en temps réel à partir de la base de données.">
        <Link href="/admin/inscriptions?statut=en_attente" className="btn btn-primary btn-sm">Inscriptions en attente ({nbPending})</Link>
      </AdminHeader>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Kpi label="Montant total encaissé" value={fcfa(total)} hint={`${nbPayments} paiement(s) confirmé(s)`} tone="brand" />
        <Kpi label="Utilisateurs inscrits" value={String(nbUsers)} hint="Comptes apprenants" tone="dark" />
        <Kpi label="Demandes d'inscription" value={String(nbEnroll)} hint="Hors annulations" />
        <Kpi label="Apprenants validés" value={String(nbValid)} />
        <Kpi label="Inscriptions en attente" value={String(nbPending)} hint="Aucun paiement enregistré" />
        <Kpi label="Messages non lus" value={String(unread)} hint="Service client" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Dernières demandes d'inscription" actions={<Link href="/admin/inscriptions" className="text-sm font-semibold text-brand-700">Tout voir</Link>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-ink-mute">
                <tr><th className="pb-3">Référence</th><th className="pb-3">Apprenant</th><th className="pb-3">Formation</th><th className="pb-3">Statut</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recent.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-ink-mute">Aucune demande pour le moment.</td></tr>}
                {recent.map(({ e, u }) => (
                  <tr key={e.id}>
                    <td className="py-3"><Link href={`/admin/inscriptions/${e.id}`} className="font-semibold text-brand-700">{e.reference}</Link><br /><span className="text-xs text-ink-mute">{dateFr(e.createdAt)}</span></td>
                    <td className="py-3">{u.firstName} {u.lastName}<br /><span className="text-xs text-ink-mute">{u.phone}</span></td>
                    <td className="py-3">{e.formationTitle}<br /><span className="text-xs text-ink-mute">{e.planLabel}</span></td>
                    <td className="py-3"><StatusBadge status={e.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <div className="space-y-6">
          <Panel title="Inscriptions par formation">
            {byFormation.length === 0 ? <p className="text-sm text-ink-mute">Pas encore de données.</p> : (
              <ul className="space-y-3">
                {byFormation.map((b) => (
                  <li key={b.title}>
                    <div className="flex justify-between text-sm"><span>{b.title}</span><span className="font-semibold">{b.c}</span></div>
                    <div className="mt-1 h-2 rounded-full bg-sand"><div className="h-2 rounded-full bg-gradient-to-r from-brand-400 to-brand-700" style={{ width: `${(b.c / max) * 100}%` }} /></div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title="Derniers paiements enregistrés">
            <ul className="divide-y divide-line text-sm">
              {recentPays.length === 0 && <li className="py-2 text-ink-mute">Aucun paiement enregistré.</li>}
              {recentPays.map(({ p, ref, eid }) => (
                <li key={p.id} className="flex justify-between py-2.5">
                  <Link href={`/admin/inscriptions/${eid}`} className="text-brand-700">{ref}<span className="block text-xs text-ink-mute">{dateFr(p.receivedAt)}</span></Link>
                  <span className="font-semibold">{fcfa(p.amount)}</span>
                </li>
              ))}
            </ul>
            <Link href="/admin/inscriptions" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">Enregistrer un paiement <ArrowRight className="h-4 w-4" /></Link>
          </Panel>
        </div>
      </div>
    </div>
  );
}
