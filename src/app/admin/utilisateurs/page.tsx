import Link from "next/link";
import { desc, ilike, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { enrollments, users } from "@/db/schema";
import { resetPasswordAction, setUserRoleAction } from "@/app/actions/admin";
import { AdminHeader, Panel } from "@/components/admin-ui";
import { SubmitButton } from "@/components/SubmitButton";
import { dateFr } from "@/lib/format";

export const metadata = { title: "Utilisateurs" };

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const db = await getDb();
  const like = `%${q || ""}%`;
  const rows = await db
    .select({ u: users, n: sql<number>`(select count(*)::int from ${enrollments} where ${enrollments.userId} = ${users.id})` })
    .from(users)
    .where(q ? or(ilike(users.firstName, like), ilike(users.lastName, like), ilike(users.email, like), ilike(users.phone, like)) : undefined)
    .orderBy(desc(users.createdAt))
    .limit(500);
  return (
    <div>
      <AdminHeader title="Utilisateurs" text={`${rows.length} compte(s). Les mots de passe sont chiffrés ; en cas d'oubli, générez un mot de passe provisoire.`} />
      <Panel>
        <form className="mb-5 flex gap-2">
          <input name="q" defaultValue={q} placeholder="Nom, e-mail, téléphone…" className="field !min-h-[2.75rem] flex-1 !py-2 text-sm" />
          <button className="btn btn-dark btn-sm">Rechercher</button>
        </form>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-ink-mute">
              <tr><th className="pb-3">Nom</th><th className="pb-3">Contact</th><th className="pb-3">Ville</th><th className="pb-3">Inscriptions</th><th className="pb-3">Créé le</th><th className="pb-3">Rôle</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map(({ u, n }) => (
                <tr key={u.id}>
                  <td className="py-3 font-semibold">{u.firstName} {u.lastName}</td>
                  <td className="py-3">{u.email}<br /><span className="text-xs text-ink-mute">{u.phone}</span></td>
                  <td className="py-3">{u.city}, {u.country}</td>
                  <td className="py-3">{n > 0 ? <Link className="text-brand-700" href={`/admin/inscriptions?q=${encodeURIComponent(u.email)}`}>{n} dossier(s)</Link> : "—"}</td>
                  <td className="py-3">{dateFr(u.createdAt)}</td>
                  <td className="py-3">
                    <form action={setUserRoleAction} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="role" value={u.role === "admin" ? "apprenant" : "admin"} />
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${u.role === "admin" ? "bg-night text-white" : "bg-brand-50 text-brand-800"}`}>{u.role === "admin" ? "Admin" : "Apprenant"}</span>
                      <SubmitButton className="btn-ghost btn-sm !h-8 !px-3 text-xs" confirm={u.role === "admin" ? "Retirer les droits administrateur ?" : "Donner les droits administrateur à ce compte ?"}>
                        {u.role === "admin" ? "Retirer admin" : "Rendre admin"}
                      </SubmitButton>
                    </form>
                    <form action={resetPasswordAction} className="mt-1.5">
                      <input type="hidden" name="userId" value={u.id} />
                      <SubmitButton className="btn-ghost btn-sm !h-7 !px-2.5 text-[11px]" confirm="Générer un mot de passe provisoire pour ce compte ?">Réinitialiser le mot de passe</SubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
