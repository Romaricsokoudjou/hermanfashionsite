import { asc, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { media } from "@/db/schema";
import { addVideoLinkAction, updateMediaAction, uploadMediaAction } from "@/app/actions/admin";
import { AdminHeader, Input, Panel } from "@/components/admin-ui";
import { SubmitButton } from "@/components/SubmitButton";

export const metadata = { title: "Photos & vidéos" };

const SLOTS = [["presentation", "Présentation de Herman FASHION"], ["immersion", "Immersion dans les formations"], ["temoignages", "Réalisations et témoignages"]];

export default async function AdminGalerie() {
  const db = await getDb();
  const items = await db.select().from(media).orderBy(asc(media.sortOrder), desc(media.id));
  const images = items.filter((i) => i.type === "image");
  const videos = items.filter((i) => i.type === "video");
  const cats = Array.from(new Set(images.map((i) => i.category)));
  return (
    <div>
      <AdminHeader title="Photos & vidéos" text="Utilisez uniquement des médias fournis ou validés par l'établissement." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Ajouter des photos ou vidéos (fichiers)">
          <form action={uploadMediaAction} className="space-y-4">
            <input type="file" name="files" multiple accept="image/*,video/mp4,video/webm,video/quicktime" required className="block w-full rounded-xl border border-dashed border-line p-4 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-800" />
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Légende" name="title" />
              <div>
                <label className="field-label">Catégorie (photos)</label>
                <input name="category" list="cats" defaultValue="Travaux pratiques" className="field !min-h-[2.75rem] !py-2 text-sm" />
                <datalist id="cats">{[...cats, "Locaux", "Équipements", "Réalisations", "Événements"].map((c) => <option key={c} value={c} />)}</datalist>
              </div>
              <div>
                <label className="field-label">Rubrique (vidéos)</label>
                <select name="slot" className="field !min-h-[2.75rem] !py-2 text-sm">{SLOTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              </div>
            </div>
            <SubmitButton pendingText="Envoi en cours…">Téléverser</SubmitButton>
          </form>
        </Panel>
        <Panel title="Ajouter une vidéo par lien (YouTube, Facebook, TikTok)">
          <form action={addVideoLinkAction} className="space-y-4">
            <Input label="Lien de la vidéo" name="url" required placeholder="https://…" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Titre" name="title" />
              <div>
                <label className="field-label">Rubrique</label>
                <select name="slot" className="field !min-h-[2.75rem] !py-2 text-sm">{SLOTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              </div>
            </div>
            <SubmitButton className="btn-dark">Ajouter la vidéo</SubmitButton>
          </form>
        </Panel>
      </div>

      {videos.length > 0 && (
        <Panel title={`Vidéos (${videos.length})`} className="mt-6">
          <ul className="divide-y divide-line">
            {videos.map((v) => (
              <li key={v.id} className="py-3">
                <form action={updateMediaAction} className="grid items-end gap-3 md:grid-cols-[2fr_1.5fr_80px_auto_auto]">
                  <input type="hidden" name="id" value={v.id} />
                  <input type="hidden" name="category" value={v.category} />
                  <div><p className="truncate text-xs text-ink-mute">{v.url}</p><input name="title" defaultValue={v.title} placeholder="Titre" className="field !min-h-[2.4rem] !py-1.5 text-sm" /></div>
                  <select name="slot" defaultValue={v.slot} className="field !min-h-[2.4rem] !py-1.5 text-sm">{SLOTS.map(([val, l]) => <option key={val} value={val}>{l}</option>)}</select>
                  <input name="sortOrder" type="number" defaultValue={v.sortOrder} className="field !min-h-[2.4rem] !py-1.5 text-sm" />
                  <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="published" defaultChecked={v.published} /> Publiée</label>
                  <div className="flex gap-2"><SubmitButton className="btn-dark btn-sm">OK</SubmitButton><SubmitButton className="btn-ghost btn-sm text-red-600" name="op" value="delete" confirm="Supprimer cette vidéo ?">Suppr.</SubmitButton></div>
                </form>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel title={`Photos (${images.length})`} className="mt-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {images.map((m) => (
            <form key={m.id} action={updateMediaAction} className={`overflow-hidden rounded-xl border border-line ${m.published ? "" : "opacity-60"}`}>
              <input type="hidden" name="id" value={m.id} />
              <input type="hidden" name="slot" value="" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt="" loading="lazy" className="h-40 w-full object-cover" />
              <div className="space-y-2 p-3">
                <input name="title" defaultValue={m.title} placeholder="Légende" className="field !min-h-[2.2rem] !py-1 text-xs" />
                <div className="flex gap-2">
                  <input name="category" defaultValue={m.category} list="cats" className="field !min-h-[2.2rem] flex-1 !py-1 text-xs" />
                  <input name="sortOrder" type="number" defaultValue={m.sortOrder} className="field !min-h-[2.2rem] w-16 !py-1 text-xs" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" name="published" defaultChecked={m.published} /> Publiée</label>
                  <div className="flex gap-1">
                    <SubmitButton className="btn-dark btn-sm !h-8 !px-3 text-xs">OK</SubmitButton>
                    <SubmitButton className="btn-ghost btn-sm !h-8 !px-3 text-xs text-red-600" name="op" value="delete" confirm="Supprimer cette photo ?">×</SubmitButton>
                  </div>
                </div>
              </div>
            </form>
          ))}
        </div>
      </Panel>
    </div>
  );
}
