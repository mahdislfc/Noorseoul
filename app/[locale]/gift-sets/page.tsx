import { useTranslations } from 'next-intl';
import { ProductGrid } from "@/components/product/ProductGrid";

export default function GiftSetsPage() {
    return (
        <div className="container mx-auto px-6 lg:px-20 py-12 mt-20">
            <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center">Gift Sets</h1>
            <div className="mb-12 text-center text-muted-foreground max-w-2xl mx-auto">
                <p>Curated collections for your loved ones.</p>
            </div>

            {/* You can filter by category or specific tag if available later */}
            <ProductGrid category="Gift Sets" />
        </div>
    )
}
