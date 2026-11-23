"use server";

import { and, eq, isNull, ne } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import * as s from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { nextReference, notify } from "@/lib/enrollments";
import type { FormState } from "./auth";

export async function createEnrollmentAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const formationId = Number(formData.get("formationId"));
  const planId = Number(formData.get("planId"));
  const centreId = Number(formData.get("centreId")) || null;
  const paymentMode = formData.get("paymentMode") === "unique" ? "unique" : "tranches";
  const message = String(formData.get("message") || "").slice(0, 1000);
  if (!formationId) return { error: "Veuillez choisir une formation." };
  if (!planId) return { error: "Veuillez choisir une durée de formation." };
  if (formData.get("accept") !== "on") return { error: "Veuillez confirmer avoir pris connaissance des modalités de paiement." };

  const db = await getDb();
  const [formation] = await db.select().from(s.formations).where(and(eq(s.formations.id, formationId), eq(s.formations.published, true))).limit(1);
  const [plan] = await db.select().from(s.plans).where(and(eq(s.plans.id, planId), eq(s.plans.active, true))).limit(1);
  if (!formation || !plan) return { error: "Formation ou durée indisponible." };

  const links = await db.select().from(s.formationPlans).where(eq(s.formationPlans.formationId, formationId));
  const confirmed = links.length > 0;
  if (confirmed && !links.some((l) => l.planId === planId)) return { error: "Cette durée n'est pas proposée pour cette formation." };

  const dup = await db
    .select({ id: s.enrollments.id })
    .from(s.enrollments)
    .where(and(eq(s.enrollments.userId, user.id), eq(s.enrollments.formationId, formationId), ne(s.enrollments.status, "annulee")))
    .limit(1);
  if (dup.length) return { error: "Vous avez déjà une demande d'inscription en cours pour cette formation." };

  const reference = await nextReference(db);
  const [enrollment] = await db
    .insert(s.enrollments)
    .values({
      reference,
      userId: user.id,
      formationId,
      planId,
      centreId,
      formationTitle: formation.title,
      planLabel: plan.label,
      diploma: plan.diploma,
      price: plan.price,
      registrationFee: plan.registrationFee,
      totalDue: plan.price + plan.registrationFee,
      installments: plan.installments,
      paymentMode,
      durationConfirmed: confirmed,
      message,
    })
    .returning();

  await notify(
    db,
    user.id,
    `Demande d'inscription reçue — ${reference}`,
    `${formation.title} · ${plan.label}. Présentez-vous à la direction avec votre référence pour effectuer votre règlement en espèces.`,
    `/espace/inscriptions/${enrollment.id}`,
  );
  revalidatePath("/espace");
  redirect(`/espace/inscriptions/${enrollment.id}?nouveau=1`);
}

export async function startConversationAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser("/contact");
  const subject = String(formData.get("subject") || "").trim().slice(0, 140);
  const body = String(formData.get("body") || "").trim().slice(0, 4000);
  if (subject.length < 3) return { error: "Veuillez indiquer l'objet de votre message." };
  if (body.length < 5) return { error: "Votre message est trop court." };
  const db = await getDb();
  const [conv] = await db.insert(s.conversations).values({ userId: user.id, subject }).returning();
  await db.insert(s.messages).values({ conversationId: conv.id, senderRole: "apprenant", senderId: user.id, body });
  redirect(`/espace/messages/${conv.id}?envoye=1`);
}

export async function replyConversationAction(formData: FormData) {
  const user = await requireUser();
  const id = Number(formData.get("conversationId"));
  const body = String(formData.get("body") || "").trim().slice(0, 4000);
  const db = await getDb();
  const [conv] = await db.select().from(s.conversations).where(and(eq(s.conversations.id, id), eq(s.conversations.userId, user.id))).limit(1);
  if (!conv || !body) redirect(`/espace/messages/${id}`);
  await db.insert(s.messages).values({ conversationId: id, senderRole: "apprenant", senderId: user.id, body });
  await db.update(s.conversations).set({ unreadForAdmin: true, status: "ouverte", lastMessageAt: new Date() }).where(eq(s.conversations.id, id));
  revalidatePath(`/espace/messages/${id}`);
}

export async function markAllNotificationsReadAction() {
  const user = await requireUser();
  const db = await getDb();
  await db.update(s.notifications).set({ readAt: new Date() }).where(and(eq(s.notifications.userId, user.id), isNull(s.notifications.readAt)));
  revalidatePath("/espace", "layout");
}
