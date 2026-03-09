import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { placeOrder } from "@/lib/order-placement";

export const runtime = "nodejs";

interface IncomingOrderItem {
  id: string;
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  shade?: string;
  currency?: string;
}

function isMissingOrderNoteColumnError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2022"
  );
}

function mapOrderStatus(status: string): "Processing" | "Shipped" | "Delivered" {
  if (status === "SHIPPED") return "Shipped";
  if (status === "DELIVERED") return "Delivered";
  return "Processing";
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let orders: Array<{
    id: string;
    createdAt: Date;
    status: string;
    total: number;
    orderNote?: string | null;
      items: Array<{
        id: string;
        productId: string | null;
        name: string;
        price: number;
        quantity: number;
        image: string;
      }>;
  }> = [];

  try {
    orders = await prisma.order.findMany({
      where: { customerEmail: user.email },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        status: true,
        total: true,
        orderNote: true,
        items: {
          select: {
            id: true,
            productId: true,
            name: true,
            price: true,
            quantity: true,
            image: true,
          },
        },
      },
    });
  } catch (error) {
    if (!isMissingOrderNoteColumnError(error)) throw error;

    orders = await prisma.order.findMany({
      where: { customerEmail: user.email },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        status: true,
        total: true,
        items: {
          select: {
            id: true,
            productId: true,
            name: true,
            price: true,
            quantity: true,
            image: true,
          },
        },
      },
    });
  }

  return NextResponse.json({
    orders: orders.map((order) => ({
      id: order.id,
      date: order.createdAt.toISOString(),
      status: mapOrderStatus(order.status),
      total: order.total,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
    })),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const email = String(body?.email || "").trim();
  const firstName = String(body?.firstName || "").trim();
  const lastName = String(body?.lastName || "").trim();
  const city = String(body?.city || "").trim();
  const currency = String(body?.currency || "AED").trim().toUpperCase() || "AED";
  const firstPurchaseSampleApplied = body?.firstPurchaseSampleApplied === true;
  const shippingRewardApplied = body?.shippingRewardApplied === true;
  const voucherDiscountAmount = Number(body?.voucherDiscountAmount || 0);
  const items = Array.isArray(body?.items) ? (body.items as IncomingOrderItem[]) : [];

  if (!email || !firstName || !lastName || !city) {
    return NextResponse.json(
      { error: "Missing customer information" },
      { status: 400 }
    );
  }

  if (items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
  }

  try {
    const result = await placeOrder({
      email,
      firstName,
      lastName,
      city,
      currency,
      firstPurchaseSampleApplied,
      shippingRewardApplied,
      voucherDiscountAmount,
      items,
    });

    return NextResponse.json(
      {
        ok: true,
        order: {
          id: result.order.id,
          orderNumber: result.order.orderNumber,
          status: result.order.status,
          total: result.order.total,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to place order",
      },
      { status: 400 }
    );
  }
}
