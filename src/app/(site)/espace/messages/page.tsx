import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { conversations } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { ContactForm } from "@/components/forms";
import { dateFr } from "@/lib/format";

export const metadata = { title: "Messagerie" };

export default async function Messages() {
  const user = await requireUser();
  const db = await getDb();
  const list = await db.select().from(conversations).where(eq(conversations.userId, user.id)).orderBy(desc(conversations.lastMessageAt));
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <div>
        <h1 className="font-display text-4xl">Messagerie</h1>
        <p className="mt-2 text-sm text-ink-soft">Vos échanges avec le service client de Herman FASHION.</p>
        <ul className="mt-6 space-y-3">
          {list.length === 0 && <li className="card p-6 text-sm text-ink-mute">Aucune conversation pour le moment.</li>}
          {list.map((c) => (
            <li key={c.id}>
              <Link href={`/espace/messages/${c.id}`} className="card flex items-center justify-between gap-4 p-5 hover:shadow-lift">
                <span>
                  <span className="block font-semibold">{c.subject}</span>
                  <span className="text-xs text-ink-mute">{dateFr(c.lastMessageAt, true)} · {c.status === "fermee" ? "Clôturée" : "Ouverte"}</span>
                </span>
                {c.unreadForUser && <span className="rounded-full bg-brand-500 px-2.5 py-1 text-[11px] font-bold text-white">Nouvelle réponse</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="card h-fit p-6 md:p-8">
        <h2 className="font-display text-2xl">Nouveau message</h2>
        <div className="mt-5"><ContactForm /></div>
      </div>
    </div>
  );
}
