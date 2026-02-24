import { NextResponse } from "next/server";
import { syncProductPricesFromSourceUrls } from "@/lib/source-price-sync";

export const runtime = "nodejs";

function isAuthorizedCron(request: Request) {
  const expected = process.env.CRON_SECRET || "";
  if (!expected) return false;
  const authHeader = request.headers.get("authorization") || "";
  return authHeader === `Bearer ${expected}`;
}

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await syncProductPricesFromSourceUrls();
    return NextResponse.json({
      ranAt: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        ranAt: new Date().toISOString(),
        error:
          error instanceof Error
            ? error.message
            : "Failed to sync product prices from source URLs",
      },
      { status: 500 }
    );
  }
}
