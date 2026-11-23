import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { getDb } from "@/db";
import { formationPlans, formations } from "@/db/schema";
import { getPlans } from "@/lib/data";
import { deleteFormationAction, saveFormationAction } from "@/app/actions/admin";
import { AdminHeader, Area, ImageField, Input, Panel, Toggle } from "@/components/admin-ui";
import { SubmitButton } from "@/components/SubmitButton";
import { fcfa } from "@/lib/format";

export default async function EditFormation({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "nouvelle";
  const db = await getDb();
  const f = isNew ? null : (await db.select().from(formations).where(eq(formations.id, Number(id))).limit(1))[0];
  if (!isNew && !f) notFound();
  const plans = await getPlans(false);
  const linked = f ? (await db.select().from(formationPlans).where(eq(formationPlans.formationId, f.id))).map((l) => l.planId) : [];
  const hint = "Un élément par ligne.";

  return (
    <div>
      <Link href="/admin/formations" className="mb-4 inline-flex items-center gap-2 text-sm text-ink-soft hover:text-brand-700"><ArrowLeft className="h-4 w-4" /> Formations</Link>
      <AdminHeader title={f ? f.title : "Nouvelle formation"} text="N'indiquez que les informations validées par la direction : les champs vides ne s'affichent pas sur le site.">
        {f && <Link href={`/formations/${f.slug}`} target="_blank" className="btn btn-ghost btn-sm">Voir la fiche</Link>}
      </AdminHeader>
      <form action={saveFormationAction} className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <input type="hidden" name="id" value={f?.id ?? 0} />
        <input type="hidden" name="_back" value={`/admin/formations/${id}`} />
        <div className="space-y-6">
          <Panel title="Présentation">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Titre" name="title" defaultValue={f?.title} required />
              <Input label="Adresse de la page (slug)" name="slug" defaultValue={f?.slug} hint="Généré automatiquement si vide." />
              <Input label="Accroche" name="tagline" defaultValue={f?.tagline} className="sm:col-span-2" />
              <Area label="Présentation" name="presentation" defaultValue={f?.presentation} rows={5} className="sm:col-span-2" />
            </div>
          </Panel>
          <Panel title="Programme pédagogique">
            <div className="grid gap-4">
              <Area label="Objectifs pédagogiques" name="objectives" defaultValue={f?.objectives} hint={hint} />
              <Area label="Compétences développées" name="skills" defaultValue={f?.skills} hint={hint} />
              <Area label="Contenu de la formation" name="content" defaultValue={f?.content} hint={hint} rows={6} />
              <Area label="Débouchés professionnels" name="outcomes" defaultValue={f?.outcomes} hint={hint} />
              <Area label="Conditions d'admission spécifiques" name="admission" defaultValue={f?.admission} />
            </div>
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Durées disponibles">
            <p className="mb-3 text-xs text-ink-mute">Cochez uniquement les durées confirmées par la direction pour cette spécialité.</p>
            <div className="space-y-2">
              {plans.map((p) => (
                <label key={p.id} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line px-4 py-3 text-sm has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50">
                  <span className="flex items-center gap-3"><input type="checkbox" name="planIds" value={p.id} defaultChecked={linked.includes(p.id)} className="h-4 w-4 accent-[#f47a20]" /> {p.label} · {p.diploma}</span>
                  <span className="text-ink-mute">{fcfa(p.price)}</span>
                </label>
              ))}
            </div>
          </Panel>
          <Panel title="Photo & publication">
            <div className="space-y-4">
              <ImageField label="Photo principale" name="image" defaultValue={f?.image} />
              <Input label="Ordre d'affichage" name="sortOrder" type="number" defaultValue={f?.sortOrder ?? 0} />
              <div className="flex flex-col gap-3">
                <Toggle label="Publiée sur le site" name="published" defaultChecked={f?.published ?? true} />
                <Toggle label="Mise en avant sur l'accueil" name="featured" defaultChecked={f?.featured ?? true} />
              </div>
            </div>
          </Panel>
          <SubmitButton className="btn-primary w-full" pendingText="Enregistrement…">Enregistrer la formation</SubmitButton>
        </div>
      </form>
      {f && (
        <form action={deleteFormationAction} className="mt-8">
          <input type="hidden" name="id" value={f.id} />
          <SubmitButton className="btn-ghost btn-sm text-red-600" confirm="Supprimer définitivement cette formation ? Les inscriptions existantes sont conservées.">Supprimer la formation</SubmitButton>
        </form>
      )}
    </div>
  );
}
