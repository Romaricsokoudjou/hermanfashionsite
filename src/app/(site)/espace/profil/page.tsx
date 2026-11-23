import { requireUser } from "@/lib/auth";
import { ProfileForm, PasswordForm } from "@/components/forms";

export const metadata = { title: "Mon profil" };

export default async function Profil() {
  const user = await requireUser();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl">Mon profil</h1>
      <div className="card p-6 md:p-8">
        <h2 className="font-display text-2xl">Informations personnelles</h2>
        <div className="mt-6"><ProfileForm user={{ lastName: user.lastName, firstName: user.firstName, phone: user.phone, country: user.country, city: user.city, email: user.email }} /></div>
      </div>
      <div className="card p-6 md:p-8">
        <h2 className="font-display text-2xl">Sécurité</h2>
        <div className="mt-6"><PasswordForm /></div>
      </div>
    </div>
  );
}
