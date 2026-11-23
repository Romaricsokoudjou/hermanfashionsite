import { getCentres } from "@/lib/data";
import { deleteCentreAction, saveCentreAction } from "@/app/actions/admin";
import { AdminHeader, Area, ImageField, Input, Panel, Toggle } from "@/components/admin-ui";
import { SubmitButton } from "@/components/SubmitButton";
import type { Centre } from "@/db/schema";

export const metadata = { title: "Centres" };

function CentreForm({ c }: { c?: Centre }) {
  return (
    <form action={saveCentreAction} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="id" value={c?.id ?? 0} />
      <Input label="Nom" name="name" defaultValue={c?.name} required />
      <Input label="Ville" name="city" defaultValue={c?.city ?? "Douala, Cameroun"} />
      <Input label="Adresse" name="address" defaultValue={c?.address} required className="md:col-span-2" />
      <Input label="Recherche carte (Google Maps)" name="mapQuery" defaultValue={c?.mapQuery} hint="Texte ou coordonnées GPS (ex : 4.0511,9.7085) pour la carte et l'itinéraire." className="md:col-span-2" />
      <Input label="Téléphone" name="phone" defaultValue={c?.phone} />
      <Input label="Horaires" name="hours" defaultValue={c?.hours} />
      <Area label="Présentation" name="description" defaultValue={c?.description} rows={3} className="md:col-span-2" />
      <div className="md:col-span-2"><ImageField label="Photo du centre (sinon la carte est affichée)" name="image" defaultValue={c?.image} /></div>
      <Input label="Ordre" name="sortOrder" type="number" defaultValue={c?.sortOrder ?? 0} />
      <div className="flex items-end justify-between gap-3">
        <Toggle label="Publié" name="published" defaultChecked={c?.published ?? true} />
        <SubmitButton className="btn-dark btn-sm">{c ? "Enregistrer" : "Ajouter"}</SubmitButton>
      </div>
    </form>
  );
}

export default async function AdminCentres() {
  const list = await getCentres(false);
  return (
    <div>
      <AdminHeader title="Centres de formation" />
      <div className="space-y-6">
        {list.map((c) => (
          <Panel key={c.id} title={c.name} actions={
            <form action={deleteCentreAction}><input type="hidden" name="id" value={c.id} /><SubmitButton className="btn-ghost btn-sm text-red-600" confirm="Supprimer ce centre ?">Supprimer</SubmitButton></form>
          }>
            <CentreForm c={c} />
          </Panel>
        ))}
        <Panel title="Ajouter un centre"><CentreForm /></Panel>
      </div>
    </div>
  );
}
