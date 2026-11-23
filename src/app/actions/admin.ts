"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import * as s from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { computeStatus, notify, recomputeEnrollment, statusNotification } from "@/lib/enrollments";
import { fcfa, slugify } from "@/lib/format";
import { saveUpload } from "@/lib/storage";

/* ---------------------------------------------------------------- helpers */
function str(fd: FormData, k: string, max = 20000) {
  return String(fd.get(k) ?? "").trim().slice(0, max);
}
function int(fd: FormData, k: string) {
  const n = Number(String(fd.get(k) ?? "").replace(/[^\d-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}
function bool(fd: FormData, k: string) {
  return fd.get(k) === "on" || fd.get(k) === "true";
}
function back(fd: FormData, fallback: string) {
  const b = String(fd.get("_back") || "");
  return b.startsWith("/admin") ? b : fallback;
}
function done(path: string, msg: string, kind: "ok" | "error" = "ok"): never {
  revalidatePath("/", "layout");
  const sep = path.includes("?") ? "&" : "?";
  redirect(`${path}${sep}${kind}=${encodeURIComponent(msg)}`);
}
async function imageFrom(fd: FormData, field = "image") {
  const file = fd.get(`${field}File`);
  if (file instanceof File && file.size > 0) return saveUpload(file);
  return str(fd, field, 1000);
}

/* ---------------------------------------------------------------- inscriptions & paiements */
export async function recordPaymentAction(fd: FormData) {
  const admin = await requireAdmin();
  const enrollmentId = int(fd, "enrollmentId");
  const amount = int(fd, "amount");
  const path = `/admin/inscriptions/${enrollmentId}`;
  if (amount <= 0) done(path, "Montant invalide.", "error");
  const db = await getDb();
  const [e] = await db.select().from(s.enrollments).where(eq(s.enrollments.id, enrollmentId)).limit(1);
  if (!e) done("/admin/inscriptions", "Inscription introuvable.", "error");
  if (e.cancelled) done(path, "Cette inscription est annulée.", "error");
  const receivedAt = str(fd, "receivedAt") ? new Date(str(fd, "receivedAt")) : new Date();
  await db.insert(s.payments).values({
    enrollmentId,
    amount,
    method: str(fd, "method") || "especes",
    label: str(fd, "label", 200),
    reference: str(fd, "reference", 120),
    note: str(fd, "note", 1000),
    receivedAt,
    recordedById: admin.id,
  });
  const r = await recomputeEnrollment(db, enrollmentId);
  if (r) {
    const remaining = Math.max(0, r.after.totalDue - r.after.amountPaid);
    await notify(
      db,
      e.userId,
      `Paiement enregistré — ${fcfa(amount)}`,
      `Votre paiement en espèces pour ${e.reference} a été confirmé par la direction.${remaining > 0 ? ` Reste à régler : ${fcfa(remaining)}.` : " Votre formation est entièrement réglée."}`,
      `/espace/inscriptions/${enrollmentId}`,
    );
  }
  done(path, `Paiement de ${fcfa(amount)} enregistré.`);
}

export async function deletePaymentAction(fd: FormData) {
  await requireAdmin();
  const id = int(fd, "paymentId");
  const db = await getDb();
  const [p] = await db.delete(s.payments).where(eq(s.payments.id, id)).returning();
  if (p) await recomputeEnrollment(db, p.enrollmentId);
  done(`/admin/inscriptions/${p?.enrollmentId ?? ""}`, "Paiement supprimé et montants recalculés.");
}

export async function setEnrollmentStateAction(fd: FormData) {
  await requireAdmin();
  const id = int(fd, "enrollmentId");
  const op = str(fd, "op");
  const db = await getDb();
  const [e] = await db.select().from(s.enrollments).where(eq(s.enrollments.id, id)).limit(1);
  if (!e) done("/admin/inscriptions", "Inscription introuvable.", "error");
  const patch: Partial<s.Enrollment> = {};
  if (op === "validate") Object.assign(patch, { validated: true, validatedAt: new Date(), cancelled: false });
  if (op === "unvalidate") Object.assign(patch, { validated: false, validatedAt: null });
  if (op === "cancel") Object.assign(patch, { cancelled: true, validated: false });
  if (op === "restore") Object.assign(patch, { cancelled: false });
  const next = { ...e, ...patch };
  const status = computeStatus(next);
  await db.update(s.enrollments).set({ ...patch, status, updatedAt: new Date() }).where(eq(s.enrollments.id, id));
  const n = statusNotification(status, e.reference, Math.max(0, e.totalDue - e.amountPaid));
  await notify(db, e.userId, n.title, n.body, `/espace/inscriptions/${id}`);
  done(`/admin/inscriptions/${id}`, "Statut mis à jour.");
}

export async function saveEnrollmentNoteAction(fd: FormData) {
  await requireAdmin();
  const id = int(fd, "enrollmentId");
  const db = await getDb();
  const patch: Partial<s.Enrollment> = { adminNote: str(fd, "adminNote", 4000), updatedAt: new Date() };
  const centreId = int(fd, "centreId");
  patch.centreId = centreId || null;
  if (fd.has("durationConfirmed")) patch.durationConfirmed = fd.getAll("durationConfirmed").includes("on");
  await db.update(s.enrollments).set(patch).where(eq(s.enrollments.id, id));
  done(`/admin/inscriptions/${id}`, "Dossier mis à jour.");
}

/* ---------------------------------------------------------------- utilisateurs */
export async function setUserRoleAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = int(fd, "userId");
  const role = str(fd, "role") === "admin" ? "admin" : "apprenant";
  if (id === admin.id && role !== "admin") done("/admin/utilisateurs", "Vous ne pouvez pas retirer vos propres droits.", "error");
  const db = await getDb();
  await db.update(s.users).set({ role }).where(eq(s.users.id, id));
  done(back(fd, "/admin/utilisateurs"), "Rôle mis à jour.");
}

/* ---------------------------------------------------------------- formations & tarifs */
export async function saveFormationAction(fd: FormData) {
  await requireAdmin();
  const id = int(fd, "id");
  const title = str(fd, "title", 140);
  if (title.length < 2) done(back(fd, "/admin/formations"), "Le titre est obligatoire.", "error");
  const db = await getDb();
  const slug = slugify(str(fd, "slug") || title);
  const values = {
    title,
    slug,
    tagline: str(fd, "tagline", 200),
    presentation: str(fd, "presentation"),
    objectives: str(fd, "objectives"),
    skills: str(fd, "skills"),
    content: str(fd, "content"),
    outcomes: str(fd, "outcomes"),
    admission: str(fd, "admission"),
    image: await imageFrom(fd),
    sortOrder: int(fd, "sortOrder"),
    published: bool(fd, "published"),
    featured: bool(fd, "featured"),
    updatedAt: new Date(),
  };
  const clash = await db.select({ id: s.formations.id }).from(s.formations).where(eq(s.formations.slug, slug)).limit(1);
  if (clash.length && clash[0].id !== id) done(back(fd, "/admin/formations"), "Une autre formation utilise déjà cette adresse (slug).", "error");
  let formationId = id;
  if (id) await db.update(s.formations).set(values).where(eq(s.formations.id, id));
  else formationId = (await db.insert(s.formations).values(values).returning())[0].id;
  const planIds = fd.getAll("planIds").map(Number).filter(Boolean);
  await db.delete(s.formationPlans).where(eq(s.formationPlans.formationId, formationId));
  if (planIds.length) await db.insert(s.formationPlans).values(planIds.map((planId) => ({ formationId, planId })));
  done(`/admin/formations/${formationId}`, "Formation enregistrée.");
}

export async function deleteFormationAction(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  await db.delete(s.formations).where(eq(s.formations.id, int(fd, "id")));
  done("/admin/formations", "Formation supprimée.");
}

export async function savePlanAction(fd: FormData) {
  await requireAdmin();
  const id = int(fd, "id");
  const db = await getDb();
  const installments = str(fd, "installments")
    .split(/[+,;]/)
    .map((x) => Number(x.replace(/[^\d]/g, "")))
    .filter((x) => x > 0);
  const price = int(fd, "price");
  const sum = installments.reduce((a, b) => a + b, 0);
  if (installments.length && sum !== price) done("/admin/tarifs", `La somme des tranches (${fcfa(sum)}) doit être égale au prix de la formation (${fcfa(price)}).`, "error");
  const label = str(fd, "label", 120);
  const values = {
    label,
    code: slugify(str(fd, "code") || label),
    durationMonths: int(fd, "durationMonths"),
    price,
    registrationFee: int(fd, "registrationFee"),
    diploma: str(fd, "diploma", 60),
    installments,
    description: str(fd, "description", 2000),
    sortOrder: int(fd, "sortOrder"),
    active: bool(fd, "active"),
  };
  if (!label || price <= 0) done("/admin/tarifs", "Libellé et prix obligatoires.", "error");
  if (id) await db.update(s.plans).set(values).where(eq(s.plans.id, id));
  else await db.insert(s.plans).values(values);
  done("/admin/tarifs", "Grille tarifaire enregistrée. Les inscriptions existantes conservent leur tarif d'origine.");
}

/* ---------------------------------------------------------------- centres */
export async function saveCentreAction(fd: FormData) {
  await requireAdmin();
  const id = int(fd, "id");
  const name = str(fd, "name", 140);
  if (!name) done("/admin/centres", "Le nom est obligatoire.", "error");
  const db = await getDb();
  const values = {
    name,
    slug: slugify(str(fd, "slug") || name),
    address: str(fd, "address", 300),
    city: str(fd, "city", 120),
    description: str(fd, "description", 3000),
    mapQuery: str(fd, "mapQuery", 300),
    image: await imageFrom(fd),
    phone: str(fd, "phone", 60),
    hours: str(fd, "hours", 200),
    sortOrder: int(fd, "sortOrder"),
    published: bool(fd, "published"),
  };
  if (id) await db.update(s.centres).set(values).where(eq(s.centres.id, id));
  else await db.insert(s.centres).values(values);
  done("/admin/centres", "Centre enregistré.");
}

export async function deleteCentreAction(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  await db.delete(s.centres).where(eq(s.centres.id, int(fd, "id")));
  done("/admin/centres", "Centre supprimé.");
}

/* ---------------------------------------------------------------- médias */
export async function uploadMediaAction(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const category = str(fd, "category", 80) || "Formations";
  const title = str(fd, "title", 200);
  if (!files.length) done("/admin/galerie", "Sélectionnez au moins un fichier.", "error");
  try {
    for (const file of files) {
      const url = await saveUpload(file);
      const type = file.type.startsWith("video/") ? "video" : "image";
      await db.insert(s.media).values({ type, url, title, category, slot: type === "video" ? str(fd, "slot") || "immersion" : "" });
    }
  } catch (e) {
    done("/admin/galerie", (e as Error).message, "error");
  }
  done("/admin/galerie", `${files.length} média(s) ajouté(s).`);
}

export async function addVideoLinkAction(fd: FormData) {
  await requireAdmin();
  const url = str(fd, "url", 1000);
  if (!/^https?:\/\//.test(url)) done("/admin/galerie", "Lien vidéo invalide.", "error");
  const db = await getDb();
  await db.insert(s.media).values({ type: "video", url, title: str(fd, "title", 200), slot: str(fd, "slot") || "immersion", category: "Vidéos" });
  done("/admin/galerie", "Vidéo ajoutée.");
}

export async function updateMediaAction(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  const id = int(fd, "id");
  if (str(fd, "op") === "delete") {
    await db.delete(s.media).where(eq(s.media.id, id));
    done("/admin/galerie", "Média supprimé.");
  }
  await db
    .update(s.media)
    .set({ title: str(fd, "title", 200), category: str(fd, "category", 80), slot: str(fd, "slot", 40), sortOrder: int(fd, "sortOrder"), published: bool(fd, "published") })
    .where(eq(s.media.id, id));
  done("/admin/galerie", "Média mis à jour.");
}

/* ---------------------------------------------------------------- contenus simples */
export async function saveTestimonialAction(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  const id = int(fd, "id");
  if (str(fd, "op") === "delete") {
    await db.delete(s.testimonials).where(eq(s.testimonials.id, id));
    done("/admin/temoignages", "Témoignage supprimé.");
  }
  const values = { name: str(fd, "name", 120), role: str(fd, "role", 160), quote: str(fd, "quote", 3000), photo: await imageFrom(fd, "photo"), sortOrder: int(fd, "sortOrder"), published: bool(fd, "published") };
  if (!values.name || !values.quote) done("/admin/temoignages", "Nom et témoignage obligatoires.", "error");
  if (id) await db.update(s.testimonials).set(values).where(eq(s.testimonials.id, id));
  else await db.insert(s.testimonials).values(values);
  done("/admin/temoignages", "Témoignage enregistré.");
}

export async function saveNewsAction(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  const id = int(fd, "id");
  if (str(fd, "op") === "delete") {
    await db.delete(s.news).where(eq(s.news.id, id));
    done("/admin/actualites", "Actualité supprimée.");
  }
  const title = str(fd, "title", 200);
  if (!title) done("/admin/actualites", "Le titre est obligatoire.", "error");
  let slug = slugify(str(fd, "slug") || title);
  const clash = await db.select({ id: s.news.id }).from(s.news).where(eq(s.news.slug, slug)).limit(1);
  if (clash.length && clash[0].id !== id) slug = `${slug}-${Date.now().toString().slice(-4)}`;
  const values = {
    title,
    slug,
    excerpt: str(fd, "excerpt", 500),
    body: str(fd, "body"),
    image: await imageFrom(fd),
    published: bool(fd, "published"),
    publishedAt: str(fd, "publishedAt") ? new Date(str(fd, "publishedAt")) : new Date(),
  };
  if (id) await db.update(s.news).set(values).where(eq(s.news.id, id));
  else await db.insert(s.news).values(values);
  done("/admin/actualites", "Actualité enregistrée.");
}

export async function saveFaqAction(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  const id = int(fd, "id");
  if (str(fd, "op") === "delete") {
    await db.delete(s.faqs).where(eq(s.faqs.id, id));
    done("/admin/faq", "Question supprimée.");
  }
  const values = { question: str(fd, "question", 300), answer: str(fd, "answer", 5000), category: str(fd, "category", 80) || "Général", sortOrder: int(fd, "sortOrder"), published: bool(fd, "published") };
  if (!values.question || !values.answer) done("/admin/faq", "Question et réponse obligatoires.", "error");
  if (id) await db.update(s.faqs).set(values).where(eq(s.faqs.id, id));
  else await db.insert(s.faqs).values(values);
  done("/admin/faq", "Question enregistrée.");
}

export async function saveKnowledgeAction(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  const id = int(fd, "id");
  if (str(fd, "op") === "delete") {
    await db.delete(s.knowledgeEntries).where(eq(s.knowledgeEntries.id, id));
    done("/admin/assistant", "Fiche supprimée.");
  }
  const values = { title: str(fd, "title", 200), content: str(fd, "content", 8000), sortOrder: int(fd, "sortOrder"), active: bool(fd, "active"), updatedAt: new Date() };
  if (!values.title || !values.content) done("/admin/assistant", "Titre et contenu obligatoires.", "error");
  if (id) await db.update(s.knowledgeEntries).set(values).where(eq(s.knowledgeEntries.id, id));
  else await db.insert(s.knowledgeEntries).values(values);
  done("/admin/assistant", "Base de connaissances mise à jour.");
}

/* ---------------------------------------------------------------- messagerie */
export async function adminReplyAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = int(fd, "conversationId");
  const body = str(fd, "body", 4000);
  const db = await getDb();
  const [conv] = await db.select().from(s.conversations).where(eq(s.conversations.id, id)).limit(1);
  if (!conv) done("/admin/messages", "Conversation introuvable.", "error");
  if (body) {
    await db.insert(s.messages).values({ conversationId: id, senderRole: "admin", senderId: admin.id, body });
    await db.update(s.conversations).set({ unreadForUser: true, unreadForAdmin: false, lastMessageAt: new Date() }).where(eq(s.conversations.id, id));
    await notify(db, conv.userId, "Nouvelle réponse du service client", `Objet : ${conv.subject}`, `/espace/messages/${id}`);
  }
  if (str(fd, "op") === "close") await db.update(s.conversations).set({ status: "fermee", unreadForAdmin: false }).where(eq(s.conversations.id, id));
  if (str(fd, "op") === "reopen") await db.update(s.conversations).set({ status: "ouverte" }).where(eq(s.conversations.id, id));
  done(`/admin/messages/${id}`, body ? "Réponse envoyée." : "Conversation mise à jour.");
}

/* ---------------------------------------------------------------- paramètres */
export async function saveSettingsAction(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  const logo = fd.get("logo_urlFile");
  if (logo instanceof File && logo.size > 0) {
    try {
      fd.set("logo_url", await saveUpload(logo));
    } catch (e) {
      done("/admin/contenus", (e as Error).message, "error");
    }
  }
  for (const [key, value] of fd.entries()) {
    if (key.startsWith("$") || key.startsWith("_") || typeof value !== "string") continue;
    await db
      .insert(s.settings)
      .values({ key, value: value.trim() })
      .onConflictDoUpdate({ target: s.settings.key, set: { value: value.trim() } });
  }
  done(back(fd, "/admin/contenus"), "Contenus enregistrés.");
}

export async function resetPasswordAction(fd: FormData) {
  await requireAdmin();
  const id = int(fd, "userId");
  const bcrypt = (await import("bcryptjs")).default;
  const crypto = await import("node:crypto");
  const temp = `HF-${crypto.randomBytes(4).toString("hex")}`;
  const db = await getDb();
  await db.update(s.users).set({ passwordHash: await bcrypt.hash(temp, 10) }).where(eq(s.users.id, id));
  done("/admin/utilisateurs", `Mot de passe provisoire : ${temp} — communiquez-le à l'utilisateur, qui pourra le modifier dans son profil.`);
}
