import { NextResponse } from "next/server";
import path from "path";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getAdminSessionCookie, isAdminSessionValid } from "@/lib/admin-auth";
import {
  normalizeBrandInput,
  normalizeCategoryInput,
  normalizeDepartmentInput,
} from "@/lib/product-taxonomy";
import fs from "fs/promises";
import {
  getFallbackGalleryMap,
  setFallbackGallery,
} from "@/lib/product-gallery-fallback";
import {
  getFallbackMetadataMap,
  setFallbackMetadata,
} from "@/lib/product-metadata-fallback";

export const runtime = "nodejs";

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

function buildEconomicalOption(
  metadata: Record<string, unknown> | undefined
) {
  const name =
    typeof metadata?.economicalOptionName === "string"
      ? metadata.economicalOptionName.trim()
      : "";
  const price =
    typeof metadata?.economicalOptionPrice === "number" &&
    Number.isFinite(metadata.economicalOptionPrice) &&
    metadata.economicalOptionPrice > 0
      ? metadata.economicalOptionPrice
      : null;
  const quantity =
    typeof metadata?.economicalOptionQuantity === "number" &&
    Number.isInteger(metadata.economicalOptionQuantity) &&
    metadata.economicalOptionQuantity > 1
      ? metadata.economicalOptionQuantity
      : undefined;

  if (!name || typeof price !== "number") return undefined;
  return { name, price, quantity };
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

export async function GET() {
  const authError = await ensureAuthorized();
  if (authError) return authError;

  try {
    const products = await prisma.product.findMany({
      include: { images: { orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
    const metadataMap = await getFallbackMetadataMap();

    const normalized = products.map((product) => ({
      ...(metadataMap[product.id] || {}),
      ...product,
      images: product.images.map((image) => image.url),
      image: product.images[0]?.url || product.image,
      economicalOption: buildEconomicalOption(
        (metadataMap[product.id] || {}) as Record<string, unknown>
      ),
    }));

    return NextResponse.json({ products: normalized });
  } catch (error) {
    if (!isGalleryRelationUnavailable(error)) throw error;
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    const galleryMap = await getFallbackGalleryMap();
    const metadataMap = await getFallbackMetadataMap();
    const normalized = products.map((product) => ({
      ...(metadataMap[product.id] || {}),
      ...product,
      image: galleryMap[product.id]?.[0] || product.image,
      images:
        galleryMap[product.id]?.length
          ? galleryMap[product.id]
          : product.image
            ? [product.image]
            : [],
      economicalOption: buildEconomicalOption(
        (metadataMap[product.id] || {}) as Record<string, unknown>
      ),
    }));
    return NextResponse.json({ products: normalized });
  }
}

export async function POST(request: Request) {
  const authError = await ensureAuthorized();
  if (authError) return authError;

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
  );
  const imageFiles = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!name || !price || !brand || !category || !department) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (imageFiles.length === 0) {
    return NextResponse.json({ error: "At least one image is required" }, { status: 400 });
  }

  for (const imageFile of imageFiles) {
    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid image file" }, { status: 400 });
    }
  }

  const uploadedImages = await Promise.all(imageFiles.map((file) => saveImage(file)));
  const image = uploadedImages[0];

  const originalPrice =
    originalPriceRaw && String(originalPriceRaw).trim()
      ? Number(originalPriceRaw)
      : null;

  const product = await prisma.product.create({
    data: {
      name,
      description: description || null,
      price,
      originalPrice,
      currency,
      brand,
      category,
      department,
      image,
      bestSeller,
      newArrival,
      comingSoon,
      size: size || null,
    },
  });

  if ((prisma as { productImage?: unknown }).productImage) {
    try {
      await (prisma as { productImage: { createMany: (args: unknown) => Promise<unknown> } }).productImage.createMany({
        data: uploadedImages.map((url, index) => ({
          productId: product.id,
          url,
          sortOrder: index,
        })),
      });
    } catch {
      await setFallbackGallery(product.id, uploadedImages);
    }
  } else {
    await setFallbackGallery(product.id, uploadedImages);
  }
  await setFallbackMetadata(product.id, {
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

  return NextResponse.json({ product }, { status: 201 });
}
