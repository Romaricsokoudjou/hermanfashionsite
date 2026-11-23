import { Suspense } from "react";
import type { Metadata } from "next";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { conversations, enrollments } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { AdminNav } from "@/components/AdminNav";
import { Toast } from "@/components/Toast";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { default: "Administration", template: "%s · Administration HERMAN FASHION" }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const db = await getDb();
  const settings = await getSettings();
  const [[p], [m]] = await Promise.all([
    db.select({ c: sql<number>`count(*)::int` }).from(enrollments).where(eq(enrollments.status, "en_attente")),
    db.select({ c: sql<number>`count(*)::int` }).from(conversations).where(eq(conversations.unreadForAdmin, true)),
  ]);
  return (
    <div className="min-h-screen bg-ivory">
      <AdminNav counts={{ pending: p.c, messages: m.c }} name={`${admin.firstName} ${admin.lastName}`} logo={settings.logo_url} />
      <main className="px-4 py-8 md:px-8 lg:ml-72 lg:px-12 lg:py-10">{children}</main>
      <Suspense><Toast /></Suspense>
    </div>
  );
}
