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

export const runtime = "nodejs";

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

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
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
  const imageFile = formData.get("image");

  if (!name || !price || !brand || !category || !department) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!(imageFile instanceof File)) {
    return NextResponse.json({ error: "Image is required" }, { status: 400 });
  }

  if (!imageFile.type.startsWith("image/")) {
    return NextResponse.json({ error: "Invalid image file" }, { status: 400 });
  }

  const image = await saveImage(imageFile);

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

  return NextResponse.json({ product }, { status: 201 });
}
