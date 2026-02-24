import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { getShippingCostForSubtotal } from "@/lib/shipping";

export const runtime = "nodejs";

interface IncomingOrderItem {
  id: string;
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  shade?: string;
}

function isMissingOrderNoteColumnError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2022"
  );
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function createOrderNumber() {
  const stamp = Date.now().toString().slice(-8);
  const suffix = Math.floor(100 + Math.random() * 900);
  return `NS-${stamp}-${suffix}`;
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

  const normalizedItems = items
    .map((item) => ({
      id: String(item.id || "").trim(),
      productId: String(item.productId || "").trim(),
      name: String(item.name || "").trim(),
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 0),
      image: String(item.image || "").trim(),
      shade: String(item.shade || "").trim(),
    }))
    .filter(
      (item) =>
        item.id &&
        item.name &&
        item.image &&
        Number.isFinite(item.price) &&
        item.price > 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
    );

  if (normalizedItems.length === 0) {
    return NextResponse.json(
      { error: "No valid items were provided" },
      { status: 400 }
    );
  }

  let orderNote: string | null = null;
  if (firstPurchaseSampleApplied) {
    const totalItemQuantity = normalizedItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    if (totalItemQuantity < 3) {
      return NextResponse.json(
        { error: "Sample reward requires at least 3 items" },
        { status: 400 }
      );
    }

    const existingOrderCount = await prisma.order.count({
      where: { customerEmail: email },
    });

    if (existingOrderCount > 0) {
      return NextResponse.json(
        { error: "Sample reward is only valid for the first order" },
        { status: 400 }
      );
    }

    orderNote = `${firstName} ${lastName}'s first order + sample skincare product.`;
  }

  const subtotal = roundCurrency(
    normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  const baseShippingCost = getShippingCostForSubtotal(subtotal);
  const vat = roundCurrency(subtotal * 0.05);
  const shipping = shippingRewardApplied ? 0 : baseShippingCost;
  const total = roundCurrency(subtotal + vat + shipping);

  const order = await prisma.order.create({
    data: {
      orderNumber: createOrderNumber(),
      customerEmail: email,
      firstName,
      lastName,
      city,
      orderNote,
      currency,
      subtotal,
      vat,
      shipping,
      total,
      items: {
        create: normalizedItems.map((item) => ({
          name:
            item.shade && !item.name.toLowerCase().includes("(shade:")
              ? `${item.name} (Shade: ${item.shade})`
              : item.name,
          productId: item.productId || item.id,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
      },
    },
    include: { items: true },
  }).catch(async (error) => {
    if (!isMissingOrderNoteColumnError(error)) throw error;

    return prisma.order.create({
      data: {
        orderNumber: createOrderNumber(),
        customerEmail: email,
        firstName,
        lastName,
        city,
        currency,
        subtotal,
        vat,
        shipping,
        total,
        items: {
          create: normalizedItems.map((item) => ({
            productId: item.productId || item.id,
            name:
              item.shade && !item.name.toLowerCase().includes("(shade:")
                ? `${item.name} (Shade: ${item.shade})`
                : item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        },
      },
      include: { items: true },
    });
  });

  return NextResponse.json(
    {
      ok: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
      },
    },
    { status: 201 }
  );
}
