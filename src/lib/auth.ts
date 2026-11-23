import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users, type User } from "@/db/schema";

export const SESSION_COOKIE = "hf_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s && process.env.NODE_ENV === "production" && !process.env.ALLOW_DEV_SECRET) {
    throw new Error("AUTH_SECRET doit être défini en production.");
  }
  return new TextEncoder().encode(s || "herman-fashion-dev-secret-change-me-please-32c");
}

export type Session = { uid: number; role: string };

export async function createSession(user: Pick<User, "id" | "role">) {
  const token = await new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "true",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return { uid: Number(payload.sub), role: String(payload.role || "apprenant") };
  } catch {
    return null;
  }
}

/** Utilisateur courant, relu en base (le rôle fait foi depuis la base, pas depuis le jeton). */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;
  const db = await getDb();
  const [user] = await db.select().from(users).where(eq(users.id, session.uid)).limit(1);
  return user ?? null;
}

export async function requireUser(next = "/espace"): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/connexion?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/connexion?next=/admin`);
  if (user.role !== "admin") redirect("/espace");
  return user;
}
