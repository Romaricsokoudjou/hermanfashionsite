"use client";

import { useActionState, useMemo, useState } from "react";
import clsx from "clsx";
import { Check, Info } from "lucide-react";
import { createEnrollmentAction } from "@/app/actions/learner";
import { SubmitButton } from "./SubmitButton";
import { FormMessage } from "./forms";
import { fcfa } from "@/lib/format";

type F = { id: number; slug: string; title: string; planIds: number[] };
type P = { id: number; label: string; price: number; registrationFee: number; diploma: string; installments: number[] };
type C = { id: number; name: string };

export function EnrollForm({ formations, plans, centres, initialSlug, instructions }: { formations: F[]; plans: P[]; centres: C[]; initialSlug?: string; instructions: string }) {
  const [state, action] = useActionState(createEnrollmentAction, undefined);
  const [fid, setFid] = useState<number>(formations.find((f) => f.slug === initialSlug)?.id ?? 0);
  const [pid, setPid] = useState<number>(0);
  const [mode, setMode] = useState<"tranches" | "unique">("tranches");
  const formation = formations.find((f) => f.id === fid);
  const confirmed = !!formation && formation.planIds.length > 0;
  const available = useMemo(() => (confirmed ? plans.filter((p) => formation!.planIds.includes(p.id)) : plans), [confirmed, formation, plans]);
  const plan = available.find((p) => p.id === pid);

  return (
    <form action={action} className="grid gap-8 xl:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        <FormMessage state={state} />
        <fieldset>
          <legend className="font-display text-2xl">1. Choisissez votre formation</legend>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {formations.map((f) => (
              <label key={f.id} className={clsx("flex cursor-pointer items-center gap-3 rounded-2xl border bg-white p-4 text-sm font-semibold transition-all", fid === f.id ? "border-brand-500 ring-4 ring-brand-100" : "border-line hover:border-brand-300")}>
                <input type="radio" name="formationId" value={f.id} checked={fid === f.id} onChange={() => { setFid(f.id); setPid(0); }} className="sr-only" />
                <span className={clsx("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", fid === f.id ? "border-brand-500 bg-brand-500 text-white" : "border-line")}>{fid === f.id && <Check className="h-3 w-3" />}</span>
                {f.title}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset disabled={!formation} className={clsx(!formation && "opacity-50")}>
          <legend className="font-display text-2xl">2. Choisissez la durée</legend>
          {formation && !confirmed && (
            <p className="mt-3 flex gap-2 rounded-xl bg-brand-50 p-3 text-sm text-brand-900"><Info className="mt-0.5 h-4 w-4 shrink-0" /> Les durées proposées pour cette spécialité seront confirmées par la direction lors du traitement de votre demande.</p>
          )}
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {available.map((p) => (
              <label key={p.id} className={clsx("cursor-pointer rounded-2xl border bg-white p-5 transition-all", pid === p.id ? "border-brand-500 ring-4 ring-brand-100" : "border-line hover:border-brand-300")}>
                <input type="radio" name="planId" value={p.id} checked={pid === p.id} onChange={() => setPid(p.id)} className="sr-only" />
                <p className="text-xs font-bold uppercase tracking-wider text-brand-700">{p.diploma}</p>
                <p className="mt-1 font-semibold">{p.label}</p>
                <p className="mt-2 font-display text-2xl">{fcfa(p.price)}</p>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset disabled={!plan} className={clsx(!plan && "opacity-50")}>
          <legend className="font-display text-2xl">3. Modalités</legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ["tranches", "Paiement en tranches", plan ? plan.installments.map((a) => fcfa(a)).join(" + ") : "3 versements"],
              ["unique", "Paiement en une fois", plan ? fcfa(plan.price) : "Totalité en une seule fois"],
            ].map(([v, t, d]) => (
              <label key={v} className={clsx("cursor-pointer rounded-2xl border bg-white p-4 transition-all", mode === v ? "border-brand-500 ring-4 ring-brand-100" : "border-line")}>
                <input type="radio" name="paymentMode" value={v} checked={mode === v} onChange={() => setMode(v as "tranches" | "unique")} className="sr-only" />
                <p className="font-semibold">{t}</p>
                <p className="mt-1 text-xs text-ink-soft">{d}</p>
              </label>
            ))}
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="centreId">Centre souhaité</label>
              <select id="centreId" name="centreId" className="field" defaultValue="">
                <option value="">Sans préférence</option>
                {centres.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="message">Message à la direction (facultatif)</label>
              <textarea id="message" name="message" rows={3} className="field !min-h-[5rem]" placeholder="Disponibilités, questions…" />
            </div>
          </div>
        </fieldset>
      </div>

      <aside className="xl:sticky xl:top-28 xl:self-start">
        <div className="overflow-hidden rounded-[1.6rem] bg-night text-white shadow-lift">
          <div className="p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-300">Récapitulatif financier</p>
            <p className="mt-3 font-display text-2xl">{formation?.title || "Choisissez une formation"}</p>
            <p className="text-sm text-white/60">{plan ? `${plan.label} · ${plan.diploma}` : "Durée à sélectionner"}</p>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-white/65">Inscription et polo</dt><dd>{fcfa(plan?.registrationFee ?? 10000)}</dd></div>
              <div className="flex justify-between"><dt className="text-white/65">Formation</dt><dd>{plan ? fcfa(plan.price) : "—"}</dd></div>
              <div className="flex justify-between border-t border-white/10 pt-3 text-base font-semibold"><dt>Total</dt><dd className="text-brand-300">{plan ? fcfa(plan.price + plan.registrationFee) : "—"}</dd></div>
            </dl>
            {plan && mode === "tranches" && (
              <ul className="mt-5 space-y-1.5 rounded-xl bg-white/5 p-4 text-xs text-white/70">
                <li className="flex justify-between"><span>À l&apos;inscription</span><span>{fcfa(plan.registrationFee)}</span></li>
                {plan.installments.map((a, i) => <li key={i} className="flex justify-between"><span>Tranche {i + 1}</span><span>{fcfa(a)}</span></li>)}
              </ul>
            )}
          </div>
          <div className="border-t border-white/10 bg-white/5 p-6">
            <p className="text-xs leading-relaxed text-white/65">{instructions}</p>
            <label className="mt-4 flex cursor-pointer items-start gap-3 text-xs text-white/80">
              <input type="checkbox" name="accept" required className="mt-0.5 h-4 w-4 accent-[#f47a20]" />
              J&apos;ai compris que le règlement s&apos;effectue en espèces auprès de la direction et que mon inscription est validée par l&apos;administration.
            </label>
            <SubmitButton className="btn-primary mt-5 w-full" pendingText="Envoi de la demande…">Soumettre ma demande</SubmitButton>
          </div>
        </div>
      </aside>
    </form>
  );
}
