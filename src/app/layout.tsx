import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource/cormorant-garamond/latin-500.css";
import "@fontsource/cormorant-garamond/latin-600.css";
import "@fontsource/cormorant-garamond/latin-500-italic.css";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "HERMAN FASHION — Centre de formation aux métiers de la beauté à Douala",
    template: "%s · HERMAN FASHION",
  },
  description:
    "CFP Herman FASHION, centre de formation professionnelle aux métiers de la beauté et du bien-être à Douala : coiffure, onglerie, esthétique bio, make-up, massage, pédicure-manucure, extension de cils, microblading et microshading.",
  keywords: [
    "formation beauté Douala",
    "école d'esthétique Cameroun",
    "formation coiffure Douala",
    "formation onglerie Douala",
    "formation make-up Cameroun",
    "microblading Douala",
    "Herman Fashion",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "HERMAN FASHION",
    images: [{ url: "/images/photos/hf-6334.webp", width: 2000, height: 1126 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#f47a20",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
