import { ProductGrid } from "@/components/product/ProductGrid";
import { BrandSidebar } from "@/components/product/BrandSidebar";
import { Suspense } from "react";
import type { ComponentProps } from "react";

interface BrandPageProps {
    params: {
        brand: string;
        locale: string;
    };
    searchParams: {
        filter?: string;
    };
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
    const { brand } = params;
    const { filter = 'all' } = searchParams;
    const decodedBrand = decodeURIComponent(brand);

    // Filter mapping
    const gridProps: ComponentProps<typeof ProductGrid> = { brand: decodedBrand };

    switch (filter) {
        case 'best-sellers':
            gridProps.bestSeller = true;
            break;
        case 'discounted':
            gridProps.discounted = true;
            break;
        case 'cleansers':
            gridProps.category = "Cleansing foam/gel";
            break;
        case 'toners':
            gridProps.category = "Skin/toner";
            break;
        case 'serums':
            gridProps.category = "Essence/Serum/Ampoule";
            break;
        case 'moisturizers':
            gridProps.category = "cream";
            break;
        case 'eye-creams':
            gridProps.category = "Eye cream";
            break;
        case 'makeup':
            gridProps.department = "Makeup";
            break;
        case 'mists':
            gridProps.category = "Mist";
            break;
        case 'coming-soon':
            gridProps.comingSoon = true;
            break;
    }

    return (
        <div className="container mx-auto px-6 lg:px-20 py-12 mt-20">
            <h1 className="font-serif text-4xl md:text-6xl mb-16 text-center uppercase tracking-widest">{decodedBrand}</h1>

            <div className="flex flex-col lg:flex-row gap-12">
                <Suspense fallback={<div className="w-64 h-96 bg-muted animate-pulse" />}>
                    <BrandSidebar />
                </Suspense>

                <div className="flex-1">
                    <Suspense fallback={<div className="grid grid-cols-3 gap-8"><div className="h-64 bg-muted animate-pulse" /></div>}>
                        <ProductGrid {...gridProps} />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
