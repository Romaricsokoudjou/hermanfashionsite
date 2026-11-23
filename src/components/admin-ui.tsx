import clsx from "clsx";

export function AdminHeader({ title, text, children }: { title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-4xl text-ink">{title}</h1>
        {text && <p className="mt-1.5 max-w-2xl text-sm text-ink-soft">{text}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Panel({ title, children, className, actions }: { title?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={clsx("rounded-2xl border border-line bg-white p-5 shadow-soft md:p-6", className)}>
      {(title || actions) && (
        <div className="mb-5 flex items-center justify-between gap-3">
          {title && <h2 className="text-base font-bold text-ink">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Input({ label, name, defaultValue, type = "text", required, placeholder, hint, className }: { label: string; name: string; defaultValue?: string | number | null; type?: string; required?: boolean; placeholder?: string; hint?: string; className?: string }) {
  return (
    <div className={className}>
      <label className="field-label" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} required={required} defaultValue={defaultValue ?? ""} placeholder={placeholder} className="field !min-h-[2.75rem] !py-2 text-sm" />
      {hint && <p className="mt-1 text-xs text-ink-mute">{hint}</p>}
    </div>
  );
}

export function Area({ label, name, defaultValue, rows = 4, hint, placeholder, className }: { label: string; name: string; defaultValue?: string | null; rows?: number; hint?: string; placeholder?: string; className?: string }) {
  return (
    <div className={className}>
      <label className="field-label" htmlFor={name}>{label}</label>
      <textarea id={name} name={name} rows={rows} defaultValue={defaultValue ?? ""} placeholder={placeholder} className="field !min-h-0 text-sm" />
      {hint && <p className="mt-1 text-xs text-ink-mute">{hint}</p>}
    </div>
  );
}

export function Toggle({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium text-ink">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative h-6 w-11 rounded-full bg-line transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-brand-500 peer-checked:after:translate-x-5" />
      {label}
    </label>
  );
}

export function ImageField({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string | null }) {
  return (
    <div className="rounded-xl border border-dashed border-line p-4">
      <p className="field-label">{label}</p>
      <div className="flex items-start gap-4">
        {defaultValue ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={defaultValue} alt="" className="h-20 w-28 shrink-0 rounded-lg object-cover" />
        ) : (
          <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg bg-sand text-xs text-ink-mute">Aucune</div>
        )}
        <div className="flex-1 space-y-2">
          <input type="file" name={`${name}File`} accept="image/*" className="block w-full text-xs file:mr-3 file:rounded-full file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-800" />
          <input name={name} defaultValue={defaultValue ?? ""} placeholder="ou URL / chemin de l'image" className="field !min-h-[2.3rem] !py-1.5 text-xs" />
        </div>
      </div>
    </div>
  );
}

export function Kpi({ label, value, hint, tone = "default" }: { label: string; value: string; hint?: string; tone?: "default" | "brand" | "dark" }) {
  return (
    <div className={clsx("rounded-2xl p-5", tone === "dark" ? "bg-night text-white" : tone === "brand" ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white" : "border border-line bg-white shadow-soft")}>
      <p className={clsx("text-xs font-semibold uppercase tracking-wider", tone === "default" ? "text-ink-mute" : "text-white/70")}>{label}</p>
      <p className="mt-2 font-display text-[2.1rem] leading-none">{value}</p>
      {hint && <p className={clsx("mt-2 text-xs", tone === "default" ? "text-ink-mute" : "text-white/70")}>{hint}</p>}
    </div>
  );
}
