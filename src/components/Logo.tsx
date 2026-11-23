import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";

export const LOGO_FULL = "/images/logo-herman-fashion.webp";
export const LOGO_EMBLEM = "/images/logo-embleme.webp";

/** Emblème officiel (CFPHF) — utilisé seul dans les petits formats. */
export function Monogram({ className, src }: { className?: string; src?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={clsx("object-contain", className)} />;
  }
  return <Image src={LOGO_EMBLEM} alt="" width={400} height={375} className={clsx("object-contain", className)} />;
}

/** Logo complet (emblème + HERMAN FASHION), pour les grands formats. */
export function FullLogo({ className, priority }: { className?: string; priority?: boolean }) {
  return <Image src={LOGO_FULL} alt="CFP HERMAN FASHION — Centre de formation professionnelle" width={900} height={1043} priority={priority} className={clsx("h-auto object-contain", className)} />;
}

export function Logo({ light = false, className, src }: { light?: boolean; className?: string; src?: string }) {
  return (
    <Link href="/" className={clsx("group inline-flex items-center gap-3", className)} aria-label="HERMAN FASHION — Accueil">
      <span className={clsx("flex shrink-0 items-center justify-center transition-transform duration-500 group-hover:scale-105", light ? "h-14 w-14 rounded-full bg-white p-1.5 shadow-lg" : "h-14 w-14")}>
        <Monogram src={src} className="h-full w-full" />
      </span>
      <span className="flex flex-col leading-none">
        <span className={clsx("font-display text-[1.45rem] font-semibold tracking-[0.14em]", light ? "text-white" : "text-ink")}>HERMAN</span>
        <span className={clsx("mt-1 text-[0.58rem] font-bold uppercase tracking-[0.42em]", light ? "text-brand-300" : "text-brand-600")}>Fashion · CFP</span>
      </span>
    </Link>
  );
}
