import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthShell } from "@/components/AuthShell";
import { RegisterForm } from "@/components/forms";

export const metadata: Metadata = { title: "Créer mon compte", description: "Créez gratuitement votre compte Herman FASHION pour vous inscrire à une formation." };

export default async function InscriptionPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(next && next.startsWith("/") ? next : "/espace");
  return (
    <AuthShell title={<>Rejoignez <em className="text-brand-600">Herman FASHION</em></>} text="Création de compte gratuite. Vous pourrez ensuite choisir votre formation et soumettre votre demande d'inscription." image="/images/photos/hf-6338.webp">
      <RegisterForm next={next || "/espace/inscriptions/nouvelle"} />
    </AuthShell>
  );
}
