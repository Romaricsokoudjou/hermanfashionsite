"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Item = { id: number; url: string; title: string; category: string };

function Img({ src, alt, sizes, className }: { src: string; alt: string; sizes: string; className?: string }) {
  if (src.startsWith("/images/")) return <Image src={src} alt={alt} fill sizes={sizes} className={clsx("object-cover", className)} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" className={clsx("absolute inset-0 h-full w-full object-cover", className)} />;
}

export function GalleryGrid({ items }: { items: Item[] }) {
  const cats = ["Tout", ...Array.from(new Set(items.map((i) => i.category)))];
  const [cat, setCat] = useState("Tout");
  const [idx, setIdx] = useState<number | null>(null);
  const list = cat === "Tout" ? items : items.filter((i) => i.category === cat);

  const move = useCallback((d: number) => setIdx((i) => (i === null ? null : (i + d + list.length) % list.length)), [list.length]);
  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIdx(null);
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [idx, move]);

  return (
    <>
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-2">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={clsx("shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all", cat === c ? "bg-ink text-white" : "border border-line bg-white text-ink-soft hover:border-brand-300 hover:text-brand-700")}>
            {c}
            <span className="ml-2 text-xs opacity-60">{c === "Tout" ? items.length : items.filter((i) => i.category === c).length}</span>
          </button>
        ))}
      </div>
      <div className="mt-8 columns-2 gap-3 md:columns-3 lg:columns-4 [&>*]:mb-3">
        {list.map((it, i) => (
          <button key={it.id} onClick={() => setIdx(i)} className={clsx("group relative block w-full overflow-hidden rounded-[1.2rem] bg-sand", i % 5 === 0 ? "aspect-[3/4]" : i % 3 === 0 ? "aspect-square" : "aspect-[4/3]")} aria-label={`Agrandir : ${it.title}`}>
            <Img src={it.url} alt={it.title || "Herman FASHION"} sizes="(min-width:1024px) 25vw, 50vw" className="transition-transform duration-[1.2s] group-hover:scale-105" />
            <span className="absolute inset-0 bg-gradient-to-t from-night/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            {it.title && <span className="absolute bottom-3 left-4 right-4 translate-y-2 text-left text-xs font-semibold text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">{it.title}</span>}
          </button>
        ))}
      </div>

      {idx !== null && list[idx] && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-night/95 p-4" onClick={() => setIdx(null)} role="dialog" aria-modal="true">
          <button className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Fermer"><X className="h-5 w-5" /></button>
          <button onClick={(e) => { e.stopPropagation(); move(-1); }} className="absolute left-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 md:left-8" aria-label="Précédente"><ChevronLeft className="h-6 w-6" /></button>
          <div className="relative h-[80vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {list[idx].url.startsWith("/images/") ? (
              <Image src={list[idx].url} alt={list[idx].title} fill sizes="100vw" className="object-contain" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={list[idx].url} alt={list[idx].title} className="h-full w-full object-contain" />
            )}
          </div>
          <button onClick={(e) => { e.stopPropagation(); move(1); }} className="absolute right-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 md:right-8" aria-label="Suivante"><ChevronRight className="h-6 w-6" /></button>
          <p className="absolute bottom-6 left-0 right-0 text-center text-sm text-white/70">{list[idx].title} · {idx + 1}/{list.length}</p>
        </div>
      )}
    </>
  );
}
