import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { notifications } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { markAllNotificationsReadAction } from "@/app/actions/learner";
import { dateFr } from "@/lib/format";

export const metadata = { title: "Notifications" };

export default async function Notifications() {
  const user = await requireUser();
  const db = await getDb();
  const list = await db.select().from(notifications).where(eq(notifications.userId, user.id)).orderBy(desc(notifications.createdAt)).limit(100);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl">Notifications</h1>
        {list.some((n) => !n.readAt) && (
          <form action={markAllNotificationsReadAction}><button className="btn btn-ghost btn-sm">Tout marquer comme lu</button></form>
        )}
      </div>
      <ul className="card mt-6 divide-y divide-line">
        {list.length === 0 && <li className="p-6 text-sm text-ink-mute">Aucune notification.</li>}
        {list.map((n) => (
          <li key={n.id} className="flex gap-4 p-5">
            <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${n.readAt ? "bg-line" : "bg-brand-500"}`} />
            <div className="flex-1">
              <p className="font-semibold">{n.title}</p>
              {n.body && <p className="mt-1 text-sm text-ink-soft">{n.body}</p>}
              <p className="mt-1.5 text-xs text-ink-mute">{dateFr(n.createdAt, true)}</p>
            </div>
            {n.link && <Link href={n.link} className="self-center text-sm font-semibold text-brand-700">Voir</Link>}
          </li>
        ))}
      </ul>
    </div>
  );
}
