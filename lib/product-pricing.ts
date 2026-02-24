import type { DisplayCurrency } from "@/lib/display-currency";
import type { Product } from "@/lib/types";

function hasPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function resolveDisplayPrice(
  product: Pick<Product, "price" | "currency" | "priceAed" | "priceT">,
  displayCurrency: DisplayCurrency
) {
  if (displayCurrency === "AED" && hasPositiveNumber(product.priceAed)) {
    return { amount: product.priceAed, fromCurrency: "AED" as const };
  }
  if (displayCurrency === "T" && hasPositiveNumber(product.priceT)) {
    return { amount: product.priceT, fromCurrency: "T" as const };
  }
  return {
    amount: product.price,
    fromCurrency: (product.currency || "USD").toUpperCase(),
  };
}

export function resolveDisplayOriginalPrice(
  product: Pick<
    Product,
    "originalPrice" | "originalPriceAed" | "originalPriceT" | "currency"
  >,
  displayCurrency: DisplayCurrency
) {
  if (displayCurrency === "AED" && hasPositiveNumber(product.originalPriceAed)) {
    return { amount: product.originalPriceAed, fromCurrency: "AED" as const };
  }
  if (displayCurrency === "T" && hasPositiveNumber(product.originalPriceT)) {
    return { amount: product.originalPriceT, fromCurrency: "T" as const };
  }
  if (!hasPositiveNumber(product.originalPrice)) return null;
  return {
    amount: product.originalPrice,
    fromCurrency: (product.currency || "USD").toUpperCase(),
  };
}
