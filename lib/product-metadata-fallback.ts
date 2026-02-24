import fs from "fs/promises";
import path from "path";

const STORE_PATH = path.join(process.cwd(), "temp", "product-metadata.json");

export interface ProductMetadata {
  descriptionAr?: string;
  descriptionFa?: string;
  priceAed?: number;
  priceT?: number;
  originalPriceAed?: number;
  originalPriceT?: number;
  ingredients?: string;
  skinType?: string;
  scent?: string;
  waterResistance?: string;
  sourceUrl?: string;
  sourcePriceCurrency?: string;
  saleEndsAt?: string;
  sourceLastSyncedAt?: string;
  sourceSyncError?: string;
  bundleLabel?: string;
  bundleProductId?: string;
  similarProductIds?: string[];
  economicalOptionName?: string;
  economicalOptionPrice?: number;
  economicalOptionQuantity?: number;
  colorShades?: Array<{
    id?: string;
    name?: string;
    price?: number;
    priceAed?: number;
    priceT?: number;
  }>;
}

type MetadataStore = Record<string, ProductMetadata>;

function sanitize(value?: string) {
  return (value || "").trim();
}

function sanitizeNumber(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return value;
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

function normalizeColorShades(value?: ProductMetadata["colorShades"]) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry, index) => {
      const name = sanitize(entry?.name);
      const id = sanitize(entry?.id) || `shade-${index + 1}`;
      const priceRaw = sanitizeNumber(entry?.price);
      const priceAedRaw = sanitizeNumber(entry?.priceAed);
      const priceTRaw = sanitizeNumber(entry?.priceT);
      const price = typeof priceRaw === "number" && priceRaw > 0 ? priceRaw : undefined;
      const priceAed =
        typeof priceAedRaw === "number" && priceAedRaw > 0 ? priceAedRaw : undefined;
      const priceT =
        typeof priceTRaw === "number" && priceTRaw > 0 ? priceTRaw : undefined;
      if (!name || typeof price !== "number") return null;
      return {
        id,
        name,
        price,
        ...(typeof priceAed === "number" ? { priceAed } : {}),
        ...(typeof priceT === "number" ? { priceT } : {}),
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
}

function normalizeMetadata(input: ProductMetadata): ProductMetadata {
  const descriptionAr = sanitize(input.descriptionAr);
  const descriptionFa = sanitize(input.descriptionFa);
  const priceAedRaw = sanitizeNumber(input.priceAed);
  const priceAed =
    typeof priceAedRaw === "number" && priceAedRaw > 0 ? priceAedRaw : undefined;
  const priceTRaw = sanitizeNumber(input.priceT);
  const priceT =
    typeof priceTRaw === "number" && priceTRaw > 0 ? priceTRaw : undefined;
  const originalPriceAedRaw = sanitizeNumber(input.originalPriceAed);
  const originalPriceAed =
    typeof originalPriceAedRaw === "number" && originalPriceAedRaw > 0
      ? originalPriceAedRaw
      : undefined;
  const originalPriceTRaw = sanitizeNumber(input.originalPriceT);
  const originalPriceT =
    typeof originalPriceTRaw === "number" && originalPriceTRaw > 0
      ? originalPriceTRaw
      : undefined;
  const ingredients = sanitize(input.ingredients);
  const skinType = sanitize(input.skinType);
  const scent = sanitize(input.scent);
  const waterResistance = sanitize(input.waterResistance);
  const sourceUrl = sanitize(input.sourceUrl);
  const sourcePriceCurrency = sanitize(input.sourcePriceCurrency).toUpperCase();
  const saleEndsAt = sanitize(input.saleEndsAt);
  const sourceLastSyncedAt = sanitize(input.sourceLastSyncedAt);
  const sourceSyncError = sanitize(input.sourceSyncError);
  const bundleLabel = sanitize(input.bundleLabel);
  const bundleProductId = sanitize(input.bundleProductId);
  const similarProductIds = normalizeIdList(input.similarProductIds);
  const economicalOptionName = sanitize(input.economicalOptionName);
  const economicalOptionPrice = sanitizeNumber(input.economicalOptionPrice);
  const economicalOptionQuantityRaw = sanitizeNumber(input.economicalOptionQuantity);
  const economicalOptionQuantity =
    typeof economicalOptionQuantityRaw === "number" &&
    Number.isInteger(economicalOptionQuantityRaw) &&
    economicalOptionQuantityRaw > 1
      ? economicalOptionQuantityRaw
      : undefined;
  const colorShades = normalizeColorShades(input.colorShades);

  return {
    descriptionAr: descriptionAr || undefined,
    descriptionFa: descriptionFa || undefined,
    priceAed,
    priceT,
    originalPriceAed,
    originalPriceT,
    ingredients: ingredients || undefined,
    skinType: skinType || undefined,
    scent: scent || undefined,
    waterResistance: waterResistance || undefined,
    sourceUrl: sourceUrl || undefined,
    sourcePriceCurrency: sourcePriceCurrency || undefined,
    saleEndsAt: saleEndsAt || undefined,
    sourceLastSyncedAt: sourceLastSyncedAt || undefined,
    sourceSyncError: sourceSyncError || undefined,
    bundleLabel: bundleLabel || undefined,
    bundleProductId: bundleProductId || undefined,
    similarProductIds: similarProductIds.length > 0 ? similarProductIds : undefined,
    economicalOptionName: economicalOptionName || undefined,
    economicalOptionPrice:
      typeof economicalOptionPrice === "number" && economicalOptionPrice > 0
        ? economicalOptionPrice
        : undefined,
    economicalOptionQuantity,
    colorShades: colorShades.length > 0 ? colorShades : undefined,
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
    normalized.descriptionAr ||
      normalized.descriptionFa ||
      (typeof normalized.priceAed === "number" && normalized.priceAed > 0) ||
      (typeof normalized.priceT === "number" && normalized.priceT > 0) ||
      (typeof normalized.originalPriceAed === "number" &&
        normalized.originalPriceAed > 0) ||
      (typeof normalized.originalPriceT === "number" &&
        normalized.originalPriceT > 0) ||
      normalized.ingredients ||
      normalized.skinType ||
      normalized.scent ||
      normalized.waterResistance ||
      normalized.sourceUrl ||
      normalized.sourcePriceCurrency ||
      normalized.saleEndsAt ||
      normalized.sourceLastSyncedAt ||
      normalized.sourceSyncError ||
      normalized.bundleLabel ||
      normalized.bundleProductId ||
      (normalized.similarProductIds && normalized.similarProductIds.length > 0) ||
      normalized.economicalOptionName ||
      (typeof normalized.economicalOptionPrice === "number" &&
        normalized.economicalOptionPrice > 0) ||
      (normalized.colorShades && normalized.colorShades.length > 0)
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
