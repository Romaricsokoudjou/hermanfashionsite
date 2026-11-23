import { Media } from "./Media";
import { FullLogo } from "./Logo";

export function AuthShell({ title, text, image, children }: { title: React.ReactNode; text: string; image: string; children: React.ReactNode }) {
  return (
    <section className="bg-ivory">
      <div className="container-x grid min-h-[calc(100vh-8rem)] items-center gap-12 py-10 lg:grid-cols-[.9fr_1.1fr] lg:py-16">
        <div className="relative hidden h-full min-h-[560px] overflow-hidden rounded-[2rem] lg:block">
          <Media src={image} alt="" sizes="45vw" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white">
            <p className="font-display text-4xl leading-tight">Révélez votre talent.<br />Construisez votre avenir.</p>
            <p className="mt-3 text-sm text-white/70">CFP Herman FASHION · Douala</p>
          </div>
        </div>
        <div className="fade-up mx-auto w-full max-w-xl">
          <FullLogo className="mb-6 w-24" priority />
          <h1 className="h-display text-[2.6rem] sm:text-[3.2rem]">{title}</h1>
          <p className="mt-3 text-ink-soft">{text}</p>
          <div className="card mt-8 p-6 sm:p-9">{children}</div>
        </div>
      </div>
    </section>
  );
}
