"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ArrowRight, Bell, ChevronDown, Menu, UserRound, X, MapPin } from "lucide-react";
import { Logo } from "./Logo";

type NavFormation = { slug: string; title: string; tagline: string; image: string };
type NavUser = { firstName: string; role: string } | null;

const LINKS = [
  { href: "/etablissement", label: "L'établissement" },
  { href: "/formations", label: "Formations", mega: true },
  { href: "/tarifs", label: "Tarifs & admission" },
  { href: "/centres", label: "Centres" },
  { href: "/galerie", label: "Galerie" },
];
const MORE = [
  { href: "/actualites", label: "Actualités" },
  { href: "/faq", label: "Questions fréquentes" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ user, formations, unread, logo }: { user: NavUser; formations: NavFormation[]; unread: number; logo?: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const [more, setMore] = useState(false);
  const [mobileFormations, setMobileFormations] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
    setMega(false);
    setMore(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const accountHref = user ? (user.role === "admin" ? "/admin" : "/espace") : "/connexion";
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMega(true);
  };
  const closeMega = () => {
    closeTimer.current = setTimeout(() => setMega(false), 140);
  };

  return (
    <>
      <div className="hidden bg-night text-[0.74rem] text-white/70 lg:block">
        <div className="container-x flex h-9 items-center justify-between">
          <p className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-brand-400" /> Deux centres à Douala · Ange Raphaël &amp; Deido
          </p>
          <p className="tracking-wide">
            Centre de formation professionnelle aux métiers de la <span className="text-brand-300">beauté</span> et du <span className="text-brand-300">bien-être</span>
          </p>
        </div>
      </div>

      <header
        className={clsx(
          "sticky top-0 z-50 transition-all duration-500",
          scrolled || open ? "border-b border-line/80 bg-white/90 shadow-[0_8px_30px_-18px_rgba(36,32,29,.25)] backdrop-blur-xl" : "border-b border-transparent bg-white/70 backdrop-blur",
        )}
      >
        <div className="container-x flex h-[4.6rem] items-center justify-between gap-6">
          <Logo src={logo} />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
            {LINKS.map((l) =>
              l.mega ? (
                <div key={l.href} className="relative" onMouseEnter={openMega} onMouseLeave={closeMega}>
                  <Link
                    href={l.href}
                    onFocus={openMega}
                    aria-expanded={mega}
                    className={clsx("flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-[0.88rem] font-medium transition-colors", isActive(l.href) ? "text-brand-700" : "text-ink hover:text-brand-700")}
                  >
                    {l.label}
                    <ChevronDown className={clsx("h-3.5 w-3.5 transition-transform duration-300", mega && "rotate-180")} />
                  </Link>
                </div>
              ) : (
                <Link
                  key={l.href}
                  href={l.href}
                  className={clsx("whitespace-nowrap rounded-full px-3 py-2 text-[0.88rem] font-medium transition-colors", isActive(l.href) ? "text-brand-700" : "text-ink hover:text-brand-700")}
                >
                  {l.label}
                </Link>
              ),
            )}
            <div className="relative" onMouseEnter={() => setMore(true)} onMouseLeave={() => setMore(false)}>
              <button onClick={() => setMore((v) => !v)} aria-expanded={more} className="flex items-center gap-1 rounded-full px-3.5 py-2 text-[0.9rem] font-medium text-ink hover:text-brand-700">
                Plus <ChevronDown className={clsx("h-3.5 w-3.5 transition-transform duration-300", more && "rotate-180")} />
              </button>
              <div className={clsx("absolute right-0 top-full pt-3 transition-all duration-300", more ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0")}>
                <div className="w-56 rounded-2xl border border-line bg-white p-2 shadow-lift">
                  {MORE.map((m) => (
                    <Link key={m.href} href={m.href} className="block rounded-xl px-4 py-2.5 text-sm text-ink-soft hover:bg-brand-50 hover:text-brand-700">
                      {m.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <Link href={accountHref} className="relative hidden items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-ink hover:text-brand-700 md:flex">
              <UserRound className="h-4 w-4" />
              {user ? (user.role === "admin" ? "Administration" : `Mon espace`) : "Connexion"}
              {unread > 0 && (
                <span className="absolute -right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">{unread}</span>
              )}
            </Link>
            <Link href={user ? "/espace/inscriptions/nouvelle" : "/inscription"} className="btn btn-primary btn-sm hidden sm:inline-flex">
              {user ? "S'inscrire à une formation" : "Rejoindre Herman"}
            </Link>
            <button onClick={() => setOpen((v) => !v)} className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white lg:hidden" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Méga-menu formations */}
        <div
          onMouseEnter={openMega}
          onMouseLeave={closeMega}
          className={clsx(
            "absolute inset-x-0 top-full hidden border-t border-line bg-white shadow-lift transition-all duration-500 lg:block",
            mega ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-2 opacity-0",
          )}
        >
          <div className="container-x grid grid-cols-[1fr_300px] gap-10 py-9">
            <div>
              <p className="eyebrow mb-5">Nos 9 spécialités</p>
              <div className="grid grid-cols-3 gap-2">
                {formations.map((f, i) => (
                  <Link key={f.slug} href={`/formations/${f.slug}`} className="group flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-brand-50">
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-sand">
                      {f.image && <Image src={f.image} alt="" fill sizes="48px" className="object-cover transition-transform duration-500 group-hover:scale-110" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.7rem] font-semibold text-brand-600">{String(i + 1).padStart(2, "0")}</span>
                      <span className="block truncate text-sm font-semibold text-ink group-hover:text-brand-700">{f.title}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl bg-night p-7 text-white">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-500/40 blur-3xl" />
              <p className="relative font-display text-3xl leading-tight">3 parcours diplômants</p>
              <p className="relative mt-3 text-sm leading-relaxed text-white/70">3 mois (AQP), 6 mois (CQP) ou 1 an (DQP), avec paiement possible en plusieurs tranches.</p>
              <Link href="/tarifs" className="relative mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-300 hover:text-white">
                Voir les tarifs <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Menu mobile */}
      <div className={clsx("fixed inset-0 z-40 bg-white transition-all duration-500 lg:hidden", open ? "visible opacity-100" : "invisible opacity-0")}>
        <div className="h-full overflow-y-auto pb-10 pt-[5.2rem]">
          <nav className="container-x flex flex-col" aria-label="Navigation mobile">
            <Link href="/" className="border-b border-line py-4 font-display text-2xl">Accueil</Link>
            {LINKS.map((l) =>
              l.mega ? (
                <div key={l.href} className="border-b border-line">
                  <button onClick={() => setMobileFormations((v) => !v)} className="flex w-full items-center justify-between py-4 font-display text-2xl" aria-expanded={mobileFormations}>
                    {l.label}
                    <ChevronDown className={clsx("h-5 w-5 transition-transform duration-300", mobileFormations && "rotate-180")} />
                  </button>
                  <div className={clsx("grid overflow-hidden transition-all duration-500", mobileFormations ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr]")}>
                    <div className="min-h-0">
                      <Link href="/formations" className="block py-2 text-sm font-semibold text-brand-700">Toutes les formations →</Link>
                      {formations.map((f) => (
                        <Link key={f.slug} href={`/formations/${f.slug}`} className="block py-2 text-[0.95rem] text-ink-soft">
                          {f.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link key={l.href} href={l.href} className="border-b border-line py-4 font-display text-2xl">
                  {l.label}
                </Link>
              ),
            )}
            {MORE.map((m) => (
              <Link key={m.href} href={m.href} className="border-b border-line py-4 font-display text-2xl">
                {m.label}
              </Link>
            ))}
            <div className="mt-8 grid gap-3">
              <Link href={user ? "/espace/inscriptions/nouvelle" : "/inscription"} className="btn btn-primary w-full">
                {user ? "S'inscrire à une formation" : "Créer mon compte"}
              </Link>
              <Link href={accountHref} className="btn btn-ghost w-full">
                {unread > 0 ? <Bell className="h-4 w-4 text-brand-600" /> : <UserRound className="h-4 w-4" />}
                {user ? (user.role === "admin" ? "Administration" : `Mon espace · ${user.firstName}`) : "Se connecter"}
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
