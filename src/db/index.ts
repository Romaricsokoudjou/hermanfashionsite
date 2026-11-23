import path from "node:path";
import fs from "node:fs";
import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Connexion à la base de données.
 * - Production : PostgreSQL via DATABASE_URL (Neon, Supabase, Railway, serveur dédié…)
 * - Développement / démonstration : PostgreSQL embarqué (PGlite) stocké dans .data/pglite
 * Le même schéma et les mêmes requêtes servent dans les deux cas.
 */
export type DB = NodePgDatabase<typeof schema>;

type GlobalDb = { db?: DB; ready?: Promise<void>; kind?: "pg" | "pglite" };
const g = globalThis as unknown as { __hfdb?: GlobalDb };
g.__hfdb ??= {};
const state = g.__hfdb;

const MIGRATIONS = path.join(process.cwd(), "drizzle");

async function createPglite(): Promise<DB> {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const dir = process.env.PGLITE_DIR || path.join(process.cwd(), ".data", "pglite");
  fs.mkdirSync(dir, { recursive: true });
  const client = new PGlite(dir);
  await client.waitReady;
  const db = drizzle(client, { schema });
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate(db, { migrationsFolder: MIGRATIONS });
  return db as unknown as DB;
}

async function createPg(): Promise<DB> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.DATABASE_POOL_MAX || 5),
    ssl: process.env.DATABASE_SSL === "false" ? undefined : process.env.DATABASE_URL?.includes("sslmode=") ? undefined : process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  });
  const db = drizzlePg(pool, { schema });
  if (process.env.AUTO_MIGRATE !== "false") {
    await migratePg(db, { migrationsFolder: MIGRATIONS });
  }
  return db;
}

/** Retourne l'instance unique de la base, migrée et initialisée. */
export async function getDb(): Promise<DB> {
  if (!state.ready) {
    state.ready = (async () => {
      state.kind = process.env.DATABASE_URL ? "pg" : "pglite";
      state.db = state.kind === "pg" ? await createPg() : await createPglite();
      const { ensureSeed } = await import("./seed");
      await ensureSeed(state.db);
    })().catch((err) => {
      state.ready = undefined;
      throw err;
    });
  }
  await state.ready;
  return state.db!;
}
