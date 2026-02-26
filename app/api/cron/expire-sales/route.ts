import { NextResponse } from "next/server";
import { expireSalesAndRestorePrices } from "@/lib/sale-expiry";

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
    const result = await expireSalesAndRestorePrices();
    return NextResponse.json(result, { status: result.ok ? 200 : 207 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        ranAt: new Date().toISOString(),
        error:
          error instanceof Error
            ? error.message
            : "Failed to run sale expiry",
      },
      { status: 500 }
    );
  }
}
