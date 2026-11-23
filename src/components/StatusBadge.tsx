import clsx from "clsx";
import { STATUS_LABELS, STATUS_TONES } from "@/lib/format";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset", STATUS_TONES[status] || STATUS_TONES.en_attente, className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}
