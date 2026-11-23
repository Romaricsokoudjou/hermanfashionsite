import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Enrollment } from "@/db/schema";
import { StatusBadge } from "./StatusBadge";
import { dateFr, fcfa } from "@/lib/format";

export function Progress({ paid, total }: { paid: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
  return (
    <div>
      <div className="h-2 overflow-hidden rounded-full bg-sand">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-700 transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-xs text-ink-mute">
        <span>{fcfa(paid)} réglés</span>
        <span>{pct} %</span>
      </div>
    </div>
  );
}

export function EnrollmentCard({ e }: { e: Enrollment }) {
  const remaining = Math.max(0, e.totalDue - e.amountPaid);
  return (
    <Link href={`/espace/inscriptions/${e.id}`} className="card group block p-6 transition-shadow hover:shadow-lift">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-ink-mute">{e.reference} · {dateFr(e.createdAt)}</p>
          <h3 className="mt-1 font-display text-2xl">{e.formationTitle}</h3>
          <p className="text-sm text-ink-soft">{e.planLabel}{e.diploma ? ` · ${e.diploma}` : ""}</p>
        </div>
        <StatusBadge status={e.status} />
      </div>
      <div className="mt-5"><Progress paid={e.amountPaid} total={e.totalDue} /></div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span>Reste à régler : <strong>{fcfa(remaining)}</strong></span>
        <span className="flex items-center gap-1 font-semibold text-brand-700">Détails <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
      </div>
    </Link>
  );
}
