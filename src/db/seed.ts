import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import type { DB } from "./index";
import * as s from "./schema";

/**
 * Données officielles initiales.
 * Uniquement les informations communiquées par la direction (tarifs, spécialités, centres).
 * Les contenus non communiqués (programmes détaillés, histoire, équipe, témoignages…)
 * restent vides et sont à compléter depuis l'administration.
 */

const PLANS = [
  { code: "3-mois", label: "Formation de 3 mois", durationMonths: 3, price: 150000, diploma: "AQP", installments: [100000, 30000, 20000], sortOrder: 1 },
  { code: "6-mois", label: "Formation de 6 mois", durationMonths: 6, price: 250000, diploma: "CQP", installments: [150000, 70000, 30000], sortOrder: 2 },
  { code: "1-an", label: "Formation de 1 an", durationMonths: 12, price: 350000, diploma: "DQP", installments: [200000, 100000, 50000], sortOrder: 3 },
];

const F = (slug: string, title: string, tagline: string, presentation: string, outcomes: string, image: string, sortOrder: number) => ({
  slug, title, tagline, presentation, outcomes, image, sortOrder,
});

const FORMATIONS = [
  F("coiffure-femme", "Coiffure femme", "L'art de sublimer chaque chevelure",
    "La formation en coiffure femme prépare aux métiers du salon : soins du cheveu, coiffages et réalisations adaptées à chaque cliente. L'apprentissage alterne bases théoriques et mises en pratique encadrées.",
    "Coiffeuse en salon\nCoiffeuse à domicile\nOuverture de son propre salon", "/images/photos/hf-6303.webp", 1),
  F("onglerie-professionnelle", "Onglerie professionnelle", "Précision, créativité et finitions parfaites",
    "La formation en onglerie professionnelle prépare aux prestations de beauté des ongles, de la préparation à la finition, dans le respect des règles d'hygiène du métier.",
    "Prothésiste ongulaire en institut\nPrestations à domicile\nOuverture de son propre espace d'onglerie", "/images/photos/hf-6337.webp", 2),
  F("esthetique-bio", "Esthétique bio", "La beauté au naturel",
    "La formation en esthétique bio prépare aux soins de beauté du visage et du corps en privilégiant une approche naturelle, au service du bien-être de la clientèle.",
    "Esthéticienne en institut ou spa\nPrestations à domicile\nOuverture de son propre institut", "/images/photos/hf-6338.webp", 3),
  F("make-up-professionnel", "Make-up professionnel", "Révéler la beauté de chaque visage",
    "La formation en make-up professionnel prépare à la mise en beauté pour toutes les occasions : quotidien, cérémonies, événements et shootings.",
    "Maquilleuse professionnelle\nMaquillage événementiel et mariages\nActivité indépendante", "/images/photos/hf-6240.webp", 4),
  F("massage-professionnel", "Massage professionnel", "Le geste au service du bien-être",
    "La formation en massage professionnel prépare aux techniques de massage de détente et de bien-être, dans le respect de l'hygiène et du confort de la clientèle.",
    "Praticienne en spa ou institut\nMassages à domicile\nOuverture de son propre espace bien-être", "/images/photos/hf-6336.webp", 5),
  F("pedicure-manucure", "Pédicure et manucure", "Le soin des mains et des pieds",
    "La formation en pédicure et manucure prépare aux soins esthétiques des mains et des pieds, avec une attention particulière portée à l'hygiène et à la qualité des finitions.",
    "Technicienne en institut de beauté\nPrestations à domicile\nActivité indépendante", "/images/photos/hf-6335.webp", 6),
  F("extension-de-cils", "Extension de cils", "Intensifier le regard avec élégance",
    "La formation en extension de cils prépare à la pose de cils pour un regard sublimé, avec précision, sécurité et sens de l'esthétique.",
    "Technicienne cils en institut\nPrestations à domicile\nActivité indépendante", "/images/photos/hf-6249.webp", 7),
  F("microblading", "Microblading", "Des sourcils dessinés avec finesse",
    "La formation en microblading prépare à la technique de restructuration des sourcils poil à poil, une prestation de précision très recherchée.",
    "Technicienne en dermopigmentation\nPrestations en institut\nActivité indépendante", "/images/photos/hf-6219.webp", 8),
  F("microshading", "Microshading", "L'effet poudré, la signature du raffinement",
    "La formation en microshading prépare à la technique d'ombrage des sourcils pour un rendu poudré et harmonieux.",
    "Technicienne en dermopigmentation\nPrestations en institut\nActivité indépendante", "/images/photos/hf-6286.webp", 9),
];

const CENTRES = [
  {
    slug: "ange-raphael", name: "Centre Ange Raphaël", address: "Ange Raphaël, en face de Santa Lucia", city: "Douala, Cameroun",
    description: "Notre centre d'Ange Raphaël accueille les apprenants dans un cadre dédié aux métiers de la beauté et du bien-être.",
    mapQuery: "Santa Lucia Ange Raphaël Douala Cameroun", sortOrder: 1,
  },
  {
    slug: "deido", name: "Centre Deido", address: "Carrefour École publique de Deido, en face de la station MRS", city: "Douala, Cameroun",
    description: "Notre centre de Deido accueille les apprenants au cœur de Deido, à proximité immédiate du carrefour École publique.",
    mapQuery: "Carrefour École publique Deido Douala Cameroun", sortOrder: 2,
  },
];

const FAQS = [
  ["Formations", "Quelles formations proposez-vous ?", "Herman FASHION propose neuf spécialités : coiffure femme, onglerie professionnelle, esthétique bio, make-up professionnel, massage professionnel, pédicure et manucure, extension de cils, microblading et microshading. Chaque spécialité dispose d'une fiche détaillée dans la rubrique « Formations »."],
  ["Tarifs", "Combien coûte une formation ?", "Formation de 3 mois : 150 000 FCFA (diplôme indiqué : AQP). Formation de 6 mois : 250 000 FCFA (diplôme indiqué : CQP). Formation de 1 an : 350 000 FCFA (diplôme indiqué : DQP). À ces montants s'ajoutent 10 000 FCFA de frais d'inscription et polo."],
  ["Tarifs", "À quoi correspondent les 10 000 FCFA d'inscription ?", "Les 10 000 FCFA correspondent aux frais initiaux d'inscription et au polo. Ils sont réglés au moment de l'inscription, en plus du coût de la formation."],
  ["Paiement", "Puis-je payer ma formation en plusieurs fois ?", "Oui. Formation de 3 mois : 100 000 + 30 000 + 20 000 FCFA. Formation de 6 mois : 150 000 + 70 000 + 30 000 FCFA. Formation de 1 an : 200 000 + 100 000 + 50 000 FCFA. Le paiement en une seule fois est également possible."],
  ["Paiement", "Comment se fait le paiement ?", "Pour le moment, tous les paiements se font en espèces, directement auprès de la direction de Herman FASHION, dans l'un de nos centres. Une fois le paiement enregistré par l'administration, il apparaît automatiquement dans votre espace personnel."],
  ["Paiement", "Puis-je payer par Mobile Money ?", "Le paiement par Orange Money, MTN Mobile Money et carte bancaire sera proposé prochainement. Pour l'instant, le règlement se fait en espèces auprès de la direction."],
  ["Inscription", "Comment m'inscrire ?", "1. Créez votre compte gratuitement sur le site. 2. Choisissez votre formation et sa durée. 3. Consultez le récapitulatif et soumettez votre demande. 4. Rendez-vous dans l'un de nos centres pour régler en espèces auprès de la direction. 5. L'administration confirme votre paiement et votre inscription est mise à jour dans votre espace."],
  ["Inscription", "Dois-je créer un compte pour consulter les formations ?", "Non. Toutes les informations (formations, tarifs, centres, questions fréquentes) sont consultables librement. Un compte est nécessaire uniquement pour s'inscrire, suivre ses paiements, écrire au service client et discuter avec HERMAN AI."],
  ["Inscription", "Que signifient les statuts de mon inscription ?", "« Inscription en attente » : votre demande est reçue, aucun paiement n'est encore enregistré. « Paiement partiel » : une partie du montant a été réglée. « Paiement confirmé » : la totalité est réglée. « Inscription validée » : la direction a validé votre inscription."],
  ["Diplômes", "Quel diplôme est indiqué pour chaque durée ?", "Formation de 3 mois : AQP. Formation de 6 mois : CQP. Formation de 1 an : DQP."],
  ["Centres", "Où se trouvent vos centres ?", "Centre Ange Raphaël : Ange Raphaël, en face de Santa Lucia, Douala. Centre Deido : Carrefour École publique de Deido, en face de la station MRS, Douala."],
  ["Formations", "Toutes les spécialités sont-elles disponibles sur 3 mois, 6 mois et 1 an ?", "Les durées disponibles pour chaque spécialité sont confirmées par la direction et indiquées sur la fiche de la formation. En cas de doute, la direction vous renseigne lors de votre demande d'inscription."],
] as const;

const KNOWLEDGE = [
  ["Procédure de paiement (V1)", "Les paiements se font uniquement en espèces, auprès de la direction de Herman FASHION, dans l'un des centres. Le candidat se présente avec la référence de son inscription (format HF-AAAA-XXXX). L'administration enregistre le montant reçu, et le statut de l'inscription est actualisé automatiquement dans l'espace personnel. Aucun paiement n'est considéré comme confirmé sans validation de l'administration."],
  ["Programme de parrainage", "Un programme de parrainage est prévu et sera bientôt disponible. Il n'est pas encore actif : aucune commission n'est versée pour le moment."],
  ["Création de compte", "La création de compte est gratuite. Informations demandées : nom, prénom, téléphone, e-mail, pays, ville et mot de passe. Le compte permet de s'inscrire à une formation, suivre son dossier et ses paiements, recevoir des notifications, écrire au service client et utiliser HERMAN AI."],
];

const SETTINGS: Record<string, string> = {
  site_name: "HERMAN FASHION",
  legal_name: "CFP HERMAN FASHION",
  logo_url: "",
  slogan: "Transformez votre passion en talent, votre talent en réussite.",
  phone: "",
  whatsapp: "",
  email: "",
  hours: "",
  tiktok: "https://www.tiktok.com/@herman.fashion97",
  facebook: "https://www.facebook.com/share/1NcZzT2QpS/?mibextid=wwXIfr",
  instagram: "",
  about_intro:
    "Herman FASHION est un centre de formation professionnelle spécialisé dans les métiers de la beauté et du bien-être, à Douala. L'établissement accompagne ses apprenants dans le développement de compétences pratiques et professionnelles, adaptées aux exigences du marché.",
  about_history: "",
  about_vision:
    "Faire de Herman FASHION une institution moderne, digitalisée et accessible, qui révèle les talents et ouvre à chacun la voie d'un métier de la beauté et du bien-être.",
  about_mission:
    "Accompagner chaque apprenant dans l'apprentissage des métiers de la beauté et du bien-être grâce à des formations professionnelles, pratiques et adaptées aux exigences du marché.",
  about_values:
    "Excellence | Exiger la qualité dans chaque geste et chaque finition.\nPratique | Apprendre en faisant, au plus près des réalités du métier.\nAccompagnement | Suivre chaque apprenant, de l'inscription à la réussite.\nProfessionnalisme | Transmettre la rigueur, l'hygiène et l'éthique du métier.",
  about_pedagogy:
    "Notre approche associe apports théoriques et travaux pratiques encadrés. Les apprenants progressent en tenue professionnelle, dans des salles dédiées, et mettent en application chaque technique étudiée.",
  about_environment:
    "Deux centres à Douala — Ange Raphaël et Deido — avec des salles de cours et des espaces de travaux pratiques dédiés aux métiers de la beauté et du bien-être.",
  about_commitments:
    "Des informations claires sur les tarifs et les modalités de paiement.\nUn suivi transparent de chaque inscription depuis l'espace personnel.\nUn accompagnement attentif tout au long de la formation.",
  about_team: "",
  admin_references: "Arrêté / Ordre N°000651/MINEFOP/SG/DFOP/SDGSF/CSACD/CBAC",
  admission_conditions: "",
  payment_instructions:
    "Présentez-vous dans l'un de nos centres avec la référence de votre inscription. Le règlement s'effectue en espèces, auprès de la direction de Herman FASHION. Dès que l'administration a enregistré votre paiement, votre espace personnel est mis à jour.",
};

const GALLERY: Array<[string, string, string]> = [
  // [numéro, catégorie, titre]
  ...["6334", "6335", "6336", "6337", "6338", "6339", "6340", "6341", "6342"].map((n) => [n, "Travaux pratiques", "Séance de travaux pratiques"] as [string, string, string]),
  ...["6285", "6286", "6284", "6299", "6300", "6301", "6302", "6303", "6304", "6305"].map((n) => [n, "Apprenants", "Nos apprenantes en formation"] as [string, string, string]),
  ...["6240", "6249", "6251", "6252", "6253", "6254", "6238", "6239", "6241", "6219", "6220", "6221", "6306", "6307"].map((n) => [n, "Salles de cours", "En salle de cours"] as [string, string, string]),
  ...["6207", "6208", "6210", "6211", "6212", "6213", "6214", "6215", "6216", "6217", "6218"].map((n) => [n, "Salles de cours", "Concentration et prise de notes"] as [string, string, string]),
];

export async function ensureSeed(db: DB) {
  const existing = await db.select({ c: sql<number>`count(*)::int` }).from(s.plans);
  if ((existing[0]?.c ?? 0) === 0) {
    await db.insert(s.plans).values(PLANS.map((p) => ({ ...p, registrationFee: 10000 })));
    await db.insert(s.formations).values(FORMATIONS);
    await db.insert(s.centres).values(CENTRES);
    await db.insert(s.faqs).values(FAQS.map(([category, question, answer], i) => ({ category, question, answer, sortOrder: i })));
    await db.insert(s.knowledgeEntries).values(KNOWLEDGE.map(([title, content], i) => ({ title, content, sortOrder: i })));
    await db.insert(s.media).values(
      GALLERY.map(([n, category, title], i) => ({ type: "image", url: `/images/photos/hf-${n}.webp`, category, title, sortOrder: i })),
    );
  }
  // Paramètres : on n'ajoute que les clés manquantes (n'écrase jamais une valeur saisie)
  for (const [key, value] of Object.entries(SETTINGS)) {
    await db.insert(s.settings).values({ key, value }).onConflictDoNothing();
  }
  // Compte administrateur initial
  const admins = await db.select({ id: s.users.id }).from(s.users).where(eq(s.users.role, "admin")).limit(1);
  if (admins.length === 0) {
    const email = (process.env.ADMIN_EMAIL || "admin@hermanfashion.cm").toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "HermanFashion@2026";
    if (!process.env.ADMIN_PASSWORD) {
      console.warn("[herman-fashion] ADMIN_PASSWORD non défini : mot de passe administrateur par défaut utilisé. Changez-le immédiatement.");
    }
    await db
      .insert(s.users)
      .values({
        firstName: "Direction",
        lastName: "Herman FASHION",
        phone: "",
        email,
        passwordHash: await bcrypt.hash(password, 10),
        role: "admin",
      })
      .onConflictDoUpdate({ target: s.users.email, set: { role: "admin" } });
  }
}
