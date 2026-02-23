"use client";

import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import type { Product } from "@/lib/types";

interface SimilarProductsSectionProps {
  products: Product[];
}

function formatAmount(amount: number) {
  return Number.isInteger(amount) ? amount.toString() : amount.toFixed(2);
}

export function SimilarProductsSection({ products }: SimilarProductsSectionProps) {
  const { addToCart, setIsOpen } = useCart();

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      currency: product.currency || "USD",
    });
    toast.success("Item added to cart", {
      description: `${product.name} (x1)`,
      action: {
        label: "View Cart",
        onClick: () => setIsOpen(true),
      },
    });
  };

  return (
    <section className="rounded-xl border border-border bg-background p-6">
      <h2 className="text-2xl font-serif">Similar products</h2>
      {products.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No similar products linked yet.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-lg border border-border p-3 transition-colors hover:border-primary/50"
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-36 w-full rounded-md border object-cover"
              />
              <p className="mt-3 line-clamp-2 text-sm font-semibold">{product.name}</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-sm font-semibold text-primary">
                  {formatAmount(product.price)} {product.currency}
                </p>
                {typeof product.originalPrice === "number" && product.originalPrice > product.price && (
                  <p className="text-xs text-muted-foreground line-through">
                    {formatAmount(product.originalPrice)} {product.currency}
                  </p>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to cart
                </Button>
                <Link
                  href={`/products/${product.id}`}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

