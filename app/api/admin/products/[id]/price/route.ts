import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionCookie, isAdminSessionValid } from "@/lib/admin-auth";
import { getFallbackMetadata, setFallbackMetadata } from "@/lib/product-metadata-fallback";

export const runtime = "nodejs";

type RouteParams = { id: string } | Promise<{ id: string }>;

async function ensureAuthorized() {
  const session = await getAdminSessionCookie();
  if (!isAdminSessionValid(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

async function resolveRouteId(params: RouteParams) {
  const resolved = await params;
  return (resolved?.id || "").trim();
}

function parsePositiveNumber(value: unknown, fieldName: string) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} must be greater than 0`);
  }
  return parsed;
}

function parseDateInput(value: unknown, fieldName: string) {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a date string`);
  }
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new Error(`${fieldName} must be in YYYY-MM-DD format`);
  }
  return trimmed;
}

export async function PATCH(
  request: Request,
  { params }: { params: RouteParams }
) {
  const authError = await ensureAuthorized();
  if (authError) return authError;

  const id = await resolveRouteId(params);
  if (!id) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as
    | Record<string, unknown>
    | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  let price: number | undefined;
  let originalPrice: number | undefined;
  let priceAed: number | undefined;
  let originalPriceAed: number | undefined;
  let priceT: number | undefined;
  let originalPriceT: number | undefined;
  let sourceSaleStart: string | undefined;
  let sourceSaleEnd: string | undefined;
  try {
    price = parsePositiveNumber(body.price, "USD price");
    originalPrice = parsePositiveNumber(body.originalPrice, "USD original price");
    priceAed = parsePositiveNumber(body.priceAed, "AED price");
    originalPriceAed = parsePositiveNumber(
      body.originalPriceAed,
      "AED original price"
    );
    priceT = parsePositiveNumber(body.priceT, "T price");
    originalPriceT = parsePositiveNumber(body.originalPriceT, "T original price");
    sourceSaleStart = parseDateInput(body.sourceSaleStart, "Sale start");
    sourceSaleEnd = parseDateInput(body.sourceSaleEnd, "Sale end");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid price value";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (
    typeof price !== "number" &&
    typeof originalPrice !== "number" &&
    typeof priceAed !== "number" &&
    typeof originalPriceAed !== "number" &&
    typeof priceT !== "number" &&
    typeof originalPriceT !== "number" &&
    typeof sourceSaleStart === "undefined" &&
    typeof sourceSaleEnd === "undefined"
  ) {
    return NextResponse.json(
      { error: "No price fields were provided" },
      { status: 400 }
    );
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (typeof price === "number" || typeof originalPrice === "number") {
    await prisma.product.update({
      where: { id },
      data: {
        ...(typeof price === "number" ? { price } : {}),
        ...(typeof originalPrice === "number" ? { originalPrice } : {}),
      },
    });
  }

  if (
    typeof priceAed === "number" ||
    typeof originalPriceAed === "number" ||
    typeof priceT === "number" ||
    typeof originalPriceT === "number" ||
    typeof sourceSaleStart !== "undefined" ||
    typeof sourceSaleEnd !== "undefined"
  ) {
    const existingMetadata = await getFallbackMetadata(id);
    await setFallbackMetadata(id, {
      ...existingMetadata,
      ...(typeof priceAed === "number" ? { priceAed } : {}),
      ...(typeof originalPriceAed === "number" ? { originalPriceAed } : {}),
      ...(typeof priceT === "number" ? { priceT } : {}),
      ...(typeof originalPriceT === "number" ? { originalPriceT } : {}),
      ...(typeof sourceSaleStart !== "undefined" ? { sourceSaleStart } : {}),
      ...(typeof sourceSaleEnd !== "undefined" ? { sourceSaleEnd } : {}),
      ...(typeof sourceSaleEnd !== "undefined" ? { saleEndsAt: sourceSaleEnd } : {}),
    });
  }

  return NextResponse.json({ success: true });
}
