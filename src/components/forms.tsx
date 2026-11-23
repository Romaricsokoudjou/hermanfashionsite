"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { loginAction, registerAction, updateProfileAction, changePasswordAction, type FormState } from "@/app/actions/auth";
import { startConversationAction } from "@/app/actions/learner";
import { SubmitButton } from "./SubmitButton";

export function FormMessage({ state }: { state: FormState }) {
  if (!state?.error && !state?.ok) return null;
  const ok = !!state.ok;
  return (
    <div role="alert" className={`flex items-start gap-2.5 rounded-xl p-3.5 text-sm ${ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
      {ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
      {state.ok || state.error}
    </div>
  );
}

function Password({ name, label, autoComplete }: { name: string; label: string; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="field-label" htmlFor={name}>{label}</label>
      <div className="relative">
        <input id={name} name={name} type={show ? "text" : "password"} required minLength={name === "current" ? 1 : 8} autoComplete={autoComplete} className="field pr-12" />
        <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-mute hover:text-ink" aria-label={show ? "Masquer" : "Afficher"}>
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function Field({ name, label, type = "text", defaultValue, autoComplete, placeholder, required = true }: { name: string; label: string; type?: string; defaultValue?: string; autoComplete?: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="field-label" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} required={required} defaultValue={defaultValue} autoComplete={autoComplete} placeholder={placeholder} className="field" />
    </div>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next || ""} />
      <FormMessage state={state} />
      <Field name="email" label="Adresse e-mail" type="email" autoComplete="email" defaultValue={state?.fields?.email} placeholder="vous@exemple.com" />
      <Password name="password" label="Mot de passe" autoComplete="current-password" />
      <SubmitButton className="btn-primary w-full" pendingText="Connexion…">Se connecter</SubmitButton>
      <p className="text-center text-sm text-ink-soft">
        Pas encore de compte ? <Link href={`/inscription${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand-700">Créer mon compte</Link>
      </p>
      <p className="text-center text-xs text-ink-mute">Mot de passe oublié ? Contactez la direction de Herman FASHION pour le réinitialiser.</p>
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const [state, action] = useActionState(registerAction, undefined);
  const f = state?.fields || {};
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next || ""} />
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="lastName" label="Nom" autoComplete="family-name" defaultValue={f.lastName} />
        <Field name="firstName" label="Prénom" autoComplete="given-name" defaultValue={f.firstName} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="phone" label="Téléphone" type="tel" autoComplete="tel" defaultValue={f.phone} placeholder="+237 6XX XX XX XX" />
        <Field name="email" label="Adresse e-mail" type="email" autoComplete="email" defaultValue={f.email} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="country" label="Pays" autoComplete="country-name" defaultValue={f.country || "Cameroun"} />
        <Field name="city" label="Ville" autoComplete="address-level2" defaultValue={f.city || "Douala"} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Password name="password" label="Mot de passe (8 caractères min.)" autoComplete="new-password" />
        <Password name="confirm" label="Confirmation du mot de passe" autoComplete="new-password" />
      </div>
      <SubmitButton className="btn-primary w-full" pendingText="Création du compte…">Créer mon compte</SubmitButton>
      <p className="text-center text-sm text-ink-soft">
        Déjà inscrit ? <Link href={`/connexion${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand-700">Se connecter</Link>
      </p>
    </form>
  );
}

export function ContactForm({ defaultSubject = "" }: { defaultSubject?: string }) {
  const [state, action] = useActionState(startConversationAction, undefined);
  return (
    <form action={action} className="space-y-5">
      <FormMessage state={state} />
      <div>
        <label className="field-label" htmlFor="subject">Objet</label>
        <select id="subject" name="subject" defaultValue={defaultSubject || "Renseignements sur les formations"} className="field">
          {["Renseignements sur les formations", "Mon inscription", "Mes paiements", "Conditions d'admission", "Autre demande"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="field-label" htmlFor="body">Votre message</label>
        <textarea id="body" name="body" required minLength={5} rows={6} className="field" placeholder="Bonjour, je souhaite…" />
      </div>
      <SubmitButton className="btn-primary w-full sm:w-auto" pendingText="Envoi…">Envoyer à la direction</SubmitButton>
    </form>
  );
}

export function ProfileForm({ user }: { user: { lastName: string; firstName: string; phone: string; country: string; city: string; email: string } }) {
  const [state, action] = useActionState(updateProfileAction, undefined);
  return (
    <form action={action} className="space-y-5">
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="lastName" label="Nom" defaultValue={user.lastName} />
        <Field name="firstName" label="Prénom" defaultValue={user.firstName} />
        <Field name="phone" label="Téléphone" type="tel" defaultValue={user.phone} />
        <div>
          <label className="field-label">Adresse e-mail</label>
          <input value={user.email} disabled className="field bg-ivory text-ink-mute" />
        </div>
        <Field name="country" label="Pays" defaultValue={user.country} />
        <Field name="city" label="Ville" defaultValue={user.city} />
      </div>
      <SubmitButton className="btn-dark" pendingText="Enregistrement…">Enregistrer</SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePasswordAction, undefined);
  return (
    <form action={action} className="space-y-5">
      <FormMessage state={state} />
      <Password name="current" label="Mot de passe actuel" autoComplete="current-password" />
      <div className="grid gap-5 sm:grid-cols-2">
        <Password name="password" label="Nouveau mot de passe" autoComplete="new-password" />
        <Password name="confirm" label="Confirmation" autoComplete="new-password" />
      </div>
      <SubmitButton className="btn-ghost" pendingText="Modification…">Modifier le mot de passe</SubmitButton>
    </form>
  );
}
