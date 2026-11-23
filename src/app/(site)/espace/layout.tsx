import { and, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { conversations, notifications } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { EspaceNav } from "@/components/EspaceNav";
import { logoutAction } from "@/app/actions/auth";

export default async function EspaceLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const db = await getDb();
  const [[n], [m]] = await Promise.all([
    db.select({ c: sql<number>`count(*)::int` }).from(notifications).where(and(eq(notifications.userId, user.id), isNull(notifications.readAt))),
    db.select({ c: sql<number>`count(*)::int` }).from(conversations).where(and(eq(conversations.userId, user.id), eq(conversations.unreadForUser, true))),
  ]);
  return (
    <section className="min-h-[70vh] bg-ivory">
      <div className="container-x grid gap-8 py-8 lg:grid-cols-[240px_1fr] lg:py-12">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="mb-5 hidden lg:block">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Espace apprenant</p>
            <p className="mt-1 font-display text-2xl">{user.firstName} {user.lastName}</p>
          </div>
          <EspaceNav counts={{ notifs: n.c, messages: m.c }} />
          <form action={logoutAction} className="mt-3 lg:hidden">
            <button className="text-xs font-medium text-ink-mute underline">Se déconnecter</button>
          </form>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
