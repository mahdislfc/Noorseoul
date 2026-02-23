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
  const description = String(formData.get("description") || "").trim();
  const price = Number(formData.get("price") || 0);
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
  const imageFiles = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const imageOrder = parseImageOrder(formData.get("imageOrder"));

  if (!name || !price || !brand || !category || !department) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const originalPrice =
    originalPriceRaw && String(originalPriceRaw).trim()
      ? Number(originalPriceRaw)
      : null;

  const data: Record<string, unknown> = {
    name,
    description: description || null,
    price,
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

  await setFallbackMetadata(id, {
    ingredients,
    skinType,
    scent,
    waterResistance,
    bundleLabel,
    bundleProductId,
    similarProductIds,
    economicalOptionName,
    economicalOptionPrice,
    economicalOptionQuantity,
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
  const gallery = supportsProductImageModel
    ? await (prisma as { productImage: { findMany: (args: unknown) => Promise<Array<{ url: string }>> } }).productImage.findMany({
      where: { productId: id },
    })
    : [];
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (supportsProductImageModel) {
    try {
      await (prisma as { productImage: { deleteMany: (args: unknown) => Promise<unknown> } }).productImage.deleteMany({
        where: { productId: id },
      });
    } catch {
      // ignore legacy schema mismatch
    }
  }
  await deleteFallbackGallery(id);
  await deleteFallbackMetadata(id);
  await prisma.product.delete({ where: { id } });

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
