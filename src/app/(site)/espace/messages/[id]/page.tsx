import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import clsx from "clsx";
import { ArrowLeft } from "lucide-react";
import { getDb } from "@/db";
import { conversations, messages } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { replyConversationAction } from "@/app/actions/learner";
import { SubmitButton } from "@/components/SubmitButton";
import { dateFr } from "@/lib/format";

export const metadata = { title: "Conversation" };

export default async function Conversation({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const id = Number((await params).id);
  const db = await getDb();
  const [c] = await db.select().from(conversations).where(and(eq(conversations.id, id), eq(conversations.userId, user.id))).limit(1);
  if (!c) notFound();
  if (c.unreadForUser) await db.update(conversations).set({ unreadForUser: false }).where(eq(conversations.id, id));
  const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(asc(messages.id));
  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="border-b border-line p-5">
        <Link href="/espace/messages" className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-brand-700"><ArrowLeft className="h-4 w-4" /> Messagerie</Link>
        <h1 className="mt-2 font-display text-3xl">{c.subject}</h1>
      </div>
      <div className="space-y-4 bg-ivory p-5 md:p-8">
        {msgs.map((m) => (
          <div key={m.id} className={clsx("flex", m.senderRole === "apprenant" && "justify-end")}>
            <div className={clsx("max-w-[85%] rounded-2xl p-4 text-[0.95rem]", m.senderRole === "apprenant" ? "rounded-tr-md bg-ink text-white" : "rounded-tl-md bg-white ring-1 ring-line")}>
              <p className={clsx("mb-1 text-xs font-semibold", m.senderRole === "apprenant" ? "text-white/60" : "text-brand-700")}>{m.senderRole === "apprenant" ? "Vous" : "Direction Herman FASHION"} · {dateFr(m.createdAt, true)}</p>
              <p className="whitespace-pre-line leading-relaxed">{m.body}</p>
            </div>
          </div>
        ))}
      </div>
      <form action={replyConversationAction} className="flex flex-col gap-3 border-t border-line p-5 sm:flex-row sm:items-end">
        <input type="hidden" name="conversationId" value={c.id} />
        <textarea name="body" required rows={2} placeholder="Votre réponse…" className="field !min-h-[3.2rem] flex-1" />
        <SubmitButton className="btn-primary" pendingText="Envoi…">Envoyer</SubmitButton>
      </form>
    </div>
  );
}
