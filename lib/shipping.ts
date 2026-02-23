export function getShippingCostForSubtotal(subtotal: number) {
  if (subtotal < 100) return 10;
  if (subtotal <= 200) return 18;
  if (subtotal <= 250) return 20;
  return 25;
}
