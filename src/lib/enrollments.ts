import "server-only";
import { eq, sql } from "drizzle-orm";
import type { DB } from "@/db";
import * as s from "@/db/schema";
import { fcfa, STATUS_LABELS } from "./format";

export function computeStatus(e: { cancelled: boolean; validated: boolean; amountPaid: number; totalDue: number }) {
  if (e.cancelled) return "annulee";
  if (e.validated) return "validee";
  if (e.amountPaid <= 0) return "en_attente";
  if (e.amountPaid < e.totalDue) return "paiement_partiel";
  return "paiement_confirme";
}

/** Recalcule le montant réglé et le statut à partir des paiements enregistrés par l'administration. */
export async function recomputeEnrollment(db: DB, enrollmentId: number) {
  const [e] = await db.select().from(s.enrollments).where(eq(s.enrollments.id, enrollmentId)).limit(1);
  if (!e) return null;
  const [{ total }] = await db
    .select({ total: sql<number>`coalesce(sum(${s.payments.amount}), 0)::int` })
    .from(s.payments)
    .where(eq(s.payments.enrollmentId, enrollmentId));
  const status = computeStatus({ ...e, amountPaid: total });
  const [updated] = await db
    .update(s.enrollments)
    .set({ amountPaid: total, status, updatedAt: new Date() })
    .where(eq(s.enrollments.id, enrollmentId))
    .returning();
  return { before: e, after: updated };
}

export async function notify(db: DB, userId: number, title: string, body = "", link = "") {
  await db.insert(s.notifications).values({ userId, title, body, link });
}

export async function nextReference(db: DB) {
  const year = new Date().getFullYear();
  const [{ c }] = await db.select({ c: sql<number>`count(*)::int` }).from(s.enrollments);
  for (let i = 1; i < 50; i++) {
    const ref = `HF-${year}-${String(c + i).padStart(4, "0")}`;
    const exists = await db.select({ id: s.enrollments.id }).from(s.enrollments).where(eq(s.enrollments.reference, ref)).limit(1);
    if (exists.length === 0) return ref;
  }
  return `HF-${year}-${Date.now().toString().slice(-6)}`;
}

export function statusNotification(status: string, ref: string, remaining: number) {
  const label = STATUS_LABELS[status] || status;
  const extra = remaining > 0 ? ` Reste à régler : ${fcfa(remaining)}.` : "";
  return { title: `${ref} — ${label}`, body: `Le statut de votre inscription a été mis à jour.${extra}` };
}

/** Échéancier : frais d'inscription puis tranches de la formation (ou paiement unique). */
export function schedule(e: { registrationFee: number; price: number; installments: number[]; paymentMode: string }) {
  const rows: { label: string; amount: number }[] = [{ label: "Frais d'inscription et polo", amount: e.registrationFee }];
  if (e.paymentMode === "unique" || !e.installments?.length) {
    rows.push({ label: "Formation — paiement unique", amount: e.price });
  } else {
    e.installments.forEach((a, i) => rows.push({ label: `Formation — tranche ${i + 1}`, amount: a }));
  }
  let cumul = 0;
  return rows.map((r) => ({ ...r, cumul: (cumul += r.amount) }));
}
