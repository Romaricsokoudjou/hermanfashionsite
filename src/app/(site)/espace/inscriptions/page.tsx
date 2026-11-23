import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { enrollments } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { EnrollmentCard } from "@/components/EnrollmentCard";

export const metadata = { title: "Mes inscriptions" };

export default async function MesInscriptions() {
  const user = await requireUser();
  const db = await getDb();
  const list = await db.select().from(enrollments).where(eq(enrollments.userId, user.id)).orderBy(desc(enrollments.createdAt));
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl">Mes inscriptions</h1>
        <Link href="/espace/inscriptions/nouvelle" className="btn btn-primary btn-sm">Nouvelle inscription</Link>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {list.length === 0 && <p className="text-ink-soft">Vous n&apos;avez pas encore soumis de demande d&apos;inscription.</p>}
        {list.map((e) => <EnrollmentCard key={e.id} e={e} />)}
      </div>
    </div>
  );
}
