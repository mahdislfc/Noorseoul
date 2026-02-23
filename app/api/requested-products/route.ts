import { NextResponse } from "next/server";
import path from "path";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function saveImage(file: File) {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "requested-products");
  await fs.mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name || "") || ".jpg";
  const fileName = `${randomUUID()}${ext}`;
  const filePath = path.join(uploadDir, fileName);
  const arrayBuffer = await file.arrayBuffer();

  await fs.writeFile(filePath, Buffer.from(arrayBuffer));
  return `/uploads/requested-products/${fileName}`;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get("name") || "").trim();
  const note = String(formData.get("note") || "").trim();
  const productUrl = String(formData.get("productUrl") || "").trim();
  const imageFile = formData.get("image");

  if (!name) {
    return NextResponse.json({ error: "Product name is required" }, { status: 400 });
  }

  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return NextResponse.json({ error: "Image is required" }, { status: 400 });
  }

  if (!imageFile.type.startsWith("image/")) {
    return NextResponse.json({ error: "Invalid image file" }, { status: 400 });
  }

  let normalizedProductUrl: string | null = null;
  if (productUrl) {
    try {
      const parsedUrl = new URL(productUrl);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        throw new Error("Invalid URL protocol");
      }
      normalizedProductUrl = parsedUrl.toString();
    } catch {
      return NextResponse.json({ error: "Invalid product URL" }, { status: 400 });
    }
  }

  const image = await saveImage(imageFile);

  const requestedProduct = await prisma.requestedProduct.create({
    data: {
      name,
      note: note || null,
      productUrl: normalizedProductUrl,
      image,
    },
  });

  return NextResponse.json({ requestedProduct }, { status: 201 });
}
