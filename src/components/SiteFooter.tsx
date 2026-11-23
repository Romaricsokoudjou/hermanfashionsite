import Link from "next/link";
import { ArrowUpRight, MapPin, Phone, Mail, Clock } from "lucide-react";
import { Logo } from "./Logo";
import type { Centre } from "@/db/schema";
import type { Settings } from "@/lib/data";
import { mapsDirections, whatsappLink } from "@/lib/format";

function Social({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-all hover:border-brand-400 hover:bg-brand-500 hover:text-white">
      {children}
    </a>
  );
}

export function SiteFooter({ settings, formations, centres }: { settings: Settings; formations: { slug: string; title: string }[]; centres: Centre[] }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-night text-white">
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl" />
      <div className="container-x relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr] lg:py-20">
        <div>
          <Logo light src={settings.logo_url} />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/65">
            Centre de formation professionnelle aux métiers de la beauté et du bien-être, à Douala.
          </p>
          <p className="mt-5 font-display text-xl italic text-brand-300">{settings.slogan || "Transformez votre passion en talent, votre talent en réussite."}</p>
          <div className="mt-6 flex gap-2.5">
            <Social href={settings.facebook} label="Facebook">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z" /></svg>
            </Social>
            <Social href={settings.tiktok} label="TikTok">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.3 7.3 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6z" /></svg>
            </Social>
            <Social href={settings.instagram} label="Instagram">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
            </Social>
            <Social href={whatsappLink(settings.whatsapp)} label="WhatsApp">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" /></svg>
            </Social>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-300">Formations</p>
          <ul className="mt-5 space-y-2.5 text-sm text-white/70">
            {formations.map((f) => (
              <li key={f.slug}>
                <Link href={`/formations/${f.slug}`} className="link-underline hover:text-white">{f.title}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-300">Herman FASHION</p>
          <ul className="mt-5 space-y-2.5 text-sm text-white/70">
            {[
              ["/etablissement", "L'établissement"],
              ["/tarifs", "Tarifs & admission"],
              ["/centres", "Nos centres"],
              ["/galerie", "Galerie"],
              ["/actualites", "Actualités"],
              ["/faq", "Questions fréquentes"],
              ["/contact", "Contact"],
              ["/espace", "Espace apprenant"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="link-underline hover:text-white">{label}</Link>
              </li>
            ))}
          </ul>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1.5 text-[0.7rem] font-semibold text-brand-200">
            Programme de parrainage — Bientôt disponible
          </span>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-300">Nous trouver</p>
          <ul className="mt-5 space-y-5 text-sm text-white/70">
            {centres.map((c) => (
              <li key={c.id}>
                <a href={mapsDirections(c.mapQuery || `${c.address} ${c.city}`)} target="_blank" rel="noopener noreferrer" className="group flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                  <span>
                    <span className="flex items-center gap-1 font-semibold text-white">
                      {c.name} <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </span>
                    {c.address}, {c.city}
                  </span>
                </a>
              </li>
            ))}
            {settings.phone && (
              <li className="flex gap-3">
                <Phone className="h-4 w-4 text-brand-400" /> <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-white">{settings.phone}</a>
              </li>
            )}
            {settings.email && (
              <li className="flex gap-3">
                <Mail className="h-4 w-4 text-brand-400" /> <a href={`mailto:${settings.email}`} className="hover:text-white">{settings.email}</a>
              </li>
            )}
            {settings.hours && (
              <li className="flex gap-3">
                <Clock className="h-4 w-4 text-brand-400" /> {settings.hours}
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-white/45 md:flex-row md:items-center md:justify-between">
          <p>© {year} {settings.legal_name || "CFP HERMAN FASHION"} · Douala, Cameroun. Tous droits réservés.</p>
          <p>Paiements en espèces auprès de la direction · Mobile Money bientôt disponible</p>
        </div>
      </div>
    </footer>
  );
}
