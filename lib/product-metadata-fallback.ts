import fs from "fs/promises";
import path from "path";

const STORE_PATH = path.join(process.cwd(), "temp", "product-metadata.json");

export interface ProductMetadata {
  ingredients?: string;
  skinType?: string;
  scent?: string;
  waterResistance?: string;
  bundleLabel?: string;
  bundleProductId?: string;
  similarProductIds?: string[];
}

type MetadataStore = Record<string, ProductMetadata>;

function sanitize(value?: string) {
  return (value || "").trim();
}

function normalizeIdList(value?: string[]) {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .map((id) => sanitize(id))
        .filter(Boolean)
    )
  );
}

function normalizeMetadata(input: ProductMetadata): ProductMetadata {
  const ingredients = sanitize(input.ingredients);
  const skinType = sanitize(input.skinType);
  const scent = sanitize(input.scent);
  const waterResistance = sanitize(input.waterResistance);
  const bundleLabel = sanitize(input.bundleLabel);
  const bundleProductId = sanitize(input.bundleProductId);
  const similarProductIds = normalizeIdList(input.similarProductIds);

  return {
    ingredients: ingredients || undefined,
    skinType: skinType || undefined,
    scent: scent || undefined,
    waterResistance: waterResistance || undefined,
    bundleLabel: bundleLabel || undefined,
    bundleProductId: bundleProductId || undefined,
    similarProductIds: similarProductIds.length > 0 ? similarProductIds : undefined,
  };
}

async function readStore(): Promise<MetadataStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as MetadataStore;
  } catch {
    return {};
  }
}

async function writeStore(store: MetadataStore) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export async function getFallbackMetadataMap() {
  const store = await readStore();
  const normalizedEntries = Object.entries(store).map(([productId, metadata]) => [
    productId,
    normalizeMetadata(metadata || {}),
  ]);
  return Object.fromEntries(normalizedEntries) as MetadataStore;
}

export async function getFallbackMetadata(productId: string) {
  const store = await readStore();
  return normalizeMetadata(store[productId] || {});
}

export async function setFallbackMetadata(productId: string, metadata: ProductMetadata) {
  const store = await readStore();
  const normalized = normalizeMetadata(metadata);
  const hasAnyValue = Boolean(
    normalized.ingredients ||
      normalized.skinType ||
      normalized.scent ||
      normalized.waterResistance ||
      normalized.bundleLabel ||
      normalized.bundleProductId ||
      (normalized.similarProductIds && normalized.similarProductIds.length > 0)
  );

  if (hasAnyValue) {
    store[productId] = normalized;
  } else {
    delete store[productId];
  }

  await writeStore(store);
}

export async function deleteFallbackMetadata(productId: string) {
  const store = await readStore();
  if (!(productId in store)) return;
  delete store[productId];
  await writeStore(store);
}
