import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";

export async function saveUpload(shop: string, filename: string, bytes: Buffer) {
  // Local storage is intentionally for development only. Replace with a private object-store adapter in production.
  const base = resolve(process.env.UPLOAD_DIR || "./uploads");
  const folder = join(base, shop.replace(/[^a-z0-9.-]/gi, "_"));
  await mkdir(folder, { recursive: true });
  const key = `${randomUUID()}-${filename.replace(/[^a-z0-9._-]/gi, "_")}`;
  await writeFile(join(folder, key), bytes, { flag: "wx" });
  return key;
}

export async function readUpload(shop: string, key: string) {
  if (!/^[a-zA-Z0-9._-]+$/.test(key)) throw new Error("Invalid stored file key.");
  const base = resolve(process.env.UPLOAD_DIR || "./uploads");
  const folder = join(base, shop.replace(/[^a-z0-9.-]/gi, "_"));
  return readFile(join(folder, key));
}
