import { NextResponse } from "next/server";
import { calculateOrderTotals, normalizeOrderItems, placeOrder } from "@/lib/order-placement";
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

interface CaptureOrderResponse {
  status?: string;
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id?: string;
        status?: string;
        amount?: {
          currency_code?: string;
          value?: string;
        };
      }>;
    };
  }>;
}

function amountsMatch(a: number, b: number) {
  return Math.abs(a - b) < 0.01;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        paypalOrderId?: string;
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

  const paypalOrderId = String(body?.paypalOrderId || "").trim();
  if (!paypalOrderId) {
    return NextResponse.json({ error: "Missing PayPal order ID" }, { status: 400 });
  }

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

    const capture = await paypalRequest<CaptureOrderResponse>(
      `/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: "POST",
      }
    );

    const payment =
      capture.purchase_units?.[0]?.payments?.captures?.find(
        (item) => item.status === "COMPLETED"
      ) || null;

    const capturedAmount = Number(payment?.amount?.value || 0);
    const capturedCurrency = String(payment?.amount?.currency_code || "").toUpperCase();

    if (
      capture.status !== "COMPLETED" ||
      !payment ||
      capturedCurrency !== "USD" ||
      !amountsMatch(capturedAmount, totals.total)
    ) {
      return NextResponse.json(
        { error: "PayPal payment could not be verified" },
        { status: 400 }
      );
    }

    const result = await placeOrder({
      email: totals.email,
      firstName: totals.firstName,
      lastName: totals.lastName,
      city: totals.city,
      currency: "USD",
      items: totals.normalizedItems,
      firstPurchaseSampleApplied: totals.firstPurchaseSampleApplied,
      shippingRewardApplied: totals.shippingRewardApplied,
      voucherDiscountAmount: Number(body?.voucherDiscountAmount || 0),
      paymentNote: `Paid with PayPal. Capture ID: ${payment.id || "unknown"}`,
    });

    return NextResponse.json({
      ok: true,
      order: {
        id: result.order.id,
        orderNumber: result.order.orderNumber,
        status: result.order.status,
        total: result.order.total,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to capture PayPal order",
      },
      { status: 500 }
    );
  }
}

