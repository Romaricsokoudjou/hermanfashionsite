"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { BookOpen, Building2, ClipboardList, FileText, HelpCircle, Image as ImageIcon, LayoutDashboard, LogOut, Menu, MessageSquare, Newspaper, Quote, Sparkles, Tags, Users, X, ExternalLink } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { Logo } from "./Logo";

const GROUPS = [
  { title: "Pilotage", items: [
    { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
    { href: "/admin/inscriptions", label: "Inscriptions & paiements", icon: ClipboardList, badge: "pending" },
    { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
    { href: "/admin/messages", label: "Service client", icon: MessageSquare, badge: "messages" },
  ] },
  { title: "Catalogue", items: [
    { href: "/admin/formations", label: "Formations", icon: BookOpen },
    { href: "/admin/tarifs", label: "Tarifs & durées", icon: Tags },
    { href: "/admin/centres", label: "Centres", icon: Building2 },
  ] },
  { title: "Contenus", items: [
    { href: "/admin/contenus", label: "Contenus & coordonnées", icon: FileText },
    { href: "/admin/galerie", label: "Photos & vidéos", icon: ImageIcon },
    { href: "/admin/temoignages", label: "Témoignages", icon: Quote },
    { href: "/admin/actualites", label: "Actualités", icon: Newspaper },
    { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
    { href: "/admin/assistant", label: "HERMAN AI", icon: Sparkles },
  ] },
];

export function AdminNav({ counts, name, logo }: { counts: { pending: number; messages: number }; name: string; logo?: string }) {
  const p = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-night px-4 py-3 lg:hidden">
        <Logo light src={logo} />
        <button onClick={() => setOpen((v) => !v)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white" aria-label="Menu">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </div>
      <aside className={clsx("fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-night text-white transition-transform duration-300 lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center justify-between px-6 py-6">
          <Logo light src={logo} />
        </div>
        <p className="mx-6 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/60">Administration · {name}</p>
        <nav className="mt-4 flex-1 space-y-6 overflow-y-auto px-4 pb-6" onClick={() => setOpen(false)}>
          {GROUPS.map((g) => (
            <div key={g.title}>
              <p className="px-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/35">{g.title}</p>
              <div className="mt-2 space-y-0.5">
                {g.items.map((it) => {
                  const active = it.exact ? p === it.href : p.startsWith(it.href);
                  const n = it.badge ? counts[it.badge as "pending" | "messages"] : 0;
                  return (
                    <Link key={it.href} href={it.href} className={clsx("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors", active ? "bg-gradient-to-r from-brand-500 to-brand-700 font-semibold text-white" : "text-white/70 hover:bg-white/5 hover:text-white")}>
                      <it.icon className="h-4 w-4" /> {it.label}
                      {n > 0 && <span className={clsx("ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold", active ? "bg-white text-brand-700" : "bg-brand-500 text-white")}>{n}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/10 p-4">
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"><ExternalLink className="h-4 w-4" /> Voir le site</Link>
          <form action={logoutAction}>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"><LogOut className="h-4 w-4" /> Se déconnecter</button>
          </form>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}
