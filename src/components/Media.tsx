import Image from "next/image";
import clsx from "clsx";

/** Image optimisée pour les photos du site, simple <img> pour les médias envoyés via l'administration. */
export function Media({
  src,
  alt,
  className,
  sizes = "100vw",
  priority,
  fill = true,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
}) {
  if (!src) {
    return <div className={clsx("bg-gradient-to-br from-brand-100 via-brand-50 to-sand", fill && "absolute inset-0", className)} aria-hidden />;
  }
  if (src.startsWith("/images/")) {
    return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={clsx("object-cover", className)} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} className={clsx("object-cover", fill && "absolute inset-0 h-full w-full", className)} />;
}
