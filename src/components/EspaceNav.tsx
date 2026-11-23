"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Bell, CreditCard, GraduationCap, LayoutDashboard, LogOut, MessageSquare, UserRound, Gift } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

const ITEMS = [
  { href: "/espace", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/espace/inscriptions", label: "Mes inscriptions", icon: GraduationCap },
  { href: "/espace/paiements", label: "Mes paiements", icon: CreditCard },
  { href: "/espace/messages", label: "Messagerie", icon: MessageSquare, badge: "messages" },
  { href: "/espace/notifications", label: "Notifications", icon: Bell, badge: "notifs" },
  { href: "/espace/profil", label: "Mon profil", icon: UserRound },
];

export function EspaceNav({ counts }: { counts: { notifs: number; messages: number } }) {
  const p = usePathname();
  return (
    <nav className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
      {ITEMS.map((it) => {
        const active = it.exact ? p === it.href : p.startsWith(it.href);
        const n = it.badge ? counts[it.badge as "notifs" | "messages"] : 0;
        return (
          <Link key={it.href} href={it.href} className={clsx("flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors", active ? "bg-ink text-white" : "bg-white text-ink-soft hover:bg-brand-50 hover:text-brand-700 lg:bg-transparent")}>
            <it.icon className="h-4 w-4" />
            {it.label}
            {n > 0 && <span className="ml-auto rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">{n}</span>}
          </Link>
        );
      })}
      <div className="hidden lg:mt-6 lg:block">
        <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-brand-800"><Gift className="h-4 w-4" /> Parrainage</p>
          <p className="mt-1 text-xs text-ink-soft">Programme de parrainage — Bientôt disponible.</p>
        </div>
        <form action={logoutAction} className="mt-4">
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-ink-mute hover:bg-red-50 hover:text-red-700">
            <LogOut className="h-4 w-4" /> Se déconnecter
          </button>
        </form>
      </div>
    </nav>
  );
}
