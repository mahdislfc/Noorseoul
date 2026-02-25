import fs from "fs/promises";
import path from "path";

const STORE_PATH = path.join(process.cwd(), "temp", "product-metadata.json");

export interface ProductMetadata {
  koreanName?: string;
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
  saleLabel?: string;
  promoBadgeText?: string;
  promoTooltipText?: string;
  promoPriority?: string;
  promoLastChecked?: string;
  miniCalendar?: {
    type?: string;
    timezone?: string;
    start_date?: string;
    days?: Array<{
      date?: string;
      price?: number;
      state?: string;
      label?: string;
    }>;
    calendar_end_unknown?: boolean;
    calendar_header?: string;
    calendar_subheader?: string;
    days_left?: number | null;
  };
  extractedRegularPriceText?: string;
  extractedSaleText?: string;
  extractedBestDealText?: string;
  sourceRegularPrice?: number;
  sourceCurrentPrice?: number;
  sourceCurrency?: string;
  sourceSaleStart?: string;
  sourceSaleEnd?: string;
  sourceSaleTimezone?: string;
  sourceDiscountAmount?: number;
  sourceDiscountPercent?: number;
  syncStatus?: string;
  syncNotes?: string;
  markupMode?: string;
  markupPercent?: number;
  markupFixed?: number;
  roundingRule?: string;
  allowedVariancePercent?: number;
  variantSelectorType?: string;
  variantSelectorMatchText?: string;
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
      if (!name) return null;
      return {
        id,
        name,
        ...(typeof price === "number" ? { price } : {}),
        ...(typeof priceAed === "number" ? { priceAed } : {}),
        ...(typeof priceT === "number" ? { priceT } : {}),
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
}

function normalizeMiniCalendar(value?: ProductMetadata["miniCalendar"]) {
  if (!value || typeof value !== "object") return undefined;
  const days = Array.isArray(value.days)
    ? value.days
        .map((entry) => {
          if (!entry || typeof entry !== "object") return null;
          const date = sanitize(entry.date);
          const state = sanitize(entry.state);
          const label = sanitize(entry.label);
          const priceRaw = sanitizeNumber(entry.price);
          if (!date || typeof priceRaw !== "number" || priceRaw <= 0) return null;
          return {
            date,
            price: priceRaw,
            state: state || "regular",
            label: label || "",
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    : [];
  const type = sanitize(value.type);
  const timezone = sanitize(value.timezone);
  const startDate = sanitize(value.start_date);
  const calendarHeader = sanitize(value.calendar_header);
  const calendarSubheader = sanitize(value.calendar_subheader);
  const daysLeftRaw = sanitizeNumber(
    typeof value.days_left === "number" ? value.days_left : undefined
  );
  const daysLeft = typeof daysLeftRaw === "number" ? Math.max(0, Math.floor(daysLeftRaw)) : undefined;
  return {
    type: type || "mini_price_calendar",
    timezone: timezone || undefined,
    start_date: startDate || undefined,
    days: days.length > 0 ? days : undefined,
    calendar_end_unknown: Boolean(value.calendar_end_unknown),
    calendar_header: calendarHeader || undefined,
    calendar_subheader: calendarSubheader || undefined,
    days_left: typeof daysLeft === "number" ? daysLeft : null,
  };
}

function normalizeMetadata(input: ProductMetadata): ProductMetadata {
  const koreanName = sanitize(input.koreanName);
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
  const saleLabel = sanitize(input.saleLabel);
  const promoBadgeText = sanitize(input.promoBadgeText);
  const promoTooltipText = sanitize(input.promoTooltipText);
  const promoPriority = sanitize(input.promoPriority).toLowerCase();
  const promoLastChecked = sanitize(input.promoLastChecked);
  const miniCalendar = normalizeMiniCalendar(input.miniCalendar);
  const extractedRegularPriceText = sanitize(input.extractedRegularPriceText);
  const extractedSaleText = sanitize(input.extractedSaleText);
  const extractedBestDealText = sanitize(input.extractedBestDealText);
  const sourceRegularPriceRaw = sanitizeNumber(input.sourceRegularPrice);
  const sourceCurrentPriceRaw = sanitizeNumber(input.sourceCurrentPrice);
  const sourceCurrency = sanitize(input.sourceCurrency).toUpperCase();
  const sourceSaleStart = sanitize(input.sourceSaleStart);
  const sourceSaleEnd = sanitize(input.sourceSaleEnd);
  const sourceSaleTimezone = sanitize(input.sourceSaleTimezone).toUpperCase();
  const sourceDiscountAmountRaw = sanitizeNumber(input.sourceDiscountAmount);
  const sourceDiscountPercentRaw = sanitizeNumber(input.sourceDiscountPercent);
  const syncStatus = sanitize(input.syncStatus).toLowerCase();
  const syncNotes = sanitize(input.syncNotes);
  const markupMode = sanitize(input.markupMode).toLowerCase();
  const markupPercentRaw = sanitizeNumber(input.markupPercent);
  const markupFixedRaw = sanitizeNumber(input.markupFixed);
  const roundingRule = sanitize(input.roundingRule).toLowerCase();
  const allowedVariancePercentRaw = sanitizeNumber(input.allowedVariancePercent);
  const variantSelectorType = sanitize(input.variantSelectorType).toLowerCase();
  const variantSelectorMatchText = sanitize(input.variantSelectorMatchText);
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
    koreanName: koreanName || undefined,
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
    saleLabel: saleLabel || undefined,
    promoBadgeText: promoBadgeText || undefined,
    promoTooltipText: promoTooltipText || undefined,
    promoPriority: promoPriority || undefined,
    promoLastChecked: promoLastChecked || undefined,
    miniCalendar,
    extractedRegularPriceText: extractedRegularPriceText || undefined,
    extractedSaleText: extractedSaleText || undefined,
    extractedBestDealText: extractedBestDealText || undefined,
    sourceRegularPrice:
      typeof sourceRegularPriceRaw === "number" && sourceRegularPriceRaw > 0
        ? sourceRegularPriceRaw
        : undefined,
    sourceCurrentPrice:
      typeof sourceCurrentPriceRaw === "number" && sourceCurrentPriceRaw > 0
        ? sourceCurrentPriceRaw
        : undefined,
    sourceCurrency: sourceCurrency || undefined,
    sourceSaleStart: sourceSaleStart || undefined,
    sourceSaleEnd: sourceSaleEnd || undefined,
    sourceSaleTimezone: sourceSaleTimezone || undefined,
    sourceDiscountAmount:
      typeof sourceDiscountAmountRaw === "number" && sourceDiscountAmountRaw > 0
        ? sourceDiscountAmountRaw
        : undefined,
    sourceDiscountPercent:
      typeof sourceDiscountPercentRaw === "number" && sourceDiscountPercentRaw > 0
        ? sourceDiscountPercentRaw
        : undefined,
    syncStatus: syncStatus || undefined,
    syncNotes: syncNotes || undefined,
    markupMode: markupMode || undefined,
    markupPercent:
      typeof markupPercentRaw === "number" && markupPercentRaw >= 0
        ? markupPercentRaw
        : undefined,
    markupFixed:
      typeof markupFixedRaw === "number" && markupFixedRaw >= 0
        ? markupFixedRaw
        : undefined,
    roundingRule: roundingRule || undefined,
    allowedVariancePercent:
      typeof allowedVariancePercentRaw === "number" && allowedVariancePercentRaw >= 0
        ? allowedVariancePercentRaw
        : undefined,
    variantSelectorType: variantSelectorType || undefined,
    variantSelectorMatchText: variantSelectorMatchText || undefined,
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
    normalized.koreanName ||
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
      normalized.saleLabel ||
      normalized.promoBadgeText ||
      normalized.promoTooltipText ||
      normalized.promoPriority ||
      normalized.promoLastChecked ||
      normalized.miniCalendar ||
      normalized.extractedRegularPriceText ||
      normalized.extractedSaleText ||
      normalized.extractedBestDealText ||
      (typeof normalized.sourceRegularPrice === "number" &&
        normalized.sourceRegularPrice > 0) ||
      (typeof normalized.sourceCurrentPrice === "number" &&
        normalized.sourceCurrentPrice > 0) ||
      normalized.sourceCurrency ||
      normalized.sourceSaleStart ||
      normalized.sourceSaleEnd ||
      normalized.sourceSaleTimezone ||
      (typeof normalized.sourceDiscountAmount === "number" &&
        normalized.sourceDiscountAmount > 0) ||
      (typeof normalized.sourceDiscountPercent === "number" &&
        normalized.sourceDiscountPercent > 0) ||
      normalized.syncStatus ||
      normalized.syncNotes ||
      normalized.markupMode ||
      (typeof normalized.markupPercent === "number" &&
        normalized.markupPercent >= 0) ||
      (typeof normalized.markupFixed === "number" &&
        normalized.markupFixed >= 0) ||
      normalized.roundingRule ||
      (typeof normalized.allowedVariancePercent === "number" &&
        normalized.allowedVariancePercent >= 0) ||
      normalized.variantSelectorType ||
      normalized.variantSelectorMatchText ||
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
