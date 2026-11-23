import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { conversations, users } from "@/db/schema";
import { AdminHeader, Panel } from "@/components/admin-ui";
import { dateFr } from "@/lib/format";

export const metadata = { title: "Service client" };

export default async function AdminMessages() {
  const db = await getDb();
  const rows = await db.select({ c: conversations, u: users }).from(conversations).innerJoin(users, eq(conversations.userId, users.id)).orderBy(desc(conversations.unreadForAdmin), desc(conversations.lastMessageAt)).limit(300);
  return (
    <div>
      <AdminHeader title="Service client" text="Messages envoyés par les utilisateurs connectés. Chaque réponse déclenche une notification dans leur espace." />
      <Panel>
        <ul className="divide-y divide-line">
          {rows.length === 0 && <li className="py-6 text-center text-sm text-ink-mute">Aucune conversation.</li>}
          {rows.map(({ c, u }) => (
            <li key={c.id}>
              <Link href={`/admin/messages/${c.id}`} className="flex items-center justify-between gap-4 py-4 hover:bg-ivory">
                <span>
                  <span className="block font-semibold">{c.subject}</span>
                  <span className="text-xs text-ink-mute">{u.firstName} {u.lastName} · {u.phone} · {dateFr(c.lastMessageAt, true)}</span>
                </span>
                <span className="flex gap-2">
                  {c.unreadForAdmin && <span className="rounded-full bg-brand-500 px-2.5 py-1 text-[11px] font-bold text-white">Nouveau</span>}
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${c.status === "fermee" ? "bg-stone-100 text-stone-600" : "bg-emerald-50 text-emerald-700"}`}>{c.status === "fermee" ? "Clôturée" : "Ouverte"}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
