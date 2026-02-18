import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionCookie, isAdminSessionValid } from "@/lib/admin-auth";

export const runtime = "nodejs";

async function ensureAuthorized() {
  const session = await getAdminSessionCookie();
  if (!isAdminSessionValid(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const authError = await ensureAuthorized();
  if (authError) return authError;

  const requestedProducts = await prisma.requestedProduct.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ requestedProducts });
}
