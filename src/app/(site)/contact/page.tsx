import type { Metadata } from "next";
import Link from "next/link";
import { Clock, LockKeyhole, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getCentres, getSettings } from "@/lib/data";
import { PageHero } from "@/components/ui";
import { ContactForm } from "@/components/forms";
import { mapsDirections, whatsappLink } from "@/lib/format";

export const metadata: Metadata = { title: "Contact", description: "Contactez Herman FASHION : messagerie, WhatsApp et adresses des centres de Douala." };

export default async function ContactPage() {
  const [user, s, centres] = await Promise.all([getCurrentUser(), getSettings(), getCentres()]);
  const wa = whatsappLink(s.whatsapp, "Bonjour Herman FASHION, je souhaite avoir des informations.");
  return (
    <>
      <PageHero eyebrow="Contact & assistance" title={<>Parlons de votre <em className="text-brand-600">projet</em></>} text="La direction vous répond depuis la messagerie de votre espace. Vous pouvez aussi nous écrire sur WhatsApp ou passer dans l'un de nos centres." />
      <section className="py-14 md:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.15fr]">
          <div className="space-y-5">
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="reveal flex items-center gap-4 rounded-[1.4rem] bg-[#25D366] p-6 text-white shadow-soft transition-transform hover:-translate-y-0.5">
                <MessageCircle className="h-7 w-7" />
                <div><p className="font-semibold">Écrire sur WhatsApp</p><p className="text-sm text-white/85">{s.whatsapp}</p></div>
              </a>
            )}
            <div className="reveal card space-y-4 p-7">
              {s.phone && <p className="flex gap-3"><Phone className="h-5 w-5 text-brand-600" /> <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="font-medium">{s.phone}</a></p>}
              {s.email && <p className="flex gap-3"><Mail className="h-5 w-5 text-brand-600" /> <a href={`mailto:${s.email}`} className="font-medium">{s.email}</a></p>}
              {s.hours && <p className="flex gap-3"><Clock className="h-5 w-5 text-brand-600" /> {s.hours}</p>}
              {centres.map((c) => (
                <a key={c.id} href={mapsDirections(c.mapQuery || c.address)} target="_blank" rel="noopener noreferrer" className="flex gap-3 rounded-xl p-1 hover:bg-ivory">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  <span><span className="block font-semibold">{c.name}</span><span className="text-sm text-ink-soft">{c.address}, {c.city}</span></span>
                </a>
              ))}
            </div>
          </div>

          <div className="reveal card p-7 md:p-10">
            <h2 className="font-display text-3xl">Envoyer un message</h2>
            {user ? (
              <>
                <p className="mt-2 text-sm text-ink-soft">Connecté en tant que {user.firstName} {user.lastName}. Vous recevrez une notification dès que la direction vous répond.</p>
                <div className="mt-7"><ContactForm /></div>
                <Link href="/espace/messages" className="mt-6 inline-block text-sm font-semibold text-brand-700">Voir mes conversations →</Link>
              </>
            ) : (
              <div className="mt-6 rounded-2xl bg-ivory p-7 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600"><LockKeyhole className="h-5 w-5" /></span>
                <p className="mt-4 font-semibold">Connectez-vous pour écrire à la direction</p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">Votre messagerie personnelle garde l&apos;historique de vos échanges et vous notifie à chaque réponse.</p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link href="/inscription?next=/contact" className="btn btn-primary">Créer mon compte</Link>
                  <Link href="/connexion?next=/contact" className="btn btn-ghost">Se connecter</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
