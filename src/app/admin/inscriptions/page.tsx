import Link from "next/link";
import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { getDb } from "@/db";
import { enrollments, users } from "@/db/schema";
import { AdminHeader, Panel } from "@/components/admin-ui";
import { StatusBadge } from "@/components/StatusBadge";
import { dateFr, fcfa, STATUS_LABELS } from "@/lib/format";

export const metadata = { title: "Inscriptions" };

export default async function AdminInscriptions({ searchParams }: { searchParams: Promise<{ statut?: string; q?: string }> }) {
  const { statut, q } = await searchParams;
  const db = await getDb();
  const conds: SQL[] = [];
  if (statut && STATUS_LABELS[statut]) conds.push(eq(enrollments.status, statut));
  if (q) {
    const like = `%${q}%`;
    conds.push(or(ilike(enrollments.reference, like), ilike(users.firstName, like), ilike(users.lastName, like), ilike(users.phone, like), ilike(users.email, like), ilike(enrollments.formationTitle, like))!);
  }
  const rows = await db
    .select({ e: enrollments, u: users })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.userId, users.id))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(enrollments.createdAt))
    .limit(300);
  const tabs = [["", "Toutes"], ...Object.entries(STATUS_LABELS)];
  return (
    <div>
      <AdminHeader title="Inscriptions & paiements" text="Recherchez un dossier, enregistrez les paiements en espèces et validez les inscriptions." />
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map(([k, l]) => (
          <Link key={k} href={`/admin/inscriptions${k ? `?statut=${k}` : ""}`} className={`rounded-full px-4 py-2 text-sm font-medium ${(statut || "") === k ? "bg-ink text-white" : "border border-line bg-white text-ink-soft hover:text-brand-700"}`}>{l}</Link>
        ))}
      </div>
      <Panel>
        <form className="mb-5 flex gap-2">
          {statut && <input type="hidden" name="statut" value={statut} />}
          <input name="q" defaultValue={q} placeholder="Référence, nom, téléphone, e-mail, formation…" className="field !min-h-[2.75rem] flex-1 !py-2 text-sm" />
          <button className="btn btn-dark btn-sm">Rechercher</button>
        </form>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-ink-mute">
              <tr><th className="pb-3">Référence</th><th className="pb-3">Apprenant</th><th className="pb-3">Formation</th><th className="pb-3">Réglé / Total</th><th className="pb-3">Statut</th><th className="pb-3"></th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-ink-mute">Aucun dossier trouvé.</td></tr>}
              {rows.map(({ e, u }) => (
                <tr key={e.id} className="hover:bg-ivory">
                  <td className="py-3 font-semibold">{e.reference}<br /><span className="text-xs font-normal text-ink-mute">{dateFr(e.createdAt)}</span></td>
                  <td className="py-3">{u.firstName} {u.lastName}<br /><span className="text-xs text-ink-mute">{u.phone} · {u.city}</span></td>
                  <td className="py-3">{e.formationTitle}<br /><span className="text-xs text-ink-mute">{e.planLabel}{!e.durationConfirmed && " · durée à confirmer"}</span></td>
                  <td className="py-3"><span className="font-semibold">{fcfa(e.amountPaid)}</span><br /><span className="text-xs text-ink-mute">sur {fcfa(e.totalDue)}</span></td>
                  <td className="py-3"><StatusBadge status={e.status} /></td>
                  <td className="py-3 text-right"><Link href={`/admin/inscriptions/${e.id}`} className="btn btn-ghost btn-sm">Gérer</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
