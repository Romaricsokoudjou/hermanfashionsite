import Link from "next/link";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import { Media } from "./Media";

export function SectionHeading({ eyebrow, title, text, align = "left", className }: { eyebrow?: string; title: React.ReactNode; text?: React.ReactNode; align?: "left" | "center"; className?: string }) {
  return (
    <div className={clsx("reveal max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className={clsx("eyebrow", align === "center" && "mx-auto")}>{eyebrow}</p>}
      <h2 className="h-section mt-4 text-ink">{title}</h2>
      {text && <p className="mt-5 text-[1.02rem] leading-relaxed text-ink-soft">{text}</p>}
    </div>
  );
}

export function PageHero({ eyebrow, title, text, image, children }: { eyebrow: string; title: React.ReactNode; text?: React.ReactNode; image?: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-ivory">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-brand-200/50 blur-3xl" />
      <div className={clsx("container-x relative grid items-center gap-10 py-14 md:py-20", image && "lg:grid-cols-[1.1fr_.9fr]")}>
        <div className="fade-up">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="h-display mt-5 text-[2.6rem] text-ink sm:text-[3.4rem] lg:text-[4rem]">{title}</h1>
          {text && <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-ink-soft">{text}</p>}
          {children}
        </div>
        {image && (
          <div className="fade-up relative hidden aspect-[5/4] overflow-hidden rounded-[2rem] shadow-lift lg:block" style={{ animationDelay: ".15s" }}>
            <Media src={image} alt="" sizes="(min-width:1024px) 45vw, 100vw" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-night/25 to-transparent" />
          </div>
        )}
      </div>
    </section>
  );
}

export function FormationCard({ f, index, href }: { f: { slug: string; title: string; tagline: string; image: string }; index: number; href?: string }) {
  return (
    <Link href={href || `/formations/${f.slug}`} className="reveal group relative block overflow-hidden rounded-[1.6rem] bg-night shadow-soft" style={{ transitionDelay: `${(index % 3) * 80}ms` }}>
      <div className="relative aspect-[4/5]">
        <Media src={f.image} alt={f.title} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="transition-transform duration-[1.4s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06]" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/35 to-transparent" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5">
          <span className="font-display text-lg italic text-white/80">{String(index + 1).padStart(2, "0")}</span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition-all duration-500 group-hover:rotate-[-45deg] group-hover:border-brand-400 group-hover:bg-brand-500">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-6">
          <h3 className="font-display text-[1.85rem] leading-tight text-white">{f.title}</h3>
          <p className="mt-2 text-sm text-white/70">{f.tagline}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-brand-300">
            Découvrir <span className="h-px w-6 bg-brand-300 transition-all duration-500 group-hover:w-10" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function EmptyState({ title, text, children }: { title: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-[1.6rem] border border-dashed border-brand-200 bg-brand-50/40 px-6 py-14 text-center">
      <p className="font-display text-2xl text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">{text}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
