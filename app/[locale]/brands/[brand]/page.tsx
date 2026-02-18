import { ProductGrid } from "@/components/product/ProductGrid";
import { Suspense } from "react";

interface BrandPageProps {
    params: Promise<{
        brand: string;
        locale: string;
    }>;
}

export default async function BrandPage({ params }: BrandPageProps) {
    const { brand } = await params;
    const decodedBrand = decodeURIComponent(brand);

    return (
        <div className="container mx-auto px-6 lg:px-20 py-12 mt-20">
            <h1 className="font-serif text-4xl md:text-6xl mb-16 text-center uppercase tracking-widest">{decodedBrand}</h1>

            <div className="flex-1">
                <Suspense fallback={<div className="grid grid-cols-3 gap-8"><div className="h-64 bg-muted animate-pulse" /></div>}>
                    <ProductGrid brand={decodedBrand} />
                </Suspense>
            </div>
        </div>
    )
}
