export function getShippingCostForSubtotal(subtotal: number) {
  if (subtotal <= 100) return 8.5;
  if (subtotal <= 200) return 13.5;
  if (subtotal <= 250) return 15;
  return 0;
}

