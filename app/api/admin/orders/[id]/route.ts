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

const VALID_STATUSES = new Set([
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authError = await ensureAuthorized();
  if (authError) return authError;
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const status = String(body?.status || "").toUpperCase();

  if (!VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: { items: true },
  });

  return NextResponse.json({ order });
}
