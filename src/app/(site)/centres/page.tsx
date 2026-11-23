import type { Metadata } from "next";
import { ArrowUpRight, Clock, MapPin, Phone } from "lucide-react";
import { getCentres } from "@/lib/data";
import { Media } from "@/components/Media";
import { PageHero } from "@/components/ui";
import { mapsDirections, mapsEmbed } from "@/lib/format";

export const metadata: Metadata = {
  title: "Nos centres à Douala",
  description: "Centre Ange Raphaël (en face de Santa Lucia) et Centre Deido (carrefour École publique, en face de la station MRS) : retrouvez les centres Herman FASHION à Douala.",
};

export default async function CentresPage() {
  const centres = await getCentres();
  return (
    <>
      <PageHero eyebrow="Nos centres" title={<>Venez nous <em className="text-brand-600">rencontrer</em></>} text="Deux centres à Douala pour vous accueillir, vous informer et finaliser votre inscription auprès de la direction." />
      <section className="py-16 md:py-24">
        <div className="container-x space-y-16">
          {centres.map((c, i) => {
            const q = c.mapQuery || `${c.address} ${c.city}`;
            return (
              <article key={c.id} id={c.slug} className="reveal grid scroll-mt-28 overflow-hidden rounded-[2rem] border border-line bg-white shadow-soft lg:grid-cols-2">
                <div className={`flex flex-col justify-center p-8 md:p-12 ${i % 2 ? "lg:order-2" : ""}`}>
                  <p className="eyebrow">Centre {String(i + 1).padStart(2, "0")}</p>
                  <h2 className="mt-4 font-display text-4xl md:text-5xl">{c.name}</h2>
                  {c.description && <p className="mt-5 leading-relaxed text-ink-soft">{c.description}</p>}
                  <ul className="mt-7 space-y-3 text-[0.95rem]">
                    <li className="flex gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" /> {c.address}, {c.city}</li>
                    {c.hours && <li className="flex gap-3"><Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" /> {c.hours}</li>}
                    {c.phone && <li className="flex gap-3"><Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" /> <a href={`tel:${c.phone.replace(/\s/g, "")}`}>{c.phone}</a></li>}
                  </ul>
                  <a href={mapsDirections(q)} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-8 self-start">Obtenir l&apos;itinéraire <ArrowUpRight className="h-4 w-4" /></a>
                </div>
                <div className={`relative min-h-[320px] bg-sand ${i % 2 ? "lg:order-1" : ""}`}>
                  {c.image ? (
                    <Media src={c.image} alt={c.name} sizes="(min-width:1024px) 50vw, 100vw" />
                  ) : (
                    <iframe title={`Carte — ${c.name}`} src={mapsEmbed(q)} className="absolute inset-0 h-full w-full grayscale-[30%]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                  )}
                </div>
                {c.image && (
                  <div className="h-80 lg:col-span-2">
                    <iframe title={`Carte — ${c.name}`} src={mapsEmbed(q)} className="h-full w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
