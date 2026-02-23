import "server-only";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/lib/types";
import { getFallbackGallery, getFallbackGalleryMap } from "@/lib/product-gallery-fallback";
import {
  getFallbackMetadata,
  getFallbackMetadataMap,
} from "@/lib/product-metadata-fallback";

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
  const rawImages = Array.isArray((product as { images?: unknown[] }).images)
    ? ((product as { images: Array<{ url?: string }> }).images || [])
    : [];
  const orderedImages = rawImages
    .map((image) => image?.url)
    .filter((url): url is string => typeof url === "string" && url.length > 0);
  const fallbackImage =
    typeof product.image === "string" ? product.image : "";
  const primaryImage = orderedImages[0] || fallbackImage;

  return {
    id: String(product.id || ""),
    name: String(product.name || ""),
    description:
      typeof product.description === "string" || product.description === null
        ? product.description
        : null,
    price: Number(product.price || 0),
    originalPrice:
      typeof product.originalPrice === "number" ? product.originalPrice : null,
    currency: String(product.currency || "USD"),
    brand: String(product.brand || ""),
    category: String(product.category || ""),
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
    bundleLabel:
      typeof product.bundleLabel === "string" ? product.bundleLabel : null,
    bundleProductId:
      typeof product.bundleProductId === "string" ? product.bundleProductId : null,
    similarProductIds: Array.isArray(product.similarProductIds)
      ? product.similarProductIds
          .filter((id): id is string => typeof id === "string")
          .map((id) => id.trim())
          .filter(Boolean)
      : [],
  };
}

export async function getProducts(_locale?: string): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      include: { images: { orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
    const metadataMap = await getFallbackMetadataMap();
    return products.map((product) =>
      toProductModel({
        ...(product as Record<string, unknown>),
        ...(metadataMap[product.id] || {}),
      })
    );
  } catch (error) {
    if (!isGalleryRelationUnavailable(error)) throw error;
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
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

export async function getProductById(id?: string): Promise<Product | null> {
  if (!id) return null;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });
    if (!product) return null;
    const metadata = await getFallbackMetadata(product.id);
    return toProductModel({
      ...(product as Record<string, unknown>),
      ...metadata,
    });
  } catch (error) {
    if (!isGalleryRelationUnavailable(error)) throw error;
    const product = await prisma.product.findUnique({ where: { id } });
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
