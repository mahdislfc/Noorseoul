"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: Record<string, unknown>) => {
        render: (selector: HTMLElement) => Promise<void>;
        close?: () => Promise<void>;
      };
    };
  }
}

interface CartItemPayload {
  id: string;
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  shade?: string;
  currency?: string;
}

interface PayPalCheckoutButtonProps {
  disabled?: boolean;
  payload: {
    email: string;
    firstName: string;
    lastName: string;
    city: string;
    currency: string;
    items: CartItemPayload[];
    firstPurchaseSampleApplied: boolean;
    shippingRewardApplied: boolean;
    voucherDiscountAmount: number;
  };
  onError: (message: string) => void;
  onSuccess: (orderNumber: string) => void;
}

const PAYPAL_SCRIPT_ID = "paypal-sdk-script";

export function PayPalCheckoutButton({
  disabled,
  payload,
  onError,
  onSuccess,
}: PayPalCheckoutButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    const clientId = (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "").trim();
    if (!clientId) {
      onError("Missing NEXT_PUBLIC_PAYPAL_CLIENT_ID");
      return;
    }

    if (window.paypal) {
      Promise.resolve().then(() => setSdkReady(true));
      return;
    }

    const existing = document.getElementById(PAYPAL_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => setSdkReady(true), { once: true });
      existing.addEventListener(
        "error",
        () => onError("Failed to load PayPal SDK"),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = PAYPAL_SCRIPT_ID;
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      clientId
    )}&currency=USD&intent=capture`;
    script.async = true;
    script.onload = () => setSdkReady(true);
    script.onerror = () => onError("Failed to load PayPal SDK");
    document.body.appendChild(script);
  }, [onError]);

  useEffect(() => {
    if (!sdkReady || !containerRef.current || !window.paypal) return;
    if (disabled) {
      containerRef.current.innerHTML = "";
      return;
    }

    containerRef.current.innerHTML = "";
    const buttons = window.paypal.Buttons({
      createOrder: async () => {
        onError("");
        const response = await fetch("/api/paypal/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.orderId) {
          throw new Error(data?.error || "Failed to create PayPal order");
        }
        return data.orderId;
      },
      onApprove: async (data: Record<string, unknown>) => {
        const paypalOrderId = String(data.orderID || "").trim();
        const response = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            paypalOrderId,
          }),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || !result?.order?.orderNumber) {
          throw new Error(result?.error || "Failed to capture PayPal payment");
        }
        onSuccess(result.order.orderNumber);
      },
      onError: (error: unknown) => {
        onError(error instanceof Error ? error.message : "PayPal checkout failed");
      },
    });

    void buttons.render(containerRef.current);
  }, [disabled, onError, onSuccess, payload, sdkReady]);

  return <div ref={containerRef} className={disabled ? "pointer-events-none opacity-50" : ""} />;
}
