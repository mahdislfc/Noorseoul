import fs from "fs/promises";
import path from "path";

const STORE_PATH = path.join(process.cwd(), "temp", "product-galleries.json");

type GalleryStore = Record<string, string[]>;

async function readStore(): Promise<GalleryStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed as GalleryStore;
  } catch {
    return {};
  }
}

async function writeStore(store: GalleryStore) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export async function getFallbackGallery(productId: string) {
  const store = await readStore();
  return Array.isArray(store[productId]) ? store[productId] : [];
}

export async function getFallbackGalleryMap() {
  return readStore();
}

export async function setFallbackGallery(productId: string, urls: string[]) {
  const store = await readStore();
  store[productId] = Array.from(new Set(urls.filter(Boolean)));
  await writeStore(store);
}

export async function deleteFallbackGallery(productId: string) {
  const store = await readStore();
  if (!(productId in store)) return;
  delete store[productId];
  await writeStore(store);
}
