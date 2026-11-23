import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import clsx from "clsx";
import { ArrowLeft } from "lucide-react";
import { getDb } from "@/db";
import { conversations, messages, users } from "@/db/schema";
import { adminReplyAction } from "@/app/actions/admin";
import { AdminHeader, Panel } from "@/components/admin-ui";
import { SubmitButton } from "@/components/SubmitButton";
import { dateFr } from "@/lib/format";

export const metadata = { title: "Conversation" };

export default async function AdminConversation({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const db = await getDb();
  const [row] = await db.select({ c: conversations, u: users }).from(conversations).innerJoin(users, eq(conversations.userId, users.id)).where(eq(conversations.id, id)).limit(1);
  if (!row) notFound();
  if (row.c.unreadForAdmin) await db.update(conversations).set({ unreadForAdmin: false }).where(eq(conversations.id, id));
  const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(asc(messages.id));
  const { c, u } = row;
  return (
    <div>
      <Link href="/admin/messages" className="mb-4 inline-flex items-center gap-2 text-sm text-ink-soft hover:text-brand-700"><ArrowLeft className="h-4 w-4" /> Service client</Link>
      <AdminHeader title={c.subject} text={`${u.firstName} ${u.lastName} · ${u.email} · ${u.phone}`}>
        <Link href={`/admin/inscriptions?q=${encodeURIComponent(u.email)}`} className="btn btn-ghost btn-sm">Dossiers de l&apos;apprenant</Link>
      </AdminHeader>
      <Panel>
        <div className="space-y-4 rounded-xl bg-ivory p-4 md:p-6">
          {msgs.map((m) => (
            <div key={m.id} className={clsx("flex", m.senderRole === "admin" && "justify-end")}>
              <div className={clsx("max-w-[85%] rounded-2xl p-4 text-sm", m.senderRole === "admin" ? "rounded-tr-md bg-ink text-white" : "rounded-tl-md bg-white ring-1 ring-line")}>
                <p className={clsx("mb-1 text-xs font-semibold", m.senderRole === "admin" ? "text-white/60" : "text-brand-700")}>{m.senderRole === "admin" ? "Direction" : u.firstName} · {dateFr(m.createdAt, true)}</p>
                <p className="whitespace-pre-line leading-relaxed">{m.body}</p>
              </div>
            </div>
          ))}
        </div>
        <form action={adminReplyAction} className="mt-5 space-y-3">
          <input type="hidden" name="conversationId" value={c.id} />
          <textarea name="body" rows={4} placeholder="Votre réponse…" className="field text-sm" />
          <div className="flex flex-wrap gap-2">
            <SubmitButton pendingText="Envoi…">Envoyer la réponse</SubmitButton>
            {c.status === "ouverte" ? (
              <SubmitButton className="btn-ghost" name="op" value="close">Répondre et clôturer</SubmitButton>
            ) : (
              <SubmitButton className="btn-ghost" name="op" value="reopen">Rouvrir</SubmitButton>
            )}
          </div>
        </form>
      </Panel>
    </div>
  );
}
