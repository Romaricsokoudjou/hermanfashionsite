import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { faqs, type Faq } from "@/db/schema";
import { saveFaqAction } from "@/app/actions/admin";
import { AdminHeader, Area, Input, Panel, Toggle } from "@/components/admin-ui";
import { SubmitButton } from "@/components/SubmitButton";

export const metadata = { title: "FAQ" };

function F({ f }: { f?: Faq }) {
  return (
    <form action={saveFaqAction} className="grid gap-3 md:grid-cols-[1fr_180px_90px]">
      <input type="hidden" name="id" value={f?.id ?? 0} />
      <Input label="Question" name="question" defaultValue={f?.question} required />
      <Input label="Catégorie" name="category" defaultValue={f?.category ?? "Général"} />
      <Input label="Ordre" name="sortOrder" type="number" defaultValue={f?.sortOrder ?? 0} />
      <Area label="Réponse" name="answer" defaultValue={f?.answer} rows={3} className="md:col-span-3" />
      <div className="flex items-center justify-between gap-2 md:col-span-3">
        <Toggle label="Publiée" name="published" defaultChecked={f?.published ?? true} />
        <div className="flex gap-2">
          {f && <SubmitButton className="btn-ghost btn-sm text-red-600" name="op" value="delete" confirm="Supprimer cette question ?">Supprimer</SubmitButton>}
          <SubmitButton className="btn-dark btn-sm">{f ? "Enregistrer" : "Ajouter"}</SubmitButton>
        </div>
      </div>
    </form>
  );
}

export default async function AdminFaq() {
  const db = await getDb();
  const list = await db.select().from(faqs).orderBy(asc(faqs.sortOrder), asc(faqs.id));
  return (
    <div>
      <AdminHeader title="Questions fréquentes" text="Les réponses publiées alimentent aussi HERMAN AI." />
      <div className="space-y-4">
        <Panel title="Ajouter une question"><F /></Panel>
        {list.map((f) => <Panel key={f.id}><F f={f} /></Panel>)}
      </div>
    </div>
  );
}
