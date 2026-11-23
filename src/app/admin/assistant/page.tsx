import { asc, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { aiMessages, knowledgeEntries, type knowledgeEntries as KE } from "@/db/schema";
import { saveKnowledgeAction } from "@/app/actions/admin";
import { AdminHeader, Area, Input, Kpi, Panel, Toggle } from "@/components/admin-ui";
import { SubmitButton } from "@/components/SubmitButton";

export const metadata = { title: "HERMAN AI" };
type Entry = typeof KE.$inferSelect;

function F({ k }: { k?: Entry }) {
  return (
    <form action={saveKnowledgeAction} className="grid gap-3 md:grid-cols-[1fr_90px]">
      <input type="hidden" name="id" value={k?.id ?? 0} />
      <Input label="Titre" name="title" defaultValue={k?.title} required />
      <Input label="Ordre" name="sortOrder" type="number" defaultValue={k?.sortOrder ?? 0} />
      <Area label="Contenu officiel" name="content" defaultValue={k?.content} rows={4} className="md:col-span-2" />
      <div className="flex items-center justify-between gap-2 md:col-span-2">
        <Toggle label="Active" name="active" defaultChecked={k?.active ?? true} />
        <div className="flex gap-2">
          {k && <SubmitButton className="btn-ghost btn-sm text-red-600" name="op" value="delete" confirm="Supprimer cette fiche ?">Supprimer</SubmitButton>}
          <SubmitButton className="btn-dark btn-sm">{k ? "Enregistrer" : "Ajouter"}</SubmitButton>
        </div>
      </div>
    </form>
  );
}

export default async function AdminAssistant() {
  const db = await getDb();
  const [list, [stats]] = await Promise.all([
    db.select().from(knowledgeEntries).orderBy(asc(knowledgeEntries.sortOrder)),
    db.select({ q: sql<number>`count(*) filter (where ${aiMessages.role} = 'user')::int`, u: sql<number>`count(distinct ${aiMessages.userId})::int` }).from(aiMessages),
  ]);
  const live = !!process.env.ANTHROPIC_API_KEY;
  return (
    <div>
      <AdminHeader title="HERMAN AI" text="L'assistant répond à partir des formations, tarifs, centres, FAQ, contenus de l'établissement et des fiches ci-dessous — jamais d'informations inventées." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Kpi label="Mode" value={live ? "IA active" : "Mode FAQ"} hint={live ? "Modèle Claude connecté" : "Ajoutez ANTHROPIC_API_KEY pour activer l'IA conversationnelle"} tone={live ? "brand" : "default"} />
        <Kpi label="Questions posées" value={String(stats?.q ?? 0)} />
        <Kpi label="Utilisateurs" value={String(stats?.u ?? 0)} />
      </div>
      <div className="space-y-4">
        <Panel title="Ajouter une fiche de connaissance"><F /></Panel>
        {list.map((k) => <Panel key={k.id}><F k={k} /></Panel>)}
      </div>
    </div>
  );
}
