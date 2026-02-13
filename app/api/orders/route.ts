import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface IncomingOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function createOrderNumber() {
  const stamp = Date.now().toString().slice(-8);
  const suffix = Math.floor(100 + Math.random() * 900);
  return `NS-${stamp}-${suffix}`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const email = String(body?.email || "").trim();
  const firstName = String(body?.firstName || "").trim();
  const lastName = String(body?.lastName || "").trim();
  const city = String(body?.city || "").trim();
  const currency = String(body?.currency || "AED").trim().toUpperCase() || "AED";
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
      name: String(item.name || "").trim(),
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 0),
      image: String(item.image || "").trim(),
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

  const subtotal = roundCurrency(
    normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  const vat = roundCurrency(subtotal * 0.05);
  const shipping = 0;
  const total = roundCurrency(subtotal + vat + shipping);

  const order = await prisma.order.create({
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
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
      },
    },
    include: { items: true },
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
