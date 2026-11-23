export function fcfa(n: number | null | undefined) {
  const v = Math.round(Number(n || 0));
  return `${v.toLocaleString("fr-FR").replace(/ | /g, " ")} FCFA`;
}

export function dateFr(d: Date | string | null | undefined, withTime = false) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Africa/Douala",
  });
}

export function lines(text: string | null | undefined): string[] {
  return (text || "")
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

/** "Titre | description" → { title, text } */
export function pairs(text: string | null | undefined) {
  return lines(text).map((l) => {
    const [title, ...rest] = l.split("|");
    return { title: title.trim(), text: rest.join("|").trim() };
  });
}

export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function whatsappLink(number: string, text?: string) {
  const digits = (number || "").replace(/[^\d]/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function mapsEmbed(query: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`;
}

export function mapsDirections(query: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

export const STATUS_LABELS: Record<string, string> = {
  en_attente: "Inscription en attente",
  paiement_partiel: "Paiement partiel",
  paiement_confirme: "Paiement confirmé",
  validee: "Inscription validée",
  annulee: "Annulée",
};

export const STATUS_TONES: Record<string, string> = {
  en_attente: "bg-amber-50 text-amber-800 ring-amber-200",
  paiement_partiel: "bg-orange-50 text-orange-800 ring-orange-200",
  paiement_confirme: "bg-sky-50 text-sky-800 ring-sky-200",
  validee: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  annulee: "bg-stone-100 text-stone-600 ring-stone-200",
};

export const PAYMENT_METHODS: Record<string, string> = {
  especes: "Espèces",
  orange_money: "Orange Money",
  mtn_momo: "MTN Mobile Money",
  carte: "Carte bancaire",
};
