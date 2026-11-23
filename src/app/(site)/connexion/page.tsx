import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "@/components/forms";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

export default async function ConnexionPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(next && next.startsWith("/") ? next : user.role === "admin" ? "/admin" : "/espace");
  const context = next?.includes("inscriptions/nouvelle") ? "Connectez-vous pour poursuivre votre inscription à la formation choisie." : "Accédez à votre espace personnel : inscriptions, paiements, messages et HERMAN AI.";
  return (
    <AuthShell title={<>Bon retour <em className="text-brand-600">parmi nous</em></>} text={context} image="/images/photos/hf-6240.webp">
      <LoginForm next={next} />
    </AuthShell>
  );
}
