import Link from "next/link";

export default function NotFound() {
  return (
    <section className="bg-ivory py-28 text-center">
      <div className="container-x">
        <p className="font-display text-8xl italic text-brand-300">404</p>
        <h1 className="h-display mt-4 text-4xl">Cette page n&apos;existe pas</h1>
        <p className="mt-3 text-ink-soft">Elle a peut-être été déplacée. Revenez à l&apos;accueil ou explorez nos formations.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn btn-dark">Accueil</Link>
          <Link href="/formations" className="btn btn-ghost">Nos formations</Link>
        </div>
      </div>
    </section>
  );
}
