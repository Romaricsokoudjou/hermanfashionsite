import { Suspense } from "react";
import { and, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { notifications } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getCentres, getFormations, getSettings } from "@/lib/data";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { HermanAI } from "@/components/HermanAI";
import { RevealObserver } from "@/components/Reveal";
import { Toast } from "@/components/Toast";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [user, formations, settings, centres] = await Promise.all([getCurrentUser(), getFormations(), getSettings(), getCentres()]);
  let unread = 0;
  if (user) {
    const db = await getDb();
    const [r] = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, user.id), isNull(notifications.readAt)));
    unread = r?.c ?? 0;
  }
  const nav = formations.map((f) => ({ slug: f.slug, title: f.title, tagline: f.tagline, image: f.image }));
  return (
    <>
      <SiteHeader user={user ? { firstName: user.firstName, role: user.role } : null} formations={nav} unread={unread} logo={settings.logo_url} />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} formations={nav} centres={centres} />
      <WhatsAppButton number={settings.whatsapp} />
      <HermanAI loggedIn={!!user} firstName={user?.firstName} />
      <RevealObserver />
      <Suspense>
        <Toast />
      </Suspense>
    </>
  );
}
