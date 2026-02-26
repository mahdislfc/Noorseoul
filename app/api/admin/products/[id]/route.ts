import { NextResponse } from "next/server";
import path from "path";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";
import { getAdminSessionCookie, isAdminSessionValid } from "@/lib/admin-auth";
import {
  normalizeBrandInput,
  normalizeCategoryInput,
  normalizeDepartmentInput,
} from "@/lib/product-taxonomy";
import {
  deleteFallbackGallery,
  getFallbackGallery,
  setFallbackGallery,
} from "@/lib/product-gallery-fallback";
import {
  deleteFallbackMetadata,
  getFallbackMetadata,
  setFallbackMetadata,
} from "@/lib/product-metadata-fallback";

export const runtime = "nodejs";

type RouteParams = { id: string } | Promise<{ id: string }>;

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

function isForeignKeyConstraintError(error: unknown) {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code?: string }).code || "")
      : "";
  return code === "P2003";
}

async function ensureAuthorized() {
  const session = await getAdminSessionCookie();
  if (!isAdminSessionValid(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

function toBool(value: FormDataEntryValue | null) {
  return value === "true" || value === "on";
}

function parseSimilarProductIds(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return Array.from(
      new Set(
        parsed
          .filter((entry): entry is string => typeof entry === "string")
          .map((id) => id.trim())
          .filter(Boolean)
      )
    );
  } catch {
    return [];
  }
}

function parseAdditionalCategories(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return Array.from(
      new Set(
        parsed
          .filter((entry): entry is string => typeof entry === "string")
          .map((entry) => normalizeCategoryInput(entry))
          .map((entry) => entry.trim())
          .filter(Boolean)
      )
    );
  } catch {
    return [];
  }
}

function parseColorShades(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry, index) => {
        if (!entry || typeof entry !== "object") return null;
        const record = entry as Record<string, unknown>;
        const id =
          typeof record.id === "string" && record.id.trim()
            ? record.id.trim()
            : `shade-${index + 1}`;
        const name = typeof record.name === "string" ? record.name.trim() : "";
        const price =
          typeof record.price === "number"
            ? record.price
            : Number(record.price || 0);
        const priceAed =
          typeof record.priceAed === "number"
            ? record.priceAed
            : Number(record.priceAed || 0);
        const priceT =
          typeof record.priceT === "number"
            ? record.priceT
            : Number(record.priceT || 0);
        if (!name) return null;
        const normalizedPrice =
          Number.isFinite(price) && price > 0 ? price : undefined;
        return {
          id,
          name,
          ...(typeof normalizedPrice === "number" ? { price: normalizedPrice } : {}),
          ...(Number.isFinite(priceAed) && priceAed > 0 ? { priceAed } : {}),
          ...(Number.isFinite(priceT) && priceT > 0 ? { priceT } : {}),
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  } catch {
    return [];
  }
}

async function saveImage(file: File) {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  const ext = path.extname(file.name || "");
  const fileName = `${randomUUID()}${ext}`;
  const filePath = path.join(uploadDir, fileName);
  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(arrayBuffer));
  return `/uploads/${fileName}`;
}

function parseImageOrder(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is string => typeof entry === "string");
  } catch {
    return [];
  }
}

async function resolveRouteId(params: RouteParams) {
  const resolved = await params;
  return (resolved?.id || "").trim();
}

export async function PUT(
  request: Request,
  { params }: { params: RouteParams }
) {
  const authError = await ensureAuthorized();
  if (authError) return authError;
  const id = await resolveRouteId(params);

  if (!id) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  const formData = await request.formData();

  const name = String(formData.get("name") || "").trim();
  const koreanName = String(formData.get("koreanName") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const descriptionAr = String(formData.get("descriptionAr") || "").trim();
  const descriptionFa = String(formData.get("descriptionFa") || "").trim();
  const priceAedRaw = String(formData.get("priceAed") || "").trim();
  const priceTRaw = String(formData.get("priceT") || "").trim();
  const priceAed = priceAedRaw ? Number(priceAedRaw) : undefined;
  const priceT = priceTRaw ? Number(priceTRaw) : undefined;
  const originalPriceAedRaw = String(formData.get("originalPriceAed") || "").trim();
  const originalPriceTRaw = String(formData.get("originalPriceT") || "").trim();
  const originalPriceAed = originalPriceAedRaw
    ? Number(originalPriceAedRaw)
    : undefined;
  const originalPriceT = originalPriceTRaw ? Number(originalPriceTRaw) : undefined;
  const priceRaw = String(formData.get("price") || "").trim();
  const hasManualPrice = priceRaw.length > 0;
  const parsedPrice = hasManualPrice ? Number(priceRaw) : 0;
  const originalPriceRaw = formData.get("originalPrice");
  const currency = String(formData.get("currency") || "USD").trim() || "USD";
  const brand = normalizeBrandInput(String(formData.get("brand") || ""));
  const category = normalizeCategoryInput(String(formData.get("category") || ""));
  const department = normalizeDepartmentInput(
    String(formData.get("department") || "")
  );
  const size = String(formData.get("size") || "").trim();
  const bestSeller = toBool(formData.get("bestSeller"));
  const newArrival = toBool(formData.get("newArrival"));
  const comingSoon = toBool(formData.get("comingSoon"));
  const ingredients = String(formData.get("ingredients") || "").trim();
  const skinType = String(formData.get("skinType") || "").trim();
  const scent = String(formData.get("scent") || "").trim();
  const waterResistance = String(formData.get("waterResistance") || "").trim();
  const sourceUrl = String(formData.get("sourceUrl") || "").trim();
  const sourceSaleStart = String(formData.get("sourceSaleStart") || "").trim();
  const sourceSaleEnd = String(formData.get("sourceSaleEnd") || "").trim();
  const bundleLabel = String(formData.get("bundleLabel") || "").trim();
  const bundleProductId = String(formData.get("bundleProductId") || "").trim();
  const economicalOptionName = String(
    formData.get("economicalOptionName") || ""
  ).trim();
  const economicalOptionPriceRaw = String(
    formData.get("economicalOptionPrice") || ""
  ).trim();
  const economicalOptionQuantityRaw = String(
    formData.get("economicalOptionQuantity") || ""
  ).trim();
  const economicalOptionPrice = economicalOptionPriceRaw
    ? Number(economicalOptionPriceRaw)
    : undefined;
  const economicalOptionQuantity = economicalOptionQuantityRaw
    ? Number(economicalOptionQuantityRaw)
    : undefined;
  const similarProductIds = parseSimilarProductIds(
    formData.get("similarProductIds")
  ).filter((productId) => productId !== id);
  const additionalCategoriesRaw = parseAdditionalCategories(
    formData.get("additionalCategories")
  );
  const additionalCategories = additionalCategoriesRaw.filter(
    (entry) => entry.toLowerCase() !== category.toLowerCase()
  );
  const colorShades = parseColorShades(formData.get("colorShades"));
  const imageFiles = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const imageOrder = parseImageOrder(formData.get("imageOrder"));

  if (!name || !brand || !category || !department) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (hasManualPrice && (!Number.isFinite(parsedPrice) || parsedPrice <= 0)) {
    return NextResponse.json({ error: "Price must be greater than 0" }, { status: 400 });
  }

  const originalPrice =
    originalPriceRaw && String(originalPriceRaw).trim()
      ? Number(originalPriceRaw)
      : null;

  const data: Record<string, unknown> = {
    name,
    description: description || null,
    price: hasManualPrice ? parsedPrice : 0,
    originalPrice,
    currency,
    brand,
    category,
    department,
    bestSeller,
    newArrival,
    comingSoon,
    size: size || null,
  };

  for (const imageFile of imageFiles) {
    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid image file" }, { status: 400 });
    }
  }

  const supportsProductImageModel = Boolean(
    (prisma as { productImage?: unknown }).productImage
  );

  let existing:
    | ({ image: string; images?: Array<{ url: string }> } & Record<string, unknown>)
    | null = null;
  if (supportsProductImageModel) {
    try {
      existing = (await prisma.product.findUnique({
        where: { id },
        include: { images: { orderBy: { sortOrder: "asc" } } },
      })) as unknown as ({ image: string; images?: Array<{ url: string }> } & Record<string, unknown>) | null;
    } catch (error) {
      if (!isGalleryRelationUnavailable(error)) throw error;
      existing = (await prisma.product.findUnique({
        where: { id },
      })) as unknown as ({ image: string; images?: Array<{ url: string }> } & Record<string, unknown>) | null;
    }
  } else {
    existing = (await prisma.product.findUnique({
      where: { id },
    })) as unknown as ({ image: string; images?: Array<{ url: string }> } & Record<string, unknown>) | null;
  }

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!hasManualPrice) {
    data.price = existing.price;
  }

  const fallbackGallery = await getFallbackGallery(id);
  const existingImageUrls =
    existing.images && existing.images.length > 0
      ? existing.images.map((image) => image.url)
      : fallbackGallery.length > 0
        ? fallbackGallery
        : existing.image
          ? [existing.image]
          : [];
  const existingUrls = new Set(existingImageUrls);
  const uploadedImages = await Promise.all(imageFiles.map((file) => saveImage(file)));
  const nextGallery: string[] = [];
  let newIndex = 0;
  const order = imageOrder.length > 0 ? imageOrder : existingImageUrls;

  for (const marker of order) {
    if (marker === "__new__") {
      const nextNew = uploadedImages[newIndex++];
      if (nextNew) nextGallery.push(nextNew);
      continue;
    }
    if (existingUrls.has(marker)) {
      nextGallery.push(marker);
    }
  }
  while (newIndex < uploadedImages.length) {
    nextGallery.push(uploadedImages[newIndex++]);
  }

  const uniqueGallery = Array.from(new Set(nextGallery));
  if (uniqueGallery.length === 0) {
    return NextResponse.json(
      { error: "At least one image is required." },
      { status: 400 }
    );
  }
  if (uniqueGallery.length > 0) {
    data.image = uniqueGallery[0];
  }

  const product = await prisma.product.update({
    where: { id },
    data,
  });

  if (supportsProductImageModel && (imageOrder.length > 0 || imageFiles.length > 0)) {
    const productImage = (prisma as {
      productImage: {
        deleteMany: (args: unknown) => Promise<unknown>;
        createMany: (args: unknown) => Promise<unknown>;
      };
    }).productImage;

    try {
      await productImage.deleteMany({ where: { productId: id } });
      if (uniqueGallery.length > 0) {
        await productImage.createMany({
          data: uniqueGallery.map((url, index) => ({
            productId: id,
            url,
            sortOrder: index,
          })),
        });
      }
      await deleteFallbackGallery(id);
    } catch {
      await setFallbackGallery(id, uniqueGallery);
    }
  }

  if (!supportsProductImageModel && (imageOrder.length > 0 || imageFiles.length > 0)) {
    await setFallbackGallery(id, uniqueGallery);
  }

  if (imageOrder.length > 0 || imageFiles.length > 0) {
    const removedImages = existingImageUrls.filter(
      (url) => !new Set(uniqueGallery).has(url)
    );
    for (const url of removedImages) {
      if (url.startsWith("/uploads/")) {
        const filePath = path.join(process.cwd(), "public", url);
        try {
          await fs.unlink(filePath);
        } catch {
          // ignore missing file
        }
      }
    }
  }

  const existingMetadata = await getFallbackMetadata(id);
  await setFallbackMetadata(id, {
    koreanName,
    descriptionAr,
    descriptionFa,
    priceAed,
    priceT,
    originalPriceAed,
    originalPriceT,
    ingredients,
    skinType,
    scent,
    waterResistance,
    sourceUrl,
    sourceSaleStart,
    sourceSaleEnd,
    bundleLabel,
    bundleProductId,
    additionalCategories,
    similarProductIds,
    economicalOptionName,
    economicalOptionPrice,
    economicalOptionQuantity,
    colorShades,
    sourcePriceCurrency: existingMetadata.sourcePriceCurrency,
    saleEndsAt: sourceSaleEnd || undefined,
    sourceLastSyncedAt: existingMetadata.sourceLastSyncedAt,
    sourceSyncError: existingMetadata.sourceSyncError,
  });

  return NextResponse.json({ product });
}

export async function DELETE(
  _request: Request,
  { params }: { params: RouteParams }
) {
  const authError = await ensureAuthorized();
  if (authError) return authError;
  const id = await resolveRouteId(params);

  if (!id) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  const supportsProductImageModel = Boolean(
    (prisma as { productImage?: unknown }).productImage
  );
  let gallery: Array<{ url: string }> = [];
  if (supportsProductImageModel) {
    try {
      gallery = await (prisma as {
        productImage: {
          findMany: (args: unknown) => Promise<Array<{ url: string }>>;
        };
      }).productImage.findMany({
        where: { productId: id },
      });
    } catch (error) {
      if (!isGalleryRelationUnavailable(error)) throw error;
      gallery = [];
    }
  }
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (supportsProductImageModel) {
    try {
      await (prisma as { productImage: { deleteMany: (args: unknown) => Promise<unknown> } }).productImage.deleteMany({
        where: { productId: id },
      });
    } catch (error) {
      if (!isGalleryRelationUnavailable(error)) throw error;
    }
  }
  await deleteFallbackGallery(id);
  await deleteFallbackMetadata(id);
  try {
    await prisma.product.delete({ where: { id } });
  } catch (error) {
    if (!isForeignKeyConstraintError(error)) throw error;
    await prisma.orderItem.updateMany({
      where: { productId: id },
      data: { productId: null },
    });
    await prisma.product.delete({ where: { id } });
  }

  if (existing.image && existing.image.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", existing.image);
    try {
      await fs.unlink(filePath);
    } catch {
      // ignore missing file
    }
  }

  for (const image of gallery) {
    if (image.url && image.url.startsWith("/uploads/") && image.url !== existing.image) {
      const filePath = path.join(process.cwd(), "public", image.url);
      try {
        await fs.unlink(filePath);
      } catch {
        // ignore missing file
      }
    }
  }

  return NextResponse.json({ ok: true });
}
