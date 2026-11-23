import "server-only";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";

/**
 * Stockage des médias envoyés depuis l'administration.
 * - Si BLOB_READ_WRITE_TOKEN est défini (Vercel Blob) : stockage cloud durable.
 * - Sinon : dossier public/uploads du serveur (hébergement classique / VPS).
 */
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml", "video/mp4", "video/webm", "video/quicktime"];

export async function saveUpload(file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) throw new Error("Format de fichier non pris en charge.");
  const max = file.type.startsWith("video/") ? 200 : 12;
  if (file.size > max * 1024 * 1024) throw new Error(`Fichier trop volumineux (max ${max} Mo).`);
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`herman-fashion/${name}`, file, { access: "public" });
    return blob.url;
  }
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}
