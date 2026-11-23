import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, CalendarRange, GraduationCap, HandCoins, MapPin, Shirt, Sparkles, UserPlus, ClipboardCheck, Banknote, CircleCheckBig } from "lucide-react";
import { getCentres, getFormations, getGallery, getPlans, getSettings, getTestimonials, getVideosBySlot } from "@/lib/data";
import { Media } from "@/components/Media";
import { FormationCard, SectionHeading } from "@/components/ui";
import { PlanCard } from "@/components/PlanCard";
import { VideoEmbed } from "@/components/VideoEmbed";
import { mapsDirections } from "@/lib/format";

export default async function HomePage() {
  const [formations, plans, centres, settings, testimonials, gallery, videos] = await Promise.all([
    getFormations(),
    getPlans(),
    getCentres(),
    getSettings(),
    getTestimonials(),
    getGallery("image"),
    getVideosBySlot(["presentation", "immersion", "temoignages"]),
  ]);
  const diplomas = plans.map((p) => p.diploma).filter(Boolean).join(" · ");
  const byCat = new Map<string, typeof gallery>();
  for (const g of gallery) byCat.set(g.category, [...(byCat.get(g.category) || []), g]);
  const mosaic: typeof gallery = [];
  for (let i = 0; mosaic.length < 5 && i < 30; i++) for (const list of byCat.values()) if (list[i * 3] && mosaic.length < 5) mosaic.push(list[i * 3]);

  const advantages = [
    { icon: Sparkles, title: "Formations pratiques", text: "Des apprentissages tournés vers le geste professionnel et les exigences réelles du marché." },
    { icon: GraduationCap, title: `Diplômes ${diplomas}`, text: "Trois parcours de 3 mois, 6 mois et 1 an, chacun avec son diplôme indiqué." },
    { icon: HandCoins, title: "Paiement en tranches", text: "Réglez votre formation en trois versements ou en une seule fois, à votre rythme." },
    { icon: Shirt, title: "Tenue professionnelle", text: "Le polo est compris dans les frais d'inscription : vous apprenez en tenue, comme en salon." },
    { icon: MapPin, title: `${centres.length} centres à Douala`, text: centres.map((c) => c.name.replace("Centre ", "")).join(" et ") + " : choisissez le centre le plus proche." },
    { icon: BadgeCheck, title: "Suivi transparent", text: "Inscription, paiements et statut de votre dossier : tout est visible dans votre espace personnel." },
  ];

  const steps = [
    { icon: UserPlus, title: "Créez votre compte", text: "Gratuit, en moins d'une minute." },
    { icon: CalendarRange, title: "Choisissez votre formation", text: "Spécialité, durée et récapitulatif financier." },
    { icon: ClipboardCheck, title: "Soumettez votre demande", text: "Vous recevez une référence d'inscription." },
    { icon: Banknote, title: "Réglez à la direction", text: "En espèces, dans l'un de nos centres." },
    { icon: CircleCheckBig, title: "Inscription validée", text: "Votre espace est mis à jour automatiquement." },
  ];

  return (
    <>
      {/* ------------------------------------------------ HERO */}
      <section className="grain relative overflow-hidden bg-ivory">
        <div className="pointer-events-none absolute -right-32 -top-48 h-[38rem] w-[38rem] rounded-full bg-brand-200/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[26rem] w-[26rem] rounded-full bg-brand-100 blur-3xl" />
        <div className="container-x relative grid items-center gap-14 pb-16 pt-10 md:pt-16 lg:grid-cols-[1.05fr_.95fr] lg:pb-24">
          <div>
            <p className="eyebrow fade-up">Centre de formation professionnelle · Douala</p>
            <h1 className="h-display fade-up mt-6 text-[3.1rem] text-ink sm:text-[4.4rem] xl:text-[5.4rem]" style={{ animationDelay: ".08s" }}>
              Révélez votre <em className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text font-medium text-transparent">talent</em>.
              <br />
              Construisez votre avenir.
            </h1>
            <p className="fade-up mt-7 max-w-xl text-[1.08rem] leading-relaxed text-ink-soft" style={{ animationDelay: ".16s" }}>
              Herman FASHION vous accompagne dans l&apos;apprentissage des métiers de la beauté et du bien-être grâce à des formations professionnelles, pratiques et adaptées aux exigences du marché.
            </p>
            <div className="fade-up mt-9 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: ".24s" }}>
              <Link href="/formations" className="btn btn-primary">
                Découvrir nos formations <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/inscription" className="btn btn-ghost">Rejoindre Herman FASHION</Link>
            </div>
            <dl className="fade-up mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-8" style={{ animationDelay: ".32s" }}>
              {[
                [String(formations.length), "spécialités"],
                [String(plans.length), "parcours diplômants"],
                [String(centres.length), "centres à Douala"],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="font-display text-[2.6rem] leading-none text-ink">{n}</dt>
                  <dd className="mt-2 text-[0.8rem] text-ink-mute">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="fade-up relative mx-auto w-full max-w-[560px]" style={{ animationDelay: ".2s" }}>
            <div className="arch relative aspect-[4/5] overflow-hidden shadow-lift ring-8 ring-white">
              <Media src="/images/photos/hf-6334.webp" alt="Apprenantes de Herman FASHION en séance de travaux pratiques" sizes="(min-width:1024px) 45vw, 92vw" priority className="object-[50%_30%]" />
              <div className="absolute inset-0 bg-gradient-to-t from-night/30 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-8 -left-4 w-[44%] overflow-hidden rounded-[1.4rem] shadow-lift ring-[6px] ring-white sm:-left-10">
              <div className="relative aspect-[4/3]">
                <Media src="/images/photos/hf-6249.webp" alt="Apprenantes en salle de cours" sizes="240px" />
              </div>
            </div>
            <div className="animate-float absolute -right-2 top-10 w-56 rounded-2xl border border-white/60 bg-white/85 p-4 shadow-lift backdrop-blur-md sm:-right-8">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-brand-700">Inscription</p>
              <p className="mt-1 font-display text-2xl leading-tight">10 000 FCFA</p>
              <p className="mt-1 text-xs text-ink-soft">Frais d&apos;inscription et polo inclus</p>
            </div>
            <div className="absolute -bottom-5 right-4 flex items-center gap-3 rounded-full bg-night px-5 py-3 text-white shadow-lift">
              <GraduationCap className="h-5 w-5 text-brand-400" />
              <span className="text-sm font-semibold">{diplomas}</span>
            </div>
          </div>
        </div>

        {/* Bandeau défilant des spécialités */}
        <div className="relative border-y border-brand-600 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 py-4 text-white">
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
            {[...formations, ...formations].map((f, i) => (
              <span key={i} className="flex items-center gap-10 font-display text-2xl italic">
                {f.title} <span className="text-base not-italic text-white/50">✦</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ PRÉSENTATION */}
      <section className="py-20 md:py-28">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <div className="reveal relative">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] shadow-lift">
              <Media src="/images/photos/hf-6285.webp" alt="Une formatrice de Herman FASHION en cours avec ses apprenantes" sizes="(min-width:1024px) 50vw, 100vw" />
            </div>
            <div className="absolute -bottom-6 right-6 max-w-[260px] rounded-2xl bg-white p-5 shadow-lift ring-1 ring-line">
              <p className="font-display text-xl leading-snug">« {settings.slogan || "Transformez votre passion en talent."} »</p>
            </div>
          </div>
          <div>
            <SectionHeading eyebrow="Herman FASHION" title={<>L&apos;exigence des grands métiers de la <em className="text-brand-600">beauté</em></>} text={settings.about_intro} />
            <ul className="reveal mt-8 grid gap-4 sm:grid-cols-2">
              {[settings.about_mission && ["Notre mission", settings.about_mission], settings.about_pedagogy && ["Notre approche", settings.about_pedagogy]]
                .filter(Boolean)
                .map((item) => {
                  const [t, d] = item as string[];
                  return (
                    <li key={t} className="rounded-2xl border border-line bg-ivory p-5">
                      <p className="text-sm font-bold text-ink">{t}</p>
                      <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-ink-soft">{d}</p>
                    </li>
                  );
                })}
            </ul>
            <Link href="/etablissement" className="reveal mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800">
              Découvrir l&apos;établissement <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ FORMATIONS */}
      <section className="bg-sand/60 py-20 md:py-28">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading eyebrow="Nos formations" title={<>Neuf spécialités pour <em className="text-brand-600">exprimer</em> votre talent</>} text="Choisissez la spécialité qui vous ressemble et découvrez sa fiche détaillée, ses durées et ses tarifs." />
            <Link href="/formations" className="btn btn-ghost reveal shrink-0">Toutes les formations <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {formations.filter((f) => f.featured).map((f, i) => (
              <FormationCard key={f.id} f={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ AVANTAGES */}
      <section className="py-20 md:py-28">
        <div className="container-x">
          <SectionHeading align="center" eyebrow="Pourquoi Herman FASHION" title={<>Une formation <em className="text-brand-600">sérieuse</em>, un cadre qui inspire</>} />
          <div className="mt-14 grid gap-px overflow-hidden rounded-[2rem] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {advantages.map((a, i) => (
              <div key={a.title} className="reveal group bg-white p-8 transition-colors duration-500 hover:bg-ivory" style={{ transitionDelay: `${(i % 3) * 70}ms` }}>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-all duration-500 group-hover:bg-brand-500 group-hover:text-white">
                  <a.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-6 font-display text-2xl">{a.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ TARIFS */}
      <section className="relative overflow-hidden bg-ivory py-20 md:py-28">
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[50rem] -translate-x-1/2 rounded-full bg-brand-100/70 blur-3xl" />
        <div className="container-x relative">
          <SectionHeading align="center" eyebrow="Parcours & tarifs" title={<>Trois parcours, <em className="text-brand-600">un objectif</em> : votre réussite</>} text="Des tarifs clairs, une inscription à 10 000 FCFA (inscription et polo) et un paiement échelonné en trois tranches." />
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {plans.map((p, i) => (
              <PlanCard key={p.id} plan={p} highlight={i === 1} />
            ))}
          </div>
          <p className="reveal mt-8 text-center text-sm text-ink-mute">
            Les durées proposées pour chaque spécialité sont précisées sur sa fiche. <Link href="/tarifs" className="font-semibold text-brand-700 underline underline-offset-4">Tout savoir sur les modalités</Link>
          </p>
        </div>
      </section>

      {/* ------------------------------------------------ ÉTAPES */}
      <section className="py-20 md:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Modalités d'inscription" title={<>Votre inscription en <em className="text-brand-600">cinq étapes</em></>} text="Un parcours simple : tout commence en ligne et se conclut auprès de la direction, dans l'un de nos centres." />
          <ol className="mt-14 grid gap-5 md:grid-cols-5">
            {steps.map((s, i) => (
              <li key={s.title} className="reveal relative rounded-[1.5rem] border border-line bg-white p-6" style={{ transitionDelay: `${i * 70}ms` }}>
                <span className="font-display text-5xl italic text-brand-200">{i + 1}</span>
                <s.icon className="absolute right-6 top-7 h-5 w-5 text-brand-500" />
                <h3 className="mt-4 text-[0.98rem] font-bold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="reveal mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/inscription" className="btn btn-primary">Créer mon compte <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/tarifs" className="btn btn-ghost">Voir le détail des modalités</Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ IMMERSION */}
      <section className="bg-night py-20 text-white md:py-28">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="reveal max-w-2xl">
              <p className="eyebrow !text-brand-300">Immersion</p>
              <h2 className="h-section mt-4">La vie à <em className="text-brand-400">Herman FASHION</em></h2>
              <p className="mt-5 leading-relaxed text-white/65">Cours, travaux pratiques, moments de promotion : découvrez nos apprenantes en formation, en images authentiques.</p>
            </div>
            <Link href="/galerie" className="btn reveal shrink-0 border border-white/20 text-white hover:border-brand-400 hover:text-brand-300">Toute la galerie <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
          {mosaic.length >= 5 && (
            <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2">
              {mosaic.map((m, i) => (
                <div key={m.id} className={`reveal relative overflow-hidden rounded-[1.4rem] ${i === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-auto" : "aspect-[4/3]"}`} style={{ transitionDelay: `${i * 60}ms` }}>
                  <Media src={m.url} alt={m.title || "Herman FASHION"} sizes="(min-width:768px) 25vw, 50vw" className="transition-transform duration-[1.4s] hover:scale-105" />
                </div>
              ))}
            </div>
          )}
          {videos.length > 0 && (
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {videos.slice(0, 3).map((v) => (
                <div key={v.id} className="reveal">
                  <div className="relative aspect-video overflow-hidden rounded-[1.4rem] bg-black">
                    <VideoEmbed url={v.url} title={v.title || "Vidéo Herman FASHION"} />
                  </div>
                  {v.title && <p className="mt-3 text-sm text-white/70">{v.title}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------ TÉMOIGNAGES (uniquement authentiques, publiés par l'administration) */}
      {testimonials.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="container-x">
            <SectionHeading align="center" eyebrow="Témoignages" title={<>Elles racontent <em className="text-brand-600">Herman FASHION</em></>} />
            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.slice(0, 6).map((t) => (
                <figure key={t.id} className="reveal card flex flex-col p-8">
                  <span className="font-display text-6xl leading-none text-brand-300">“</span>
                  <blockquote className="-mt-4 flex-1 leading-relaxed text-ink-soft">{t.quote}</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                    {t.photo && (
                      <span className="relative h-11 w-11 overflow-hidden rounded-full">
                        <Media src={t.photo} alt={t.name} sizes="44px" />
                      </span>
                    )}
                    <span>
                      <span className="block font-semibold">{t.name}</span>
                      {t.role && <span className="text-xs text-ink-mute">{t.role}</span>}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------ CENTRES */}
      <section className="py-20 md:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Nos centres" title={<>Deux adresses au cœur de <em className="text-brand-600">Douala</em></>} />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {centres.map((c, i) => (
              <div key={c.id} className="reveal group relative overflow-hidden rounded-[1.75rem] border border-line bg-white p-8 shadow-soft transition-shadow hover:shadow-lift" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-brand-100 transition-transform duration-700 group-hover:scale-125" />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-white">
                  <MapPin className="h-5 w-5" />
                </span>
                <h3 className="relative mt-6 font-display text-3xl">{c.name}</h3>
                <p className="relative mt-2 text-ink-soft">{c.address}<br />{c.city}</p>
                <div className="relative mt-7 flex flex-wrap gap-3">
                  <a href={mapsDirections(c.mapQuery || `${c.address} ${c.city}`)} target="_blank" rel="noopener noreferrer" className="btn btn-dark btn-sm">Itinéraire <ArrowUpRight className="h-4 w-4" /></a>
                  <Link href={`/centres#${c.slug}`} className="btn btn-ghost btn-sm">Voir la carte</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ CTA FINAL */}
      <section className="px-4 pb-20 md:pb-28">
        <div className="grain relative mx-auto max-w-[1240px] overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 px-8 py-16 text-white md:px-16 md:py-20">
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-brand-300/40 blur-3xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div className="reveal">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/75">Rejoignez-nous</p>
              <h2 className="h-display mt-4 text-[2.4rem] sm:text-[3.4rem]">Transformez votre passion en talent, votre talent en réussite.</h2>
            </div>
            <div className="reveal flex flex-col gap-3 lg:items-end">
              <Link href="/inscription" className="btn w-full bg-white text-brand-800 hover:-translate-y-0.5 hover:bg-ivory sm:w-auto">Commencer mon inscription <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/formations" className="btn w-full border border-white/40 text-white hover:bg-white/10 sm:w-auto">Explorer les formations</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
