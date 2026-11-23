"use server";

import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { createSession, destroySession, requireUser } from "@/lib/auth";
import { notify } from "@/lib/enrollments";

export type FormState = { error?: string; fields?: Record<string, string>; ok?: string } | undefined;

function safeNext(next: unknown, fallback = "/espace") {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") ? n : fallback;
}

const registerSchema = z
  .object({
    lastName: z.string().trim().min(2, "Veuillez indiquer votre nom."),
    firstName: z.string().trim().min(2, "Veuillez indiquer votre prénom."),
    phone: z.string().trim().regex(/^\+?[\d\s().-]{8,20}$/, "Numéro de téléphone invalide."),
    email: z.string().trim().toLowerCase().email("Adresse e-mail invalide."),
    country: z.string().trim().min(2, "Veuillez indiquer votre pays."),
    city: z.string().trim().min(2, "Veuillez indiquer votre ville."),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Les mots de passe ne correspondent pas.", path: ["confirm"] });

export async function registerAction(_: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = registerSchema.safeParse(raw);
  const fields = { ...raw, password: "", confirm: "" };
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, fields };
  const d = parsed.data;
  const db = await getDb();
  const exists = await db.select({ id: users.id }).from(users).where(eq(users.email, d.email)).limit(1);
  if (exists.length) return { error: "Un compte existe déjà avec cette adresse e-mail. Connectez-vous.", fields };
  const [user] = await db
    .insert(users)
    .values({
      firstName: d.firstName,
      lastName: d.lastName.toUpperCase(),
      phone: d.phone,
      email: d.email,
      country: d.country,
      city: d.city,
      passwordHash: await bcrypt.hash(d.password, 10),
      referralCode: `HF${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
    })
    .returning();
  await notify(db, user.id, "Bienvenue chez Herman FASHION", "Votre compte est créé. Choisissez votre formation pour soumettre votre demande d'inscription.", "/formations");
  await createSession(user);
  redirect(safeNext(raw.next));
}

export async function loginAction(_: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Veuillez saisir votre e-mail et votre mot de passe.", fields: { email } };
  const db = await getDb();
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "E-mail ou mot de passe incorrect.", fields: { email } };
  }
  await createSession(user);
  const fallback = user.role === "admin" ? "/admin" : "/espace";
  redirect(safeNext(formData.get("next"), fallback));
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

const profileSchema = z.object({
  lastName: z.string().trim().min(2, "Nom invalide."),
  firstName: z.string().trim().min(2, "Prénom invalide."),
  phone: z.string().trim().regex(/^\+?[\d\s().-]{8,20}$/, "Numéro de téléphone invalide."),
  country: z.string().trim().min(2, "Pays invalide."),
  city: z.string().trim().min(2, "Ville invalide."),
});

export async function updateProfileAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const db = await getDb();
  await db.update(users).set({ ...parsed.data, lastName: parsed.data.lastName.toUpperCase() }).where(eq(users.id, user.id));
  return { ok: "Vos informations ont été mises à jour." };
}

export async function changePasswordAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const current = String(formData.get("current") || "");
  const next = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  if (!(await bcrypt.compare(current, user.passwordHash))) return { error: "Mot de passe actuel incorrect." };
  if (next.length < 8) return { error: "Le nouveau mot de passe doit contenir au moins 8 caractères." };
  if (next !== confirm) return { error: "Les mots de passe ne correspondent pas." };
  const db = await getDb();
  await db.update(users).set({ passwordHash: await bcrypt.hash(next, 10) }).where(eq(users.id, user.id));
  return { ok: "Mot de passe modifié." };
}
