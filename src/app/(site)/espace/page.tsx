import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { ArrowRight, Bell, Banknote, GraduationCap, MapPin, Wallet } from "lucide-react";
import { getDb } from "@/db";
import { enrollments, notifications } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getCentres, getSettings } from "@/lib/data";
import { EnrollmentCard } from "@/components/EnrollmentCard";
import { dateFr, fcfa } from "@/lib/format";

export const metadata = { title: "Mon espace" };

export default async function EspacePage() {
  const user = await requireUser();
  const db = await getDb();
  const [list, notifs, centres, s] = await Promise.all([
    db.select().from(enrollments).where(eq(enrollments.userId, user.id)).orderBy(desc(enrollments.createdAt)),
    db.select().from(notifications).where(eq(notifications.userId, user.id)).orderBy(desc(notifications.createdAt)).limit(5),
    getCentres(),
    getSettings(),
  ]);
  const active = list.filter((e) => e.status !== "annulee");
  const paid = active.reduce((a, e) => a + e.amountPaid, 0);
  const remaining = active.reduce((a, e) => a + Math.max(0, e.totalDue - e.amountPaid), 0);

  return (
    <div className="space-y-8">
      <div className="fade-up relative overflow-hidden rounded-[1.75rem] bg-night p-8 text-white md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand-500/40 blur-3xl" />
        <p className="relative text-sm text-white/60">Bienvenue dans votre espace</p>
        <h1 className="relative mt-1 font-display text-4xl md:text-5xl">Bonjour {user.firstName} ✦</h1>
        <p className="relative mt-3 max-w-xl text-white/70">Suivez votre inscription, vos paiements et vos échanges avec la direction de Herman FASHION.</p>
        <Link href="/espace/inscriptions/nouvelle" className="btn btn-primary relative mt-7">S&apos;inscrire à une formation <ArrowRight className="h-4 w-4" /></Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: GraduationCap, label: "Inscriptions", value: String(active.length) },
          { icon: Banknote, label: "Montant réglé", value: fcfa(paid) },
          { icon: Wallet, label: "Reste à régler", value: fcfa(remaining) },
          { icon: Bell, label: "Non lues", value: String(notifs.filter((n) => !n.readAt).length) },
        ].map((k) => (
          <div key={k.label} className="card p-5">
            <k.icon className="h-5 w-5 text-brand-600" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-mute">{k.label}</p>
            <p className="mt-1 font-display text-3xl">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-3xl">Mes inscriptions</h2>
            {list.length > 0 && <Link href="/espace/inscriptions" className="text-sm font-semibold text-brand-700">Tout voir</Link>}
          </div>
          <div className="mt-4 space-y-4">
            {list.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="font-display text-2xl">Aucune inscription pour le moment</p>
                <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">Choisissez votre formation, sa durée, consultez le récapitulatif et soumettez votre demande en quelques clics.</p>
                <Link href="/espace/inscriptions/nouvelle" className="btn btn-dark mt-6">Choisir ma formation</Link>
              </div>
            ) : (
              list.slice(0, 3).map((e) => <EnrollmentCard key={e.id} e={e} />)
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">Notifications</h2>
              <Link href="/espace/notifications" className="text-sm font-semibold text-brand-700">Tout voir</Link>
            </div>
            <ul className="mt-4 space-y-3">
              {notifs.length === 0 && <li className="text-sm text-ink-mute">Aucune notification.</li>}
              {notifs.map((n) => (
                <li key={n.id} className="flex gap-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.readAt ? "bg-line" : "bg-brand-500"}`} />
                  <div>
                    {n.link ? <Link href={n.link} className="text-sm font-semibold hover:text-brand-700">{n.title}</Link> : <p className="text-sm font-semibold">{n.title}</p>}
                    <p className="text-xs text-ink-mute">{dateFr(n.createdAt, true)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <h2 className="font-display text-2xl">Informations pratiques</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{s.payment_instructions}</p>
            <ul className="mt-4 space-y-3">
              {centres.map((c) => (
                <li key={c.id} className="flex gap-3 text-sm"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /><span><strong>{c.name}</strong><br /><span className="text-ink-soft">{c.address}</span></span></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
