import { NextResponse } from "next/server";
import { and, asc, eq, gte, sql } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";
import { getDb } from "@/db";
import * as s from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { buildKnowledge, fallbackAnswer, systemPrompt } from "@/lib/assistant";

export const dynamic = "force-dynamic";

const HOURLY_LIMIT = Number(process.env.ASSISTANT_HOURLY_LIMIT || 40);

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const db = await getDb();
  const rows = await db
    .select({ role: s.aiMessages.role, content: s.aiMessages.content })
    .from(s.aiMessages)
    .where(eq(s.aiMessages.userId, user.id))
    .orderBy(asc(s.aiMessages.id));
  return NextResponse.json({ messages: rows.slice(-40), firstName: user.firstName });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const db = await getDb();
  await db.delete(s.aiMessages).where(eq(s.aiMessages.userId, user.id));
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const question = String(body?.message || "").trim().slice(0, 1500);
  if (!question) return NextResponse.json({ error: "Message vide." }, { status: 400 });

  const db = await getDb();
  const since = new Date(Date.now() - 3600_000);
  const [{ c }] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(s.aiMessages)
    .where(and(eq(s.aiMessages.userId, user.id), eq(s.aiMessages.role, "user"), gte(s.aiMessages.createdAt, since)));
  if (c >= HOURLY_LIMIT) {
    return NextResponse.json({ error: "Vous avez atteint la limite de questions pour cette heure. Réessayez un peu plus tard ou écrivez au service client." }, { status: 429 });
  }

  const history = await db
    .select({ role: s.aiMessages.role, content: s.aiMessages.content })
    .from(s.aiMessages)
    .where(eq(s.aiMessages.userId, user.id))
    .orderBy(asc(s.aiMessages.id));
  await db.insert(s.aiMessages).values({ userId: user.id, role: "user", content: question });

  const knowledge = await buildKnowledge();
  let answer = "";
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const recent = history.slice(-12).map((m) => ({ role: m.role === "assistant" ? ("assistant" as const) : ("user" as const), content: m.content }));
      // l'historique doit commencer par un message utilisateur
      while (recent.length && recent[0].role !== "user") recent.shift();
      const res = await client.messages.create({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
        max_tokens: 900,
        system: systemPrompt(knowledge.text, user.firstName),
        messages: [...recent, { role: "user", content: question }],
      });
      answer = res.content
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("")
        .trim();
    } catch (err) {
      console.error("[HERMAN AI]", err);
    }
  }
  if (!answer) answer = fallbackAnswer(question, knowledge);

  await db.insert(s.aiMessages).values({ userId: user.id, role: "assistant", content: answer });
  return NextResponse.json({ answer });
}
