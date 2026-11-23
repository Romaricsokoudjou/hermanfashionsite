"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LockKeyhole, X } from "lucide-react";
import { Monogram } from "./Logo";

/** Invitation élégante à se connecter avant une action personnelle. */
export function AuthPrompt({ open, onClose, title, text }: { open: boolean; onClose: () => void; title: string; text: string }) {
  const pathname = usePathname();
  if (!open) return null;
  const next = encodeURIComponent(pathname || "/");
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-night/40 p-4 backdrop-blur-sm sm:items-center" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className="fade-up relative w-full max-w-md overflow-hidden rounded-[1.75rem] bg-white p-8 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-200/60 blur-3xl" />
        <button onClick={onClose} aria-label="Fermer" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-ink-mute hover:bg-sand hover:text-ink">
          <X className="h-4 w-4" />
        </button>
        <div className="relative">
          <div className="flex items-center gap-3">
            <Monogram className="h-11 w-11" />
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <LockKeyhole className="h-4 w-4" />
            </span>
          </div>
          <h2 className="mt-6 font-display text-3xl leading-tight">{title}</h2>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">{text}</p>
          <div className="mt-7 grid gap-3">
            <Link href={`/inscription?next=${next}`} className="btn btn-primary w-full">Créer mon compte gratuitement</Link>
            <Link href={`/connexion?next=${next}`} className="btn btn-ghost w-full">J&apos;ai déjà un compte</Link>
          </div>
          <p className="mt-5 text-center text-xs text-ink-mute">La consultation du site reste libre, sans compte.</p>
        </div>
      </div>
    </div>
  );
}
