import { getPlans } from "@/lib/data";
import { savePlanAction } from "@/app/actions/admin";
import { AdminHeader, Area, Input, Panel, Toggle } from "@/components/admin-ui";
import { SubmitButton } from "@/components/SubmitButton";
import type { Plan } from "@/db/schema";

export const metadata = { title: "Tarifs & durées" };

function PlanForm({ p }: { p?: Plan }) {
  return (
    <form action={savePlanAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <input type="hidden" name="id" value={p?.id ?? 0} />
      <Input label="Libellé" name="label" defaultValue={p?.label} required className="lg:col-span-2" />
      <Input label="Durée (mois)" name="durationMonths" type="number" defaultValue={p?.durationMonths} required />
      <Input label="Diplôme indiqué" name="diploma" defaultValue={p?.diploma} />
      <Input label="Prix formation (FCFA)" name="price" type="number" defaultValue={p?.price} required />
      <Input label="Inscription & polo (FCFA)" name="registrationFee" type="number" defaultValue={p?.registrationFee ?? 10000} required />
      <Input label="Tranches (séparées par +)" name="installments" defaultValue={p?.installments.join(" + ")} placeholder="100000 + 30000 + 20000" className="lg:col-span-2" />
      <Area label="Description (facultatif)" name="description" defaultValue={p?.description} rows={2} className="sm:col-span-2 lg:col-span-3" />
      <Input label="Ordre" name="sortOrder" type="number" defaultValue={p?.sortOrder ?? 0} />
      <div className="flex items-center justify-between gap-4 sm:col-span-2 lg:col-span-4">
        <Toggle label="Actif (proposé aux candidats)" name="active" defaultChecked={p?.active ?? true} />
        <SubmitButton className="btn-dark btn-sm">{p ? "Enregistrer" : "Ajouter ce parcours"}</SubmitButton>
      </div>
    </form>
  );
}

export default async function AdminTarifs() {
  const plans = await getPlans(false);
  return (
    <div>
      <AdminHeader title="Tarifs & durées" text="Grille officielle. Toute modification s'applique aux nouvelles demandes ; les inscriptions existantes conservent le tarif accepté." />
      <div className="space-y-6">
        {plans.map((p) => (
          <Panel key={p.id} title={p.label}><PlanForm p={p} /></Panel>
        ))}
        <Panel title="Ajouter un parcours"><PlanForm /></Panel>
      </div>
    </div>
  );
}
