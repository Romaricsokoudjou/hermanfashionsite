import "server-only";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import * as s from "@/db/schema";

export type Settings = Record<string, string>;

export async function getSettings(): Promise<Settings> {
  const db = await getDb();
  const rows = await db.select().from(s.settings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function getPlans(activeOnly = true) {
  const db = await getDb();
  const q = db.select().from(s.plans).orderBy(asc(s.plans.sortOrder), asc(s.plans.id));
  const rows = await q;
  return activeOnly ? rows.filter((p) => p.active) : rows;
}

export async function getFormations(publishedOnly = true) {
  const db = await getDb();
  const rows = await db.select().from(s.formations).orderBy(asc(s.formations.sortOrder), asc(s.formations.id));
  return publishedOnly ? rows.filter((f) => f.published) : rows;
}

export async function getFormationPlanMap() {
  const db = await getDb();
  const links = await db.select().from(s.formationPlans);
  const map = new Map<number, number[]>();
  for (const l of links) map.set(l.formationId, [...(map.get(l.formationId) || []), l.planId]);
  return map;
}

export async function getFormationBySlug(slug: string) {
  const db = await getDb();
  const [formation] = await db.select().from(s.formations).where(eq(s.formations.slug, slug)).limit(1);
  if (!formation) return null;
  const links = await db.select().from(s.formationPlans).where(eq(s.formationPlans.formationId, formation.id));
  const allPlans = await getPlans();
  const linkedIds = links.map((l) => l.planId);
  const plans = allPlans.filter((p) => linkedIds.includes(p.id));
  return { formation, plans, allPlans, durationsConfirmed: plans.length > 0 };
}

export async function getCentres(publishedOnly = true) {
  const db = await getDb();
  const rows = await db.select().from(s.centres).orderBy(asc(s.centres.sortOrder), asc(s.centres.id));
  return publishedOnly ? rows.filter((c) => c.published) : rows;
}

export async function getFaqs() {
  const db = await getDb();
  return db.select().from(s.faqs).where(eq(s.faqs.published, true)).orderBy(asc(s.faqs.sortOrder), asc(s.faqs.id));
}

export async function getGallery(type: "image" | "video" = "image") {
  const db = await getDb();
  return db
    .select()
    .from(s.media)
    .where(and(eq(s.media.type, type), eq(s.media.published, true)))
    .orderBy(asc(s.media.sortOrder), desc(s.media.id));
}

export async function getVideosBySlot(slots: string[]) {
  const db = await getDb();
  return db
    .select()
    .from(s.media)
    .where(and(eq(s.media.type, "video"), eq(s.media.published, true), inArray(s.media.slot, slots)))
    .orderBy(asc(s.media.sortOrder));
}

export async function getTestimonials() {
  const db = await getDb();
  return db.select().from(s.testimonials).where(eq(s.testimonials.published, true)).orderBy(asc(s.testimonials.sortOrder), desc(s.testimonials.id));
}

export async function getNews(limit?: number) {
  const db = await getDb();
  const q = db.select().from(s.news).where(eq(s.news.published, true)).orderBy(desc(s.news.publishedAt));
  return limit ? q.limit(limit) : q;
}

export async function getNewsBySlug(slug: string) {
  const db = await getDb();
  const [n] = await db.select().from(s.news).where(and(eq(s.news.slug, slug), eq(s.news.published, true))).limit(1);
  return n ?? null;
}
