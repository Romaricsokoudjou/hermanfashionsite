"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ArrowUp, Loader2, RotateCcw, Sparkles, X } from "lucide-react";
import { AuthPrompt } from "./AuthPrompt";
import { Monogram } from "./Logo";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = ["Quelles formations proposez-vous ?", "Combien coûte la formation de 6 mois ?", "Comment payer ma formation ?", "Où se trouvent vos centres ?"];

/** Rendu léger : **gras**, listes et liens internes (/formations…) cliquables. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*|\/[a-z][a-z0-9\-/]*)/g);
        return (
          <p key={i} className={clsx(line.trim() === "" ? "h-2" : "", /^\s*[-•]/.test(line) && "pl-3")}>
            {parts.map((p, j) =>
              p.startsWith("**") ? (
                <strong key={j} className="font-semibold text-ink">{p.slice(2, -2)}</strong>
              ) : /^\/[a-z]/.test(p) ? (
                <Link key={j} href={p} className="font-semibold text-brand-700 underline decoration-brand-300 underline-offset-2">{p}</Link>
              ) : (
                <span key={j}>{p}</span>
              ),
            )}
          </p>
        );
      })}
    </>
  );
}

export function HermanAI({ loggedIn, firstName }: { loggedIn: boolean; firstName?: string }) {
  const [open, setOpen] = useState(false);
  const [gate, setGate] = useState(false);
  const [hint, setHint] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setHint(true), 4000);
    const t2 = setTimeout(() => setHint(false), 12000);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (open && loggedIn && !loaded) {
      fetch("/api/assistant")
        .then((r) => r.json())
        .then((d) => setMessages(d.messages || []))
        .finally(() => setLoaded(true));
    }
  }, [open, loggedIn, loaded]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy, open]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setError("");
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setBusy(true);
    try {
      const r = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: q }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Une erreur est survenue.");
      setMessages((m) => [...m, { role: "assistant", content: d.answer }]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    await fetch("/api/assistant", { method: "DELETE" });
    setMessages([]);
  }

  function toggle() {
    setHint(false);
    if (!loggedIn) return setGate(true);
    setOpen((v) => !v);
  }

  return (
    <>
      {/* Bouton flottant animé */}
      <div className="fixed bottom-5 right-5 z-50 md:bottom-7 md:right-7">
        <div className={clsx("pointer-events-none absolute bottom-full right-0 mb-3 w-max max-w-[220px] rounded-2xl rounded-br-md bg-white px-4 py-2.5 text-[0.82rem] text-ink shadow-lift ring-1 ring-line transition-all duration-500", hint && !open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0")}>
          <span className="font-semibold text-brand-700">HERMAN AI</span> · Une question sur nos formations ?
        </div>
        <button onClick={toggle} aria-label={open ? "Fermer HERMAN AI" : "Ouvrir l'assistant HERMAN AI"} className="group relative flex h-[58px] w-[58px] items-center justify-center rounded-full">
          {!open && <span className="absolute inset-0 rounded-full bg-brand-400 animate-pulse-ring" />}
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 shadow-glow transition-transform duration-500 group-hover:scale-105" />
          <span className="absolute inset-[3px] rounded-full border border-white/40" />
          {open ? <X className="relative h-6 w-6 text-white" /> : <Sparkles className="relative h-6 w-6 text-white transition-transform duration-500 group-hover:rotate-12" />}
        </button>
      </div>

      {/* Fenêtre de conversation */}
      <div
        className={clsx(
          "fixed z-50 flex flex-col overflow-hidden bg-white shadow-lift ring-1 ring-line transition-all duration-500",
          "inset-x-3 bottom-[88px] top-20 rounded-[1.6rem] sm:inset-x-auto sm:right-7 sm:top-auto sm:h-[min(600px,calc(100vh-140px))] sm:w-[390px]",
          open ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible translate-y-4 opacity-0",
        )}
        role="dialog"
        aria-label="Assistant HERMAN AI"
      >
        <div className="relative overflow-hidden bg-night px-5 py-4 text-white">
          <div className="absolute -right-10 -top-14 h-36 w-36 rounded-full bg-brand-500/50 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white p-1">
              <Monogram className="h-full w-full" />
              <Sparkles className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-brand-500 p-0.5 text-white" />
            </span>
            <div className="flex-1">
              <p className="font-display text-xl leading-none tracking-wide">HERMAN AI</p>
              <p className="mt-1 flex items-center gap-1.5 text-[0.72rem] text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Assistant officiel · informations vérifiées
              </p>
            </div>
            {messages.length > 0 && (
              <button onClick={reset} title="Nouvelle conversation" className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white">
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-ivory px-4 py-5 text-[0.9rem] leading-relaxed">
          <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-white p-3.5 text-ink-soft shadow-soft ring-1 ring-line">
            Bonjour{firstName ? ` ${firstName}` : ""} ! Je suis <strong className="text-ink">HERMAN AI</strong>. Je réponds à vos questions sur nos formations, tarifs, inscriptions, paiements et centres.
          </div>
          {messages.map((m, i) => (
            <div key={i} className={clsx("flex", m.role === "user" && "justify-end")}>
              <div className={clsx("max-w-[88%] space-y-1 rounded-2xl p-3.5", m.role === "user" ? "rounded-tr-md bg-gradient-to-br from-brand-500 to-brand-700 text-white" : "rounded-tl-md bg-white text-ink-soft shadow-soft ring-1 ring-line")}>
                {m.role === "user" ? m.content : <Rich text={m.content} />}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex w-16 items-center justify-center gap-1 rounded-2xl rounded-tl-md bg-white p-3.5 ring-1 ring-line">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          )}
          {messages.length === 0 && loaded && (
            <div className="flex flex-wrap gap-2 pt-1">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-left text-[0.8rem] text-brand-800 transition-colors hover:bg-brand-50">
                  {s}
                </button>
              ))}
            </div>
          )}
          {error && <p className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-end gap-2 border-t border-line bg-white p-3"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="Posez votre question…"
            className="max-h-28 min-h-[44px] flex-1 resize-none rounded-2xl border border-line bg-ivory px-4 py-2.5 text-[0.9rem] focus:border-brand-400 focus:outline-none"
          />
          <button type="submit" disabled={busy || !input.trim()} aria-label="Envoyer" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-colors hover:bg-brand-600 disabled:opacity-40">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          </button>
        </form>
      </div>

      <AuthPrompt
        open={gate}
        onClose={() => setGate(false)}
        title="Discutez avec HERMAN AI"
        text="Connectez-vous ou créez votre compte gratuit pour poser vos questions à notre assistant intelligent et être guidé pas à pas vers votre inscription."
      />
    </>
  );
}
