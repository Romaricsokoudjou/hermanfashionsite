import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Modèle de rendu dynamique classique : chaque page lit la base de données à la demande.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  serverExternalPackages: ["@electric-sql/pglite"],
  outputFileTracingIncludes: {
    "/*": ["./drizzle/**/*"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  experimental: {
    serverActions: { bodySizeLimit: "12mb" },
  },
};

export default nextConfig;
