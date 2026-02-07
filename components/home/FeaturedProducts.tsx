import { ProductCard } from "@/components/product/ProductCard"
import { useLocale } from 'next-intl';
import { getProducts } from "@/lib/data";

export function FeaturedProducts() {
    const locale = useLocale();
    const products = getProducts(locale);

    return (
        <section className="py-24 bg-accent/30 px-6 lg:px-20">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="font-serif text-4xl mb-4">The Best Sellers Collection</h2>
                <div className="w-24 h-0.5 bg-primary mx-auto mb-6"></div>
                <p className="text-muted-foreground font-light">Elevate your daily ritual with our most coveted essentials, trusted by experts and beloved by our elite clientele.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.filter(p => p.bestSeller).slice(0, 4).map((product) => (
                    <div key={product.id} className="h-full">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </section>
    )
}
