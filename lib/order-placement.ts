import { prisma } from "@/lib/prisma";
import { convertAmount } from "@/lib/display-currency";
import { getShippingCostForSubtotal } from "@/lib/shipping";

export interface OrderItemInput {
  id: string;
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  shade?: string;
  currency?: string;
}

export interface PlaceOrderInput {
  email: string;
  firstName: string;
  lastName: string;
  city: string;
  currency: string;
  items: OrderItemInput[];
  firstPurchaseSampleApplied?: boolean;
  shippingRewardApplied?: boolean;
  voucherDiscountAmount?: number;
  paymentNote?: string;
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

export function normalizeOrderItems(
  items: OrderItemInput[],
  defaultCurrency: string,
  targetCurrency?: "USD" | "AED" | "T"
) {
  return items
    .map((item) => {
      const sourceCurrency =
        String(item.currency || defaultCurrency || "USD").trim().toUpperCase() || "USD";
      const rawPrice = Number(item.price || 0);
      const convertedPrice =
        targetCurrency && sourceCurrency !== targetCurrency
          ? convertAmount(rawPrice, sourceCurrency, targetCurrency)
          : rawPrice;

      return {
        id: String(item.id || "").trim(),
        productId: String(item.productId || "").trim(),
        name: String(item.name || "").trim(),
        price: roundCurrency(convertedPrice),
        quantity: Number(item.quantity || 0),
        image: String(item.image || "").trim(),
        shade: String(item.shade || "").trim(),
        currency: targetCurrency || sourceCurrency,
      };
    })
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
}

export async function calculateOrderTotals(input: PlaceOrderInput) {
  const email = String(input.email || "").trim();
  const firstName = String(input.firstName || "").trim();
  const lastName = String(input.lastName || "").trim();
  const city = String(input.city || "").trim();
  const currency = String(input.currency || "AED").trim().toUpperCase() || "AED";
  const firstPurchaseSampleApplied = input.firstPurchaseSampleApplied === true;
  const shippingRewardApplied = input.shippingRewardApplied === true;
  const voucherDiscountAmount = Math.max(0, Number(input.voucherDiscountAmount || 0));
  const normalizedItems = normalizeOrderItems(input.items || [], currency);

  if (!email || !firstName || !lastName || !city) {
    throw new Error("Missing customer information");
  }
  if (normalizedItems.length === 0) {
    throw new Error("No valid items were provided");
  }

  let orderNote = input.paymentNote?.trim() || null;
  if (firstPurchaseSampleApplied) {
    const totalItemQuantity = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItemQuantity < 3) {
      throw new Error("Sample reward requires at least 3 items");
    }

    const existingOrderCount = await prisma.order.count({
      where: { customerEmail: email },
    });
    if (existingOrderCount > 0) {
      throw new Error("Sample reward is only valid for the first order");
    }

    const sampleNote = `${firstName} ${lastName}'s first order + sample skincare product.`;
    orderNote = orderNote ? `${sampleNote} ${orderNote}` : sampleNote;
  }

  const subtotal = roundCurrency(
    normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  const baseShippingCost = getShippingCostForSubtotal(subtotal);
  const appliedDiscount = Math.min(voucherDiscountAmount, subtotal);
  const discountedSubtotal = roundCurrency(Math.max(0, subtotal - appliedDiscount));
  const vat = roundCurrency(discountedSubtotal * 0.05);
  const shipping = shippingRewardApplied ? 0 : baseShippingCost;
  const total = roundCurrency(discountedSubtotal + vat + shipping);

  return {
    email,
    firstName,
    lastName,
    city,
    currency,
    firstPurchaseSampleApplied,
    shippingRewardApplied,
    normalizedItems,
    orderNote,
    subtotal,
    appliedDiscount,
    discountedSubtotal,
    vat,
    shipping,
    total,
  };
}

export async function placeOrder(input: PlaceOrderInput) {
  const {
    email,
    firstName,
    lastName,
    city,
    currency,
    normalizedItems,
    orderNote,
    subtotal,
    appliedDiscount,
    discountedSubtotal,
    vat,
    shipping,
    total,
  } = await calculateOrderTotals(input);

  const data = {
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
    ...(orderNote ? { orderNote } : {}),
    items: {
      create: normalizedItems.map((item) => ({
        productId: item.productId || item.id,
        name:
          item.shade && !item.name.toLowerCase().includes("(option:")
            ? `${item.name} (Option: ${item.shade})`
            : item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
    },
  };

  const order = await prisma.order
    .create({
      data,
      include: { items: true },
    })
    .catch(async (error) => {
      if (!isMissingOrderNoteColumnError(error)) throw error;
      const fallbackData = { ...data };
      delete fallbackData.orderNote;
      return prisma.order.create({
        data: fallbackData,
        include: { items: true },
      });
    });

  return {
    order,
    subtotal,
    appliedDiscount,
    discountedSubtotal,
    vat,
    shipping,
    total,
    currency,
    items: normalizedItems,
  };
}
