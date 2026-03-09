import "server-only";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/lib/types";
import { getFallbackGallery, getFallbackGalleryMap } from "@/lib/product-gallery-fallback";
import {
  getFallbackMetadata,
  getFallbackMetadataMap,
} from "@/lib/product-metadata-fallback";
import { isSaleExpired } from "@/lib/sale-date";

function isConnectionPoolTimeout(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code?: string }).code || "")
      : "";
  return (
    code === "P2024" ||
    message.includes("Timed out fetching a new connection from the connection pool")
  );
}

async function withPrismaRetry<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (!isConnectionPoolTimeout(error)) throw error;
    await new Promise((resolve) => setTimeout(resolve, 200));
    return operation();
  }
}

function isGalleryRelationUnavailable(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code?: string }).code || "")
      : "";
  return (
    message.includes("Unknown field `images`") ||
    message.includes("does not exist") ||
    code === "P2021"
  );
}

function toProductModel(product: Record<string, unknown>): Product {
  const sourceSaleEndRaw =
    typeof product.sourceSaleEnd === "string" ? product.sourceSaleEnd : null;
  const saleEndsAtRaw =
    typeof product.saleEndsAt === "string" ? product.saleEndsAt : null;
  const saleEndRaw = sourceSaleEndRaw?.trim() || saleEndsAtRaw?.trim() || null;
  const hasExpiredSale = Boolean(saleEndRaw && isSaleExpired(saleEndRaw));
  const rawPrice =
    typeof product.price === "number" && Number.isFinite(product.price)
      ? product.price
      : 0;
  const rawPriceAed =
    typeof product.priceAed === "number" && Number.isFinite(product.priceAed)
      ? product.priceAed
      : null;
  const rawPriceT =
    typeof product.priceT === "number" && Number.isFinite(product.priceT)
      ? product.priceT
      : null;
  const rawOriginalPrice =
    typeof product.originalPrice === "number" &&
    Number.isFinite(product.originalPrice) &&
    product.originalPrice > 0
      ? product.originalPrice
      : null;
  const rawOriginalPriceAed =
    typeof product.originalPriceAed === "number" &&
    Number.isFinite(product.originalPriceAed)
      ? product.originalPriceAed
      : null;
  const rawOriginalPriceT =
    typeof product.originalPriceT === "number" &&
    Number.isFinite(product.originalPriceT)
      ? product.originalPriceT
      : null;
  const displayPrice = hasExpiredSale && rawOriginalPrice ? rawOriginalPrice : rawPrice;
  const displayPriceAed =
    hasExpiredSale && typeof rawOriginalPriceAed === "number" && rawOriginalPriceAed > 0
      ? rawOriginalPriceAed
      : rawPriceAed;
  const displayPriceT =
    hasExpiredSale && typeof rawOriginalPriceT === "number" && rawOriginalPriceT > 0
      ? rawOriginalPriceT
      : rawPriceT;
  const displayOriginalPrice = hasExpiredSale ? null : rawOriginalPrice;
  const displayOriginalPriceAed = hasExpiredSale ? null : rawOriginalPriceAed;
  const displayOriginalPriceT = hasExpiredSale ? null : rawOriginalPriceT;
  const displaySaleEndsAt = hasExpiredSale ? null : saleEndsAtRaw;
  const displaySourceSaleEnd = hasExpiredSale ? null : sourceSaleEndRaw;
  const displaySaleLabel =
    hasExpiredSale || typeof product.saleLabel !== "string" ? null : product.saleLabel;
  const displayPromoBadgeText =
    hasExpiredSale || typeof product.promoBadgeText !== "string" ? null : product.promoBadgeText;
  const displayPromoTooltipText =
    hasExpiredSale || typeof product.promoTooltipText !== "string"
      ? null
      : product.promoTooltipText;
  const displayMiniCalendar =
    hasExpiredSale || !(product.miniCalendar && typeof product.miniCalendar === "object")
      ? null
      : (product.miniCalendar as Product["miniCalendar"]);
  const displaySourceSaleStart =
    hasExpiredSale || typeof product.sourceSaleStart !== "string"
      ? null
      : product.sourceSaleStart;

  const rawImages = Array.isArray((product as { images?: unknown[] }).images)
    ? ((product as { images: Array<{ url?: string }> }).images || [])
    : [];
  const orderedImages = rawImages
    .map((image) => image?.url)
    .filter((url): url is string => typeof url === "string" && url.length > 0);
  const fallbackImage =
    typeof product.image === "string" ? product.image : "";
  const primaryImage = orderedImages[0] || fallbackImage;
  const economicalOptionName =
    typeof product.economicalOptionName === "string"
      ? product.economicalOptionName.trim()
      : "";
  const bundleLabel =
    typeof product.bundleLabel === "string" ? product.bundleLabel.trim() : "";
  const economicalOptionPrice =
    typeof product.economicalOptionPrice === "number" &&
    Number.isFinite(product.economicalOptionPrice) &&
    product.economicalOptionPrice > 0
      ? product.economicalOptionPrice
      : null;
  const economicalOptionQuantity =
    typeof product.economicalOptionQuantity === "number" &&
    Number.isInteger(product.economicalOptionQuantity) &&
    product.economicalOptionQuantity > 1
      ? product.economicalOptionQuantity
      : undefined;
  const fallbackEconomicalName =
    economicalOptionName ||
    bundleLabel ||
    (typeof economicalOptionPrice === "number"
      ? `Buy ${economicalOptionQuantity || 2} for $${economicalOptionPrice.toFixed(2)}`
      : "");
  const colorShades = Array.isArray(product.colorShades)
    ? product.colorShades
        .map((shade, index) => {
          if (!shade || typeof shade !== "object") return null;
          const shadeName =
            "name" in shade && typeof shade.name === "string"
              ? shade.name.trim()
              : "";
          const shadeId =
            "id" in shade && typeof shade.id === "string" && shade.id.trim()
              ? shade.id.trim()
              : `shade-${index + 1}`;
          const shadePriceAed =
            "priceAed" in shade &&
            typeof shade.priceAed === "number" &&
            Number.isFinite(shade.priceAed)
              ? shade.priceAed
              : null;
          const shadePriceT =
            "priceT" in shade &&
            typeof shade.priceT === "number" &&
            Number.isFinite(shade.priceT)
              ? shade.priceT
              : null;
          const shadeThumbnail =
            "thumbnail" in shade && typeof shade.thumbnail === "string"
              ? shade.thumbnail.trim()
              : "";
          if (!shadeName) return null;
          const fallbackBasePrice =
            typeof product.price === "number" && Number.isFinite(product.price) && product.price > 0
              ? product.price
              : null;
          const fallbackBasePriceAed =
            typeof product.priceAed === "number" && Number.isFinite(product.priceAed) && product.priceAed > 0
              ? product.priceAed
              : null;
          const fallbackBasePriceT =
            typeof product.priceT === "number" && Number.isFinite(product.priceT) && product.priceT > 0
              ? product.priceT
              : null;
          const finalShadePrice = fallbackBasePrice;
          if (typeof finalShadePrice !== "number" || finalShadePrice <= 0) return null;
          return {
            id: shadeId,
            name: shadeName,
            price: finalShadePrice,
            priceAed:
              typeof shadePriceAed === "number" && shadePriceAed > 0
                ? shadePriceAed
                : fallbackBasePriceAed,
            priceT:
              typeof shadePriceT === "number" && shadePriceT > 0
                ? shadePriceT
                : fallbackBasePriceT,
            thumbnail: shadeThumbnail || null,
          };
        })
        .filter(
          (
            shade
          ): shade is {
            id: string;
            name: string;
            price: number;
            priceAed: number | null;
            priceT: number | null;
            thumbnail: string | null;
          } => Boolean(shade)
        )
    : [];
  const colorShadeLabel =
    typeof product.colorShadeLabel === "string" && product.colorShadeLabel.trim()
      ? product.colorShadeLabel.trim()
      : null;

  return {
    id: String(product.id || ""),
    name: String(product.name || ""),
    description:
      typeof product.description === "string" || product.description === null
        ? product.description
        : null,
    descriptionAr:
      typeof product.descriptionAr === "string" || product.descriptionAr === null
        ? product.descriptionAr
        : null,
    descriptionFa:
      typeof product.descriptionFa === "string" || product.descriptionFa === null
        ? product.descriptionFa
        : null,
    priceAed: displayPriceAed,
    priceT: displayPriceT,
    price: displayPrice,
    originalPrice: displayOriginalPrice,
    originalPriceAed: displayOriginalPriceAed,
    originalPriceT: displayOriginalPriceT,
    currency: String(product.currency || "USD"),
    brand: String(product.brand || ""),
    category: String(product.category || ""),
    additionalCategories: Array.isArray(product.additionalCategories)
      ? product.additionalCategories
          .filter((entry): entry is string => typeof entry === "string")
          .map((entry) => entry.trim())
          .filter(Boolean)
      : [],
    department: String(product.department || ""),
    image: primaryImage,
    bestSeller: Boolean(product.bestSeller),
    newArrival: Boolean(product.newArrival),
    comingSoon: Boolean(product.comingSoon),
    size: typeof product.size === "string" ? product.size : null,
    images: orderedImages.length > 0 ? orderedImages : fallbackImage ? [fallbackImage] : [],
    ingredients:
      typeof product.ingredients === "string" ? product.ingredients : null,
    skinType: typeof product.skinType === "string" ? product.skinType : null,
    scent: typeof product.scent === "string" ? product.scent : null,
    waterResistance:
      typeof product.waterResistance === "string"
        ? product.waterResistance
        : null,
    sourceUrl:
      typeof product.sourceUrl === "string" ? product.sourceUrl : null,
    sourcePriceCurrency:
      typeof product.sourcePriceCurrency === "string"
        ? product.sourcePriceCurrency
        : null,
    saleEndsAt: displaySaleEndsAt,
    saleLabel: displaySaleLabel,
    promoBadgeText: displayPromoBadgeText,
    promoTooltipText: displayPromoTooltipText,
    promoPriority:
      product.promoPriority === "high" || product.promoPriority === "none"
        ? product.promoPriority
        : null,
    promoLastChecked:
      typeof product.promoLastChecked === "string" ? product.promoLastChecked : null,
    miniCalendar: displayMiniCalendar,
    extractedRegularPriceText:
      typeof product.extractedRegularPriceText === "string"
        ? product.extractedRegularPriceText
        : null,
    extractedSaleText:
      typeof product.extractedSaleText === "string" ? product.extractedSaleText : null,
    extractedBestDealText:
      typeof product.extractedBestDealText === "string"
        ? product.extractedBestDealText
        : null,
    sourceRegularPrice:
      typeof product.sourceRegularPrice === "number" &&
      Number.isFinite(product.sourceRegularPrice)
        ? product.sourceRegularPrice
        : null,
    sourceCurrentPrice:
      typeof product.sourceCurrentPrice === "number" &&
      Number.isFinite(product.sourceCurrentPrice)
        ? product.sourceCurrentPrice
        : null,
    sourceCurrency:
      typeof product.sourceCurrency === "string" ? product.sourceCurrency : null,
    sourceSaleStart: displaySourceSaleStart,
    sourceSaleEnd: displaySourceSaleEnd,
    sourceSaleTimezone:
      typeof product.sourceSaleTimezone === "string" ? product.sourceSaleTimezone : null,
    sourceDiscountAmount:
      typeof product.sourceDiscountAmount === "number" &&
      Number.isFinite(product.sourceDiscountAmount)
        ? product.sourceDiscountAmount
        : null,
    sourceDiscountPercent:
      typeof product.sourceDiscountPercent === "number" &&
      Number.isFinite(product.sourceDiscountPercent)
        ? product.sourceDiscountPercent
        : null,
    syncStatus:
      product.syncStatus === "ok" ||
      product.syncStatus === "warning" ||
      product.syncStatus === "failed"
        ? product.syncStatus
        : null,
    sourceLastSyncedAt:
      typeof product.sourceLastSyncedAt === "string"
        ? product.sourceLastSyncedAt
        : null,
    sourceSyncError:
      typeof product.sourceSyncError === "string" ? product.sourceSyncError : null,
    bundleLabel: bundleLabel || null,
    bundleProductId:
      typeof product.bundleProductId === "string" ? product.bundleProductId : null,
    similarProductIds: Array.isArray(product.similarProductIds)
      ? product.similarProductIds
          .filter((id): id is string => typeof id === "string")
          .map((id) => id.trim())
          .filter(Boolean)
      : [],
    economicalOption:
      fallbackEconomicalName && typeof economicalOptionPrice === "number"
        ? {
            name: fallbackEconomicalName,
            price: economicalOptionPrice,
            quantity: economicalOptionQuantity,
          }
        : undefined,
    colorShades,
    colorShadeLabel,
  };
}

export async function getProducts(_locale?: string): Promise<Product[]> {
  try {
    const products = await withPrismaRetry(() =>
      prisma.product.findMany({
        include: { images: { orderBy: { sortOrder: "asc" } } },
        orderBy: { createdAt: "desc" },
      })
    );
    const metadataMap = await getFallbackMetadataMap();
    return products.map((product) =>
      toProductModel({
        ...(product as Record<string, unknown>),
        ...(metadataMap[product.id] || {}),
      })
    );
  } catch (error) {
    if (!isGalleryRelationUnavailable(error)) throw error;
    const products = await withPrismaRetry(() =>
      prisma.product.findMany({
        orderBy: { createdAt: "desc" },
      })
    );
    const galleryMap = await getFallbackGalleryMap();
    const metadataMap = await getFallbackMetadataMap();
    return products.map((product) =>
      toProductModel({
        ...(product as Record<string, unknown>),
        images: (galleryMap[product.id] || []).map((url) => ({ url })),
        ...(metadataMap[product.id] || {}),
      })
    );
  }
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const normalizedIds = Array.from(
    new Set(ids.map((id) => id.trim()).filter(Boolean))
  );
  if (normalizedIds.length === 0) return [];

  try {
    const products = await withPrismaRetry(() =>
      prisma.product.findMany({
        where: { id: { in: normalizedIds } },
        include: { images: { orderBy: { sortOrder: "asc" } } },
      })
    );
    const metadataMap = await getFallbackMetadataMap();
    const mapped = products.map((product) =>
      toProductModel({
        ...(product as Record<string, unknown>),
        ...(metadataMap[product.id] || {}),
      })
    );
    const byId = new Map(mapped.map((product) => [product.id, product]));
    return normalizedIds
      .map((id) => byId.get(id))
      .filter((product): product is Product => Boolean(product));
  } catch (error) {
    if (!isGalleryRelationUnavailable(error)) throw error;
    const products = await withPrismaRetry(() =>
      prisma.product.findMany({
        where: { id: { in: normalizedIds } },
      })
    );
    const galleryMap = await getFallbackGalleryMap();
    const metadataMap = await getFallbackMetadataMap();
    const mapped = products.map((product) =>
      toProductModel({
        ...(product as Record<string, unknown>),
        images: (galleryMap[product.id] || []).map((url) => ({ url })),
        ...(metadataMap[product.id] || {}),
      })
    );
    const byId = new Map(mapped.map((product) => [product.id, product]));
    return normalizedIds
      .map((id) => byId.get(id))
      .filter((product): product is Product => Boolean(product));
  }
}

export async function getProductById(id?: string): Promise<Product | null> {
  if (!id) return null;
  try {
    const product = await withPrismaRetry(() =>
      prisma.product.findUnique({
        where: { id },
        include: { images: { orderBy: { sortOrder: "asc" } } },
      })
    );
    if (!product) return null;
    const metadata = await getFallbackMetadata(product.id);
    return toProductModel({
      ...(product as Record<string, unknown>),
      ...metadata,
    });
  } catch (error) {
    if (!isGalleryRelationUnavailable(error)) throw error;
    const product = await withPrismaRetry(() =>
      prisma.product.findUnique({ where: { id } })
    );
    if (!product) return null;
    const fallbackGallery = await getFallbackGallery(product.id);
    const metadata = await getFallbackMetadata(product.id);
    return toProductModel({
      ...(product as Record<string, unknown>),
      images: fallbackGallery.map((url) => ({ url })),
      ...metadata,
    });
  }
}

export async function getBrandsWithProductCounts(): Promise<Array<{ brand: string; count: number }>> {
  const grouped = await withPrismaRetry(() =>
    prisma.product.groupBy({
      by: ["brand"],
      _count: { _all: true },
    })
  );

  return grouped
    .map((entry) => ({
      brand: String(entry.brand || "").trim(),
      count: Number(entry._count?._all || 0),
    }))
    .filter((entry) => entry.brand.length > 0)
    .sort((a, b) => a.brand.localeCompare(b.brand, "en", { sensitivity: "base" }));
}
