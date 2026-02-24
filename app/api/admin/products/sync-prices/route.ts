import { NextResponse } from "next/server";
import { getAdminSessionCookie, isAdminSessionValid } from "@/lib/admin-auth";
import { syncProductPricesFromSourceUrls } from "@/lib/source-price-sync";

export const runtime = "nodejs";

async function ensureAuthorized() {
  const session = await getAdminSessionCookie();
  if (!isAdminSessionValid(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function POST(request: Request) {
  const authError = await ensureAuthorized();
  if (authError) return authError;

  const body = await request.json().catch(() => ({}));
  const productId = String(body?.productId || "").trim();
  const limitRaw = Number(body?.limit || 0);
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.floor(limitRaw) : undefined;

  try {
    const result = await syncProductPricesFromSourceUrls({
      productId: productId || undefined,
      limit,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to sync source prices",
      },
      { status: 500 }
    );
  }
}
