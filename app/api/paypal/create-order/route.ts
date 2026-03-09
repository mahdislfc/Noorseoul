import { NextResponse } from "next/server";
import { calculateOrderTotals, normalizeOrderItems } from "@/lib/order-placement";
import { paypalRequest } from "@/lib/paypal";

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

interface CreateOrderResponse {
  id: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        email?: string;
        firstName?: string;
        lastName?: string;
        city?: string;
        currency?: string;
        items?: IncomingOrderItem[];
        firstPurchaseSampleApplied?: boolean;
        shippingRewardApplied?: boolean;
        voucherDiscountAmount?: number;
      }
    | null;

  try {
    const sourceCurrency =
      String(body?.currency || "USD").trim().toUpperCase() || "USD";
    const paypalItems = normalizeOrderItems(body?.items || [], sourceCurrency, "USD");
    const totals = await calculateOrderTotals({
      email: String(body?.email || "").trim(),
      firstName: String(body?.firstName || "").trim(),
      lastName: String(body?.lastName || "").trim(),
      city: String(body?.city || "").trim(),
      currency: "USD",
      items: paypalItems,
      firstPurchaseSampleApplied: body?.firstPurchaseSampleApplied === true,
      shippingRewardApplied: body?.shippingRewardApplied === true,
      voucherDiscountAmount: Number(body?.voucherDiscountAmount || 0),
    });
    const data = await paypalRequest<CreateOrderResponse>("/v2/checkout/orders", {
      method: "POST",
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: totals.total.toFixed(2),
              breakdown: {
                item_total: { currency_code: "USD", value: totals.subtotal.toFixed(2) },
                shipping: { currency_code: "USD", value: totals.shipping.toFixed(2) },
                tax_total: { currency_code: "USD", value: totals.vat.toFixed(2) },
                discount: { currency_code: "USD", value: totals.appliedDiscount.toFixed(2) },
              },
            },
            items: totals.normalizedItems.map((item) => ({
              name: item.shade ? `${item.name} - ${item.shade}` : item.name,
              quantity: String(item.quantity),
              unit_amount: {
                currency_code: "USD",
                value: item.price.toFixed(2),
              },
            })),
          },
        ],
      }),
    });

    return NextResponse.json({ orderId: data.id });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create PayPal order",
      },
      { status: 500 }
    );
  }
}
