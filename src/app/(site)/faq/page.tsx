import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getFaqs } from "@/lib/data";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "Questions fréquentes", description: "Tarifs, paiement, inscription, diplômes, centres : toutes les réponses aux questions fréquentes sur Herman FASHION." };

export default async function FaqPage() {
  const faqs = await getFaqs();
  const cats = Array.from(new Set(faqs.map((f) => f.category)));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero eyebrow="Questions fréquentes" title={<>Toutes vos <em className="text-brand-600">réponses</em></>} text="Vous ne trouvez pas votre réponse ? Interrogez HERMAN AI ou écrivez à la direction." />
      <section className="py-14 md:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[220px_1fr]">
          <nav className="hidden lg:block">
            <div className="sticky top-28 space-y-1">
              {cats.map((c) => (
                <a key={c} href={`#${c}`} className="block rounded-xl px-4 py-2.5 text-sm font-medium text-ink-soft hover:bg-brand-50 hover:text-brand-700">{c}</a>
              ))}
            </div>
          </nav>
          <div className="space-y-12">
            {cats.map((c) => (
              <div key={c} id={c} className="scroll-mt-28">
                <h2 className="font-display text-3xl">{c}</h2>
                <div className="mt-5 divide-y divide-line rounded-[1.5rem] border border-line bg-white">
                  {faqs.filter((f) => f.category === c).map((f) => (
                    <details key={f.id} className="group px-6 py-1 [&_summary::-webkit-details-marker]:hidden">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-semibold text-ink">
                        {f.question}
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition-transform duration-300 group-open:rotate-45"><Plus className="h-4 w-4" /></span>
                      </summary>
                      <p className="whitespace-pre-line pb-6 pr-10 leading-relaxed text-ink-soft">{f.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
            <div className="rounded-[1.5rem] bg-night p-8 text-white">
              <p className="font-display text-2xl">Une autre question ?</p>
              <p className="mt-2 text-white/65">La direction vous répond depuis la messagerie de votre espace.</p>
              <Link href="/contact" className="btn btn-primary mt-6">Contacter la direction</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
