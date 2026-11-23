import Link from "next/link";
import { getFormationPlanMap, getFormations, getPlans } from "@/lib/data";
import { AdminHeader, Panel } from "@/components/admin-ui";

export const metadata = { title: "Formations" };

export default async function AdminFormations() {
  const [list, plans, map] = await Promise.all([getFormations(false), getPlans(false), getFormationPlanMap()]);
  return (
    <div>
      <AdminHeader title="Formations" text="Contenus, photos, durées disponibles et publication de chaque spécialité.">
        <Link href="/admin/formations/nouvelle" className="btn btn-primary btn-sm">Ajouter une formation</Link>
      </AdminHeader>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((f) => {
          const ids = map.get(f.id) || [];
          return (
            <Panel key={f.id} className="!p-0 overflow-hidden">
              <Link href={`/admin/formations/${f.id}`} className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {f.image ? <img src={f.image} alt="" className="h-36 w-full object-cover" /> : <div className="h-36 bg-sand" />}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display text-2xl">{f.title}</p>
                    {!f.published && <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs">Masquée</span>}
                  </div>
                  <p className="mt-2 text-xs text-ink-mute">
                    {ids.length ? `Durées : ${plans.filter((p) => ids.includes(p.id)).map((p) => p.label.replace("Formation de ", "")).join(", ")}` : "⚠ Durées non confirmées — à cocher"}
                  </p>
                  <p className="mt-1 text-xs text-ink-mute">{f.objectives || f.content ? "Programme renseigné" : "Programme détaillé à compléter"}</p>
                </div>
              </Link>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
