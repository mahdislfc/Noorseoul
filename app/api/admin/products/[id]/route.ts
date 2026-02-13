import { NextResponse } from "next/server";
import path from "path";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";
import { getAdminSessionCookie, isAdminSessionValid } from "@/lib/admin-auth";

export const runtime = "nodejs";

function ensureAuthorized() {
  const session = getAdminSessionCookie();
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authError = ensureAuthorized();
  if (authError) return authError;

  const formData = await request.formData();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const price = Number(formData.get("price") || 0);
  const originalPriceRaw = formData.get("originalPrice");
  const currency = String(formData.get("currency") || "USD").trim() || "USD";
  const brand = String(formData.get("brand") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const department = String(formData.get("department") || "").trim();
  const size = String(formData.get("size") || "").trim();
  const bestSeller = toBool(formData.get("bestSeller"));
  const newArrival = toBool(formData.get("newArrival"));
  const comingSoon = toBool(formData.get("comingSoon"));
  const imageFile = formData.get("image");

  if (!name || !price || !brand || !category || !department) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const originalPrice =
    originalPriceRaw && String(originalPriceRaw).trim()
      ? Number(originalPriceRaw)
      : null;

  const data: any = {
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

  if (imageFile instanceof File && imageFile.size > 0) {
    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid image file" }, { status: 400 });
    }
    data.image = await saveImage(imageFile);
  }

  const product = await prisma.product.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json({ product });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const authError = ensureAuthorized();
  if (authError) return authError;

  const existing = await prisma.product.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.product.delete({ where: { id: params.id } });

  if (existing.image && existing.image.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", existing.image);
    try {
      await fs.unlink(filePath);
    } catch {
      // ignore missing file
    }
  }

  return NextResponse.json({ ok: true });
}
