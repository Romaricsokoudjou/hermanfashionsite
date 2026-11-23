import { asc, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { testimonials, type Testimonial } from "@/db/schema";
import { saveTestimonialAction } from "@/app/actions/admin";
import { AdminHeader, Area, ImageField, Input, Panel, Toggle } from "@/components/admin-ui";
import { SubmitButton } from "@/components/SubmitButton";

export const metadata = { title: "Témoignages" };

function F({ t }: { t?: Testimonial }) {
  return (
    <form action={saveTestimonialAction} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="id" value={t?.id ?? 0} />
      <Input label="Nom" name="name" defaultValue={t?.name} required />
      <Input label="Formation / rôle" name="role" defaultValue={t?.role} placeholder="Ex : Apprenante en onglerie" />
      <Area label="Témoignage" name="quote" defaultValue={t?.quote} className="md:col-span-2" />
      <div className="md:col-span-2"><ImageField label="Photo (avec accord de la personne)" name="photo" defaultValue={t?.photo} /></div>
      <Input label="Ordre" name="sortOrder" type="number" defaultValue={t?.sortOrder ?? 0} />
      <div className="flex items-end justify-between gap-2">
        <Toggle label="Publié" name="published" defaultChecked={t?.published ?? true} />
        <div className="flex gap-2">
          {t && <SubmitButton className="btn-ghost btn-sm text-red-600" name="op" value="delete" confirm="Supprimer ?">Supprimer</SubmitButton>}
          <SubmitButton className="btn-dark btn-sm">{t ? "Enregistrer" : "Ajouter"}</SubmitButton>
        </div>
      </div>
    </form>
  );
}

export default async function AdminTemoignages() {
  const db = await getDb();
  const list = await db.select().from(testimonials).orderBy(asc(testimonials.sortOrder), desc(testimonials.id));
  return (
    <div>
      <AdminHeader title="Témoignages" text="Uniquement des témoignages authentiques, recueillis avec l'accord des apprenants. La section n'apparaît sur l'accueil que lorsqu'au moins un témoignage est publié." />
      <div className="space-y-6">
        <Panel title="Ajouter un témoignage"><F /></Panel>
        {list.map((t) => <Panel key={t.id} title={t.name}><F t={t} /></Panel>)}
      </div>
    </div>
  );
}
