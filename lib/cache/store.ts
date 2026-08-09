import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DATA_DIR = path.join(ROOT, "data");

function cachePath(name: string) {
  return path.join(DATA_DIR, name);
}

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function readCache<T>(name: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(cachePath(name), "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return fallback;
    }
    throw error;
  }
}

export async function writeCache(name: string, data: unknown): Promise<void> {
  await ensureDataDir();
  await writeFile(cachePath(name), `${JSON.stringify(data)}\n`, "utf8");
}
