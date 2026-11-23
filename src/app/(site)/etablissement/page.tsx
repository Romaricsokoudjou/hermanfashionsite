import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Eye, HeartHandshake, Sparkles, Users } from "lucide-react";
import { getSettings, getGallery } from "@/lib/data";
import { Media } from "@/components/Media";
import { FullLogo } from "@/components/Logo";
import { PageHero, SectionHeading } from "@/components/ui";
import { lines, pairs } from "@/lib/format";

export const metadata: Metadata = {
  title: "L'établissement",
  description: "Découvrez le CFP Herman FASHION : mission, vision, valeurs, approche pédagogique et environnement de formation aux métiers de la beauté à Douala.",
};

export default async function EtablissementPage() {
  const [s, gallery] = await Promise.all([getSettings(), getGallery("image")]);
  const values = pairs(s.about_values);
  const commitments = lines(s.about_commitments);
  const env = gallery.filter((g) => g.category === "Salles de cours").slice(0, 3);

  return (
    <>
      <PageHero eyebrow="L'établissement" title={<>Une école de <em className="text-brand-600">talents</em>, au cœur de Douala</>} text={s.about_intro} image="/images/photos/hf-6254.webp" />

      {s.about_history && (
        <section className="py-16 md:py-24">
          <div className="container-x grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <SectionHeading eyebrow="Notre histoire" title="D'une passion à une institution" />
            <div className="prose-hf reveal whitespace-pre-line text-[1.05rem]">{s.about_history}</div>
          </div>
        </section>
      )}

      <section className="py-16 md:py-24">
        <div className="container-x grid gap-6 md:grid-cols-2">
          {[
            { icon: Compass, t: "Notre mission", d: s.about_mission },
            { icon: Eye, t: "Notre vision", d: s.about_vision },
          ]
            .filter((x) => x.d)
            .map((x, i) => (
              <div key={x.t} className={`reveal relative overflow-hidden rounded-[2rem] p-10 ${i === 0 ? "bg-night text-white" : "bg-brand-50"}`}>
                {i === 0 && <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/40 blur-3xl" />}
                <x.icon className={`relative h-7 w-7 ${i === 0 ? "text-brand-400" : "text-brand-600"}`} />
                <h2 className="relative mt-6 font-display text-4xl">{x.t}</h2>
                <p className={`relative mt-4 text-[1.05rem] leading-relaxed ${i === 0 ? "text-white/75" : "text-ink-soft"}`}>{x.d}</p>
              </div>
            ))}
        </div>
      </section>

      {values.length > 0 && (
        <section className="bg-ivory py-16 md:py-24">
          <div className="container-x">
            <SectionHeading align="center" eyebrow="Nos valeurs" title={<>Ce qui nous <em className="text-brand-600">anime</em></>} />
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((v, i) => (
                <div key={v.title} className="reveal card p-7" style={{ transitionDelay: `${i * 70}ms` }}>
                  <span className="font-display text-5xl italic text-brand-300">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 font-display text-2xl">{v.title}</h3>
                  {v.text && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{v.text}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 md:py-24">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Approche pédagogique" title={<>Apprendre par le <em className="text-brand-600">geste</em></>} text={s.about_pedagogy} />
            {s.about_environment && (
              <div className="reveal mt-8 flex gap-4 rounded-2xl border border-line p-6">
                <Sparkles className="h-5 w-5 shrink-0 text-brand-600" />
                <div>
                  <p className="font-semibold">Notre environnement de formation</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{s.about_environment}</p>
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {env.map((g, i) => (
              <div key={g.id} className={`reveal relative overflow-hidden rounded-[1.4rem] ${i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-square"}`}>
                <Media src={g.url} alt={g.title} sizes="(min-width:1024px) 30vw, 50vw" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {(commitments.length > 0 || s.about_team) && (
        <section className="bg-sand/60 py-16 md:py-24">
          <div className="container-x grid gap-8 lg:grid-cols-2">
            {commitments.length > 0 && (
              <div className="reveal card p-9">
                <HeartHandshake className="h-7 w-7 text-brand-600" />
                <h2 className="mt-5 font-display text-3xl">Nos engagements</h2>
                <ul className="mt-6 space-y-4">
                  {commitments.map((c) => (
                    <li key={c} className="flex gap-3 text-ink-soft"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />{c}</li>
                  ))}
                </ul>
              </div>
            )}
            {s.about_team && (
              <div className="reveal card p-9">
                <Users className="h-7 w-7 text-brand-600" />
                <h2 className="mt-5 font-display text-3xl">Notre équipe pédagogique</h2>
                <p className="mt-5 whitespace-pre-line leading-relaxed text-ink-soft">{s.about_team}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {s.admin_references && (
        <section className="py-16">
          <div className="container-x">
            <div className="reveal flex flex-col gap-5 rounded-[1.75rem] border border-line bg-white p-8 md:flex-row md:items-center">
              <FullLogo className="w-28 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-700">Références administratives</p>
                <p className="mt-2 whitespace-pre-line font-medium text-ink">{s.admin_references}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="pb-20">
        <div className="container-x text-center">
          <Link href="/formations" className="btn btn-primary">Découvrir nos formations <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </>
  );
}
