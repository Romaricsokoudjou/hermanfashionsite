import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Briefcase, Check, ClipboardList, GraduationCap, Info, Target, Wand2 } from "lucide-react";
import { getFormationBySlug, getFormations, getSettings } from "@/lib/data";
import { Media } from "@/components/Media";
import { FormationCard } from "@/components/ui";
import { fcfa, lines } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getFormationBySlug(slug);
  if (!data) return {};
  return {
    title: `Formation ${data.formation.title} à Douala`,
    description: data.formation.presentation.slice(0, 160),
    openGraph: { images: data.formation.image ? [data.formation.image] : [] },
  };
}

function Block({ icon: Icon, title, items, text }: { icon: typeof Target; title: string; items?: string[]; text?: string }) {
  if (!items?.length && !text) return null;
  return (
    <div className="reveal border-t border-line pt-10">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon className="h-5 w-5" /></span>
        <h2 className="font-display text-3xl">{title}</h2>
      </div>
      {text && <p className="mt-5 whitespace-pre-line leading-relaxed text-ink-soft">{text}</p>}
      {items && items.length > 0 && (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {items.map((it) => (
            <li key={it} className="flex gap-3 rounded-2xl bg-ivory p-4 text-[0.95rem] text-ink-soft">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> {it}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function FormationPage({ params }: Props) {
  const { slug } = await params;
  const data = await getFormationBySlug(slug);
  if (!data || !data.formation.published) notFound();
  const { formation: f, plans, allPlans, durationsConfirmed } = data;
  const [all, settings] = await Promise.all([getFormations(), getSettings()]);
  const others = all.filter((o) => o.id !== f.id).slice(0, 3);
  const shown = durationsConfirmed ? plans : allPlans;
  const hasProgram = f.objectives || f.skills || f.content;
  const enrollHref = `/espace/inscriptions/nouvelle?formation=${f.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `Formation ${f.title}`,
    description: f.presentation,
    provider: { "@type": "EducationalOrganization", name: "CFP HERMAN FASHION", address: "Douala, Cameroun" },
    offers: shown.map((p) => ({ "@type": "Offer", price: p.price, priceCurrency: "XAF", name: p.label })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="relative overflow-hidden bg-night text-white">
        <div className="absolute inset-0 opacity-55">
          <Media src={f.image} alt="" priority />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-night via-night/80 to-night/20" />
        <div className="container-x relative py-16 md:py-24">
          <Link href="/formations" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Toutes les formations
          </Link>
          <p className="eyebrow fade-up mt-10 !text-brand-300">Formation professionnelle</p>
          <h1 className="h-display fade-up mt-4 max-w-3xl text-[3rem] sm:text-[4.4rem]">{f.title}</h1>
          {f.tagline && <p className="fade-up mt-4 font-display text-2xl italic text-brand-200">{f.tagline}</p>}
          <div className="fade-up mt-9 flex flex-wrap gap-3">
            <Link href={enrollHref} className="btn btn-primary">S&apos;inscrire à cette formation <ArrowRight className="h-4 w-4" /></Link>
            <Link href="#tarifs" className="btn border border-white/25 text-white hover:bg-white/10">Durées et tarifs</Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_380px]">
          <div className="space-y-10">
            <div className="reveal">
              <p className="eyebrow">Présentation</p>
              <p className="mt-5 text-[1.12rem] leading-[1.85] text-ink-soft">{f.presentation}</p>
            </div>
            <Block icon={Target} title="Objectifs pédagogiques" items={lines(f.objectives)} />
            <Block icon={Wand2} title="Compétences développées" items={lines(f.skills)} />
            <Block icon={ClipboardList} title="Contenu de la formation" items={lines(f.content)} />
            {!hasProgram && (
              <div className="reveal flex gap-4 rounded-[1.5rem] border border-brand-200 bg-brand-50/60 p-6">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <div>
                  <p className="font-semibold text-ink">Programme détaillé</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    Le programme détaillé, les objectifs et le contenu de cette formation vous sont communiqués par la direction. Écrivez-nous ou passez dans l&apos;un de nos centres.
                  </p>
                  <Link href="/contact" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">Demander le programme <ArrowRight className="h-4 w-4" /></Link>
                </div>
              </div>
            )}
            <Block icon={Briefcase} title="Débouchés professionnels possibles" items={lines(f.outcomes)} />
            <Block icon={GraduationCap} title="Conditions d'admission" text={f.admission || settings.admission_conditions || ""} />

            <div id="tarifs" className="reveal scroll-mt-28 border-t border-line pt-10">
              <h2 className="font-display text-3xl">Durées et tarifs</h2>
              {!durationsConfirmed && (
                <p className="mt-3 text-sm text-ink-soft">
                  Les durées proposées pour cette spécialité sont confirmées par la direction lors de votre demande. Grille tarifaire officielle :
                </p>
              )}
              <div className="mt-6 overflow-hidden rounded-[1.4rem] border border-line">
                <table className="w-full text-left text-sm">
                  <thead className="bg-ivory text-xs uppercase tracking-wider text-ink-mute">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Durée</th>
                      <th className="px-5 py-4 font-semibold">Formation</th>
                      <th className="hidden px-5 py-4 font-semibold sm:table-cell">Tranches</th>
                      <th className="px-5 py-4 font-semibold">Diplôme</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {shown.map((p) => (
                      <tr key={p.id}>
                        <td className="px-5 py-4 font-semibold">{p.label.replace("Formation de ", "")}</td>
                        <td className="px-5 py-4">{fcfa(p.price)}</td>
                        <td className="hidden px-5 py-4 text-ink-soft sm:table-cell">{p.installments.map((a) => a / 1000 + "k").join(" + ")}</td>
                        <td className="px-5 py-4"><span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-800">{p.diploma}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-ink-mute">+ 10 000 FCFA de frais d&apos;inscription et polo, réglés au moment de l&apos;inscription.</p>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="reveal overflow-hidden rounded-[1.75rem] border border-line bg-white shadow-lift">
              <div className="relative aspect-[16/10]">
                <Media src={f.image} alt={f.title} sizes="380px" />
              </div>
              <div className="p-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">{durationsConfirmed ? "Durées disponibles" : "Grille tarifaire"}</p>
                <ul className="mt-4 space-y-3">
                  {shown.map((p) => (
                    <li key={p.id} className="flex items-center justify-between rounded-xl bg-ivory px-4 py-3 text-sm">
                      <span><span className="font-semibold">{p.label.replace("Formation de ", "")}</span> <span className="text-ink-mute">· {p.diploma}</span></span>
                      <span className="font-semibold">{fcfa(p.price)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs leading-relaxed text-ink-mute">Inscription et polo : 10 000 FCFA. Règlement en espèces auprès de la direction.</p>
                <Link href={enrollHref} className="btn btn-primary mt-6 w-full">S&apos;inscrire à cette formation</Link>
                <Link href="/tarifs" className="mt-3 block text-center text-sm font-semibold text-brand-700">Modalités de paiement</Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-sand/60 py-16 md:py-24">
        <div className="container-x">
          <h2 className="h-section reveal">D&apos;autres <em className="text-brand-600">spécialités</em></h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (
              <FormationCard key={o.id} f={o} index={all.findIndex((a) => a.id === o.id)} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
