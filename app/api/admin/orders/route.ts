import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionCookie, isAdminSessionValid } from "@/lib/admin-auth";

export const runtime = "nodejs";

function isMissingOrderNoteColumnError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2022"
  );
}

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

  let orders: Array<Record<string, unknown>> = [];

  try {
    orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        customerEmail: true,
        firstName: true,
        lastName: true,
        city: true,
        orderNote: true,
        currency: true,
        subtotal: true,
        vat: true,
        shipping: true,
        total: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        items: true,
      },
    });
  } catch (error) {
    if (!isMissingOrderNoteColumnError(error)) throw error;

    orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        customerEmail: true,
        firstName: true,
        lastName: true,
        city: true,
        currency: true,
        subtotal: true,
        vat: true,
        shipping: true,
        total: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        items: true,
      },
    });
  }

  return NextResponse.json({ orders });
}
