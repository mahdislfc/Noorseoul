import { prisma } from "@/lib/prisma";
import {
  getFallbackMetadataMap,
  setFallbackMetadata,
  type ProductMetadata,
} from "@/lib/product-metadata-fallback";

interface SaleExpiryResult {
  ok: boolean;
  ranAt: string;
  today: string;
  checked: number;
  expired: number;
  updatedPrices: number;
  updatedMetadata: number;
  errors: Array<{ productId: string; message: string }>;
}

function getTodayDateKey() {
  return new Date().toISOString().slice(0, 10);
}

function getSaleEndDate(metadata: ProductMetadata) {
  const sourceSaleEnd = (metadata.sourceSaleEnd || "").trim();
  if (sourceSaleEnd) return sourceSaleEnd;
  const saleEndsAt = (metadata.saleEndsAt || "").trim();
  return saleEndsAt;
}

function isExpired(saleEndDate: string, today: string) {
  return saleEndDate < today;
}

export async function expireSalesAndRestorePrices(): Promise<SaleExpiryResult> {
  const ranAt = new Date().toISOString();
  const today = getTodayDateKey();

  const products = await prisma.product.findMany({
    select: {
      id: true,
      price: true,
      originalPrice: true,
    },
  });
  const metadataMap = await getFallbackMetadataMap();

  let expired = 0;
  let updatedPrices = 0;
  let updatedMetadata = 0;
  const errors: Array<{ productId: string; message: string }> = [];

  for (const product of products) {
    try {
      const metadata = metadataMap[product.id] || {};
      const saleEndDate = getSaleEndDate(metadata);
      if (!saleEndDate) continue;
      if (!isExpired(saleEndDate, today)) continue;

      expired += 1;

      if (typeof product.originalPrice === "number" && product.originalPrice > 0) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            price: product.originalPrice,
            originalPrice: null,
          },
        });
        updatedPrices += 1;
      }

      const nextMetadata: ProductMetadata = {
        ...metadata,
        sourceSaleStart: undefined,
        sourceSaleEnd: undefined,
        saleEndsAt: undefined,
        saleLabel: undefined,
        promoBadgeText: undefined,
        promoTooltipText: undefined,
        miniCalendar: undefined,
      };

      if (typeof metadata.originalPriceAed === "number" && metadata.originalPriceAed > 0) {
        nextMetadata.priceAed = metadata.originalPriceAed;
      }
      if (typeof metadata.originalPriceT === "number" && metadata.originalPriceT > 0) {
        nextMetadata.priceT = metadata.originalPriceT;
      }
      nextMetadata.originalPriceAed = undefined;
      nextMetadata.originalPriceT = undefined;

      await setFallbackMetadata(product.id, nextMetadata);
      updatedMetadata += 1;
    } catch (error) {
      errors.push({
        productId: product.id,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return {
    ok: errors.length === 0,
    ranAt,
    today,
    checked: products.length,
    expired,
    updatedPrices,
    updatedMetadata,
    errors,
  };
}
