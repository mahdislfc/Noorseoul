import { getProducts } from "@/lib/data";
import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { getLocale } from "next-intl/server";

interface ProductGridProps {
    category?: string;
    department?: string;
    newArrival?: boolean;
    bestSeller?: boolean;
    brand?: string;
    discounted?: boolean;
    comingSoon?: boolean;
}

export async function ProductGrid({ category, department, newArrival, bestSeller, brand, discounted, comingSoon }: ProductGridProps) {
    const locale = await getLocale();
    const products: Product[] = await getProducts(locale);

    const filteredProducts = products.filter(product => {
        if (category && product.category.toLowerCase() !== category.toLowerCase()) return false;
        if (department && product.department.toLowerCase() !== department.toLowerCase()) return false;
        if (newArrival && !product.newArrival) return false;
        if (bestSeller && !product.bestSeller) return false;
        if (brand && product.brand !== brand) return false;
        if (discounted && !product.originalPrice) return false;
        if (comingSoon && !product.comingSoon) return false;
        return true;
    });

    if (filteredProducts.length === 0) {
        return (
            <div className="py-20 text-center text-muted-foreground">
                <p>No products found in this collection.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 group/products">
            {filteredProducts.map(product => (
                <div key={product.id} className="h-full transition-all duration-500 group-hover/products:opacity-40 hover:!opacity-100 hover:scale-[1.02] hover:brightness-105">
                    <ProductCard product={product} />
                </div>
            ))}
        </div>
    )
}
