import "server-only";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import * as s from "@/db/schema";
import { getCentres, getFaqs, getFormationPlanMap, getFormations, getPlans, getSettings } from "./data";
import { fcfa, lines } from "./format";

/** Base de connaissances de HERMAN AI, construite en direct depuis les données du site. */
export async function buildKnowledge() {
  const db = await getDb();
  const [settings, plans, formations, planMap, centres, faqs, kb] = await Promise.all([
    getSettings(),
    getPlans(),
    getFormations(),
    getFormationPlanMap(),
    getCentres(),
    getFaqs(),
    db.select().from(s.knowledgeEntries).where(eq(s.knowledgeEntries.active, true)).orderBy(asc(s.knowledgeEntries.sortOrder)),
  ]);

  const parts: string[] = [];
  parts.push(`# Établissement\n${settings.legal_name || "CFP HERMAN FASHION"} — centre de formation professionnelle aux métiers de la beauté et du bien-être, à Douala (Cameroun).\n${settings.about_intro || ""}`);
  if (settings.about_mission) parts.push(`Mission : ${settings.about_mission}`);
  if (settings.about_vision) parts.push(`Vision : ${settings.about_vision}`);
  if (settings.about_history) parts.push(`Histoire : ${settings.about_history}`);
  if (settings.admin_references) parts.push(`Références administratives : ${settings.admin_references}`);

  const contact = [
    settings.phone && `Téléphone : ${settings.phone}`,
    settings.whatsapp && `WhatsApp : ${settings.whatsapp}`,
    settings.email && `E-mail : ${settings.email}`,
    settings.hours && `Horaires : ${settings.hours}`,
  ].filter(Boolean);
  parts.push(`# Coordonnées\n${contact.length ? contact.join("\n") : "Coordonnées téléphoniques non renseignées : orienter vers la page Contact, la messagerie de l'espace personnel ou les centres."}`);

  parts.push(
    `# Tarifs officiels\n` +
      plans
        .map(
          (p) =>
            `- ${p.label} : formation ${fcfa(p.price)} + inscription et polo ${fcfa(p.registrationFee)} (total ${fcfa(p.price + p.registrationFee)}). Diplôme indiqué : ${p.diploma}. Paiement par tranches : ${p.installments.map(fcfa).join(" + ")}.`,
        )
        .join("\n") +
      `\nLes frais d'inscription de 10 000 FCFA (inscription et polo) sont les frais initiaux d'accès à l'inscription.`,
  );

  parts.push(
    `# Formations\n` +
      formations
        .map((f) => {
          const ids = planMap.get(f.id) || [];
          const durations = plans.filter((p) => ids.includes(p.id)).map((p) => p.label);
          return [
            `## ${f.title}`,
            f.tagline && `Accroche : ${f.tagline}`,
            f.presentation && `Présentation : ${f.presentation}`,
            f.objectives && `Objectifs : ${lines(f.objectives).join("; ")}`,
            f.skills && `Compétences : ${lines(f.skills).join("; ")}`,
            f.content && `Contenu : ${lines(f.content).join("; ")}`,
            f.outcomes && `Débouchés possibles : ${lines(f.outcomes).join("; ")}`,
            f.admission && `Conditions d'admission : ${f.admission}`,
            `Durées disponibles : ${durations.length ? durations.join(", ") : "à confirmer par la direction"}`,
            `Page : /formations/${f.slug}`,
          ]
            .filter(Boolean)
            .join("\n");
        })
        .join("\n\n"),
  );

  parts.push(`# Centres\n` + centres.map((c) => `- ${c.name} : ${c.address}, ${c.city}${c.hours ? ` — ${c.hours}` : ""}${c.phone ? ` — ${c.phone}` : ""}`).join("\n"));
  if (settings.admission_conditions) parts.push(`# Conditions d'admission générales\n${settings.admission_conditions}`);
  if (settings.payment_instructions) parts.push(`# Modalités de règlement\n${settings.payment_instructions}`);
  parts.push(`# Questions fréquentes\n` + faqs.map((f) => `Q : ${f.question}\nR : ${f.answer}`).join("\n\n"));
  if (kb.length) parts.push(`# Informations complémentaires\n` + kb.map((k) => `## ${k.title}\n${k.content}`).join("\n\n"));

  return { text: parts.join("\n\n"), faqs, kb, formations, settings };
}

export function systemPrompt(knowledge: string, firstName: string) {
  return `Tu es HERMAN AI, l'assistant officiel du centre de formation professionnelle HERMAN FASHION (métiers de la beauté et du bien-être, Douala, Cameroun).
Tu échanges avec ${firstName}, utilisateur connecté du site.

Règles impératives :
- Réponds en français, avec chaleur, élégance et concision (3 à 8 phrases, listes courtes si utile).
- Appuie-toi UNIQUEMENT sur la base de connaissances ci-dessous. N'invente jamais un tarif, une durée, un diplôme, une certification, un agrément, une date, une décision administrative ni un contenu pédagogique.
- Si l'information n'y figure pas, dis-le simplement et oriente vers la direction : messagerie de l'espace personnel (/espace/messages), page Contact (/contact) ou visite dans un centre.
- Tu n'as pas accès aux dossiers, paiements ni données personnelles des utilisateurs. Pour le suivi d'un dossier, oriente vers l'espace personnel (/espace).
- Les paiements se font actuellement en espèces auprès de la direction ; ne promets jamais un paiement en ligne.
- Guide le candidat pas à pas vers l'inscription quand c'est pertinent : créer son compte, choisir la formation et la durée, soumettre la demande, régler auprès de la direction.
- Le programme de parrainage n'est pas encore disponible.
- Ne réponds pas aux sujets sans rapport avec HERMAN FASHION ; ramène poliment la conversation vers l'établissement.

=== BASE DE CONNAISSANCES OFFICIELLE ===
${knowledge}
=== FIN ===`;
}

/** Réponse de secours (sans clé API) : recherche dans la FAQ et la base de connaissances. */
export function fallbackAnswer(question: string, k: Awaited<ReturnType<typeof buildKnowledge>>) {
  const norm = (t: string) =>
    t
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
  const stop = new Set(["les", "des", "une", "est", "pour", "que", "qui", "quel", "quelle", "quels", "comment", "vous", "avec", "dans", "sur", "pas", "mon", "mes", "suis", "faire", "peut", "puis", "elle", "ils", "aux", "votre", "vos"]);
  const words = norm(question).split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !stop.has(w));
  const candidates = [
    ...k.faqs.map((f) => ({ title: f.question, body: f.answer })),
    ...k.kb.map((e) => ({ title: e.title, body: e.content })),
    ...k.formations.map((f) => ({ title: f.title, body: `${f.presentation}\nFiche complète : /formations/${f.slug}` })),
  ];
  let best: { score: number; title: string; body: string } | null = null;
  for (const c of candidates) {
    const hay = norm(`${c.title} ${c.title} ${c.body}`);
    const score = words.reduce((acc, w) => acc + (hay.includes(w) ? (norm(c.title).includes(w) ? 3 : 1) : 0), 0);
    if (!best || score > best.score) best = { score, ...c };
  }
  if (best && best.score >= 2) return best.body;
  return "Je n'ai pas trouvé d'information officielle précise sur ce point. Je vous invite à écrire à la direction depuis la messagerie de votre espace personnel (/espace/messages) ou à vous rendre dans l'un de nos centres à Douala : la direction vous répondra avec plaisir.";
}
