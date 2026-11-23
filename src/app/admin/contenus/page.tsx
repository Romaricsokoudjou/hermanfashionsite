import { getSettings } from "@/lib/data";
import { saveSettingsAction } from "@/app/actions/admin";
import { AdminHeader, Area, ImageField, Input, Panel } from "@/components/admin-ui";
import { SubmitButton } from "@/components/SubmitButton";

export const metadata = { title: "Contenus & coordonnées" };

export default async function AdminContenus() {
  const s = await getSettings();
  return (
    <form action={saveSettingsAction} encType="multipart/form-data">
      <AdminHeader title="Contenus & coordonnées" text="Textes institutionnels et coordonnées affichés sur le site et connus de HERMAN AI. Un champ vide masque la section correspondante.">
        <SubmitButton pendingText="Enregistrement…">Enregistrer tout</SubmitButton>
      </AdminHeader>
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Logo officiel" className="xl:col-span-2">
          <ImageField label="Logo (PNG transparent ou SVG de préférence) — remplace le logo provisoire dans l'en-tête, le pied de page et l'administration" name="logo_url" defaultValue={s.logo_url} />
        </Panel>
        <Panel title="Coordonnées & réseaux">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Téléphone" name="phone" defaultValue={s.phone} placeholder="+237 …" />
            <Input label="WhatsApp (avec indicatif)" name="whatsapp" defaultValue={s.whatsapp} placeholder="+237 6…" hint="Active le bouton WhatsApp flottant." />
            <Input label="E-mail" name="email" defaultValue={s.email} />
            <Input label="Horaires" name="hours" defaultValue={s.hours} placeholder="Lun – Sam · 8h – 17h" />
            <Input label="Facebook" name="facebook" defaultValue={s.facebook} />
            <Input label="TikTok" name="tiktok" defaultValue={s.tiktok} />
            <Input label="Instagram" name="instagram" defaultValue={s.instagram} />
            <Input label="Nom officiel" name="legal_name" defaultValue={s.legal_name} />
            <Input label="Slogan" name="slogan" defaultValue={s.slogan} className="sm:col-span-2" />
          </div>
        </Panel>
        <Panel title="Admission & paiement">
          <div className="space-y-4">
            <Area label="Conditions d'admission générales" name="admission_conditions" defaultValue={s.admission_conditions} rows={4} hint="À compléter par la direction (âge, niveau, pièces à fournir…)." />
            <Area label="Modalités de règlement (affichées au candidat)" name="payment_instructions" defaultValue={s.payment_instructions} rows={4} />
            <Area label="Références administratives officielles" name="admin_references" defaultValue={s.admin_references} rows={3} hint="Agrément, arrêté, autorisation… uniquement les références officielles de l'établissement." />
          </div>
        </Panel>
        <Panel title="L'établissement" className="xl:col-span-2">
          <div className="grid gap-4 md:grid-cols-2">
            <Area label="Présentation courte" name="about_intro" defaultValue={s.about_intro} />
            <Area label="Notre histoire" name="about_history" defaultValue={s.about_history} hint="Section masquée tant que ce champ est vide." />
            <Area label="Notre mission" name="about_mission" defaultValue={s.about_mission} />
            <Area label="Notre vision" name="about_vision" defaultValue={s.about_vision} />
            <Area label="Nos valeurs" name="about_values" defaultValue={s.about_values} rows={5} hint="Une valeur par ligne, au format « Titre | description »." />
            <Area label="Nos engagements" name="about_commitments" defaultValue={s.about_commitments} rows={5} hint="Un engagement par ligne." />
            <Area label="Approche pédagogique" name="about_pedagogy" defaultValue={s.about_pedagogy} />
            <Area label="Environnement de formation" name="about_environment" defaultValue={s.about_environment} />
            <Area label="Équipe pédagogique" name="about_team" defaultValue={s.about_team} hint="Section masquée tant que ce champ est vide." className="md:col-span-2" />
          </div>
        </Panel>
      </div>
      <div className="mt-6"><SubmitButton pendingText="Enregistrement…">Enregistrer tout</SubmitButton></div>
    </form>
  );
}
