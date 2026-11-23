import Link from "next/link";
import clsx from "clsx";
import { Check, GraduationCap } from "lucide-react";
import type { Plan } from "@/db/schema";
import { fcfa } from "@/lib/format";

export function PlanCard({ plan, highlight, cta = { href: "/formations", label: "Choisir ma formation" } }: { plan: Plan; highlight?: boolean; cta?: { href: string; label: string } }) {
  return (
    <div className={clsx("reveal relative flex flex-col rounded-[1.75rem] p-8 transition-transform duration-500 hover:-translate-y-1", highlight ? "bg-night text-white shadow-lift" : "border border-line bg-white shadow-soft")}>
      {highlight && <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-500/40 blur-3xl" />}
      <div className="relative flex items-center justify-between">
        <p className={clsx("text-xs font-bold uppercase tracking-[0.2em]", highlight ? "text-brand-300" : "text-brand-700")}>{plan.label}</p>
        <span className={clsx("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold", highlight ? "bg-white/10 text-white" : "bg-brand-50 text-brand-800")}>
          <GraduationCap className="h-3.5 w-3.5" /> {plan.diploma}
        </span>
      </div>
      <p className="relative mt-6 font-display text-[3.1rem] leading-none">
        {plan.price.toLocaleString("fr-FR").replace(/ | /g, " ")}
        <span className={clsx("ml-2 font-sans text-sm font-semibold", highlight ? "text-white/60" : "text-ink-mute")}>FCFA</span>
      </p>
      <p className={clsx("relative mt-2 text-sm", highlight ? "text-white/65" : "text-ink-soft")}>
        + {fcfa(plan.registrationFee)} d&apos;inscription et polo
      </p>
      <div className={clsx("relative my-7 h-px", highlight ? "bg-white/10" : "bg-line")} />
      <p className={clsx("relative text-xs font-bold uppercase tracking-[0.16em]", highlight ? "text-white/50" : "text-ink-mute")}>Paiement échelonné</p>
      <ul className="relative mt-4 space-y-3 text-sm">
        {plan.installments.map((a, i) => (
          <li key={i} className="flex items-center justify-between">
            <span className="flex items-center gap-2.5">
              <span className={clsx("flex h-5 w-5 items-center justify-center rounded-full", highlight ? "bg-brand-500" : "bg-brand-100 text-brand-700")}>
                <Check className="h-3 w-3" />
              </span>
              Tranche {i + 1}
            </span>
            <span className="font-semibold">{fcfa(a)}</span>
          </li>
        ))}
      </ul>
      <p className={clsx("relative mt-5 text-xs", highlight ? "text-white/55" : "text-ink-mute")}>Paiement unique également possible.</p>
      <Link href={cta.href} className={clsx("btn relative mt-8 w-full", highlight ? "btn-primary" : "btn-dark")}>{cta.label}</Link>
    </div>
  );
}
