"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

/** Affiche les messages ?ok= / ?error= renvoyés par les actions, puis nettoie l'URL. */
export function Toast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const ok = params.get("ok");
  const error = params.get("error");
  const [msg, setMsg] = useState<{ text: string; kind: "ok" | "error" } | null>(null);

  useEffect(() => {
    if (!ok && !error) return;
    const text = (ok || error)!;
    const kind = ok ? "ok" : "error";
    setTimeout(() => setMsg({ text, kind }), 0);
    setTimeout(() => setMsg((m) => (m?.text === text ? null : m)), text.length > 80 ? 20000 : 5500);
    const next = new URLSearchParams(params.toString());
    next.delete("ok");
    next.delete("error");
    router.replace(`${pathname}${next.toString() ? `?${next}` : ""}`, { scroll: false });
  }, [ok, error, params, pathname, router]);

  if (!msg) return null;
  return (
    <div role="status" className="fade-up fixed left-1/2 top-5 z-[100] flex w-[min(92vw,460px)] -translate-x-1/2 items-start gap-3 rounded-2xl border border-line bg-white/95 p-4 shadow-lift backdrop-blur">
      {msg.kind === "ok" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />}
      <p className="flex-1 text-sm leading-relaxed text-ink">{msg.text}</p>
      <button onClick={() => setMsg(null)} aria-label="Fermer" className="text-ink-mute hover:text-ink">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
