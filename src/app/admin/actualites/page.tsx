import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { news, type News } from "@/db/schema";
import { saveNewsAction } from "@/app/actions/admin";
import { AdminHeader, Area, ImageField, Input, Panel, Toggle } from "@/components/admin-ui";
import { SubmitButton } from "@/components/SubmitButton";

export const metadata = { title: "Actualités" };

function F({ n }: { n?: News }) {
  return (
    <form action={saveNewsAction} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="id" value={n?.id ?? 0} />
      <Input label="Titre" name="title" defaultValue={n?.title} required className="md:col-span-2" />
      <Input label="Date de publication" name="publishedAt" type="date" defaultValue={(n?.publishedAt ?? new Date()).toISOString().slice(0, 10)} />
      <Input label="Adresse (slug)" name="slug" defaultValue={n?.slug} hint="Automatique si vide." />
      <Area label="Résumé" name="excerpt" defaultValue={n?.excerpt} rows={2} className="md:col-span-2" />
      <Area label="Texte" name="body" defaultValue={n?.body} rows={8} className="md:col-span-2" />
      <div className="md:col-span-2"><ImageField label="Image" name="image" defaultValue={n?.image} /></div>
      <div className="flex items-center justify-between gap-2 md:col-span-2">
        <Toggle label="Publiée" name="published" defaultChecked={n?.published ?? true} />
        <div className="flex gap-2">
          {n && <SubmitButton className="btn-ghost btn-sm text-red-600" name="op" value="delete" confirm="Supprimer ?">Supprimer</SubmitButton>}
          <SubmitButton className="btn-dark btn-sm">{n ? "Enregistrer" : "Publier"}</SubmitButton>
        </div>
      </div>
    </form>
  );
}

export default async function AdminNews() {
  const db = await getDb();
  const list = await db.select().from(news).orderBy(desc(news.publishedAt));
  return (
    <div>
      <AdminHeader title="Actualités" text="Rentrées, événements, remises de diplômes…" />
      <div className="space-y-6">
        <Panel title="Nouvelle actualité"><F /></Panel>
        {list.map((n) => <Panel key={n.id} title={n.title}><F n={n} /></Panel>)}
      </div>
    </div>
  );
}
