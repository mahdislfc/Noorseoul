import { ProductGrid } from "@/components/product/ProductGrid";
import { BrandSidebar } from "@/components/product/BrandSidebar";
import { Suspense } from "react";
import { getProducts } from "@/lib/data";
import { categoriesMatch, departmentsMatch } from "@/lib/product-taxonomy";

const BRAND_FILTER_OPTIONS = [
    { id: "all", label: "All" },
    { id: "best-sellers", label: "Best Sellers" },
    { id: "discounted", label: "Discounted Items" },
    { id: "cleansers", label: "Cleansers" },
    { id: "toners", label: "Toners" },
    { id: "serums", label: "Ampoules/Serums" },
    { id: "moisturizers", label: "Moisturizers" },
    { id: "eye-creams", label: "Eye Creams" },
    { id: "makeup", label: "Makeup" },
    { id: "mists", label: "Mists" },
    { id: "coming-soon", label: "Coming Soon" },
] as const;

interface BrandPageProps {
    params: Promise<{
        brand: string;
        locale: string;
    }>;
    searchParams: Promise<{
        filter?: string | string[];
    }>;
}

function normalizeFilterValue(value: string | string[] | undefined) {
    if (Array.isArray(value)) return value[0] || "all";
    return value || "all";
}

function mapFilterToGridProps(filter: string) {
    switch (filter) {
        case "best-sellers":
            return { bestSeller: true };
        case "discounted":
            return { discounted: true };
        case "coming-soon":
            return { comingSoon: true };
        case "makeup":
            return { department: "Makeup" };
        case "cleansers":
            return { category: "Cleansers" };
        case "toners":
            return { category: "Toners" };
        case "serums":
            return { category: "Serums" };
        case "moisturizers":
            return { category: "Moisturizers" };
        case "mists":
            return { category: "Mists" };
        case "eye-creams":
            return { search: "eye cream" };
        default:
            return {};
    }
}

function filterHasProducts(
    filterId: string,
    products: Array<{
        bestSeller: boolean
        comingSoon?: boolean | null
        originalPrice?: number | null
        price: number
        category: string
        department: string
        name: string
    }>
) {
    switch (filterId) {
        case "all":
            return products.length > 0;
        case "best-sellers":
            return products.some((product) => Boolean(product.bestSeller));
        case "discounted":
            return products.some(
                (product) =>
                    typeof product.originalPrice === "number" &&
                    product.originalPrice > product.price
            );
        case "coming-soon":
            return products.some((product) => Boolean(product.comingSoon));
        case "makeup":
            return products.some((product) => departmentsMatch("Makeup", product.department));
        case "cleansers":
            return products.some((product) => categoriesMatch("Cleansers", product.category));
        case "toners":
            return products.some((product) => categoriesMatch("Toners", product.category));
        case "serums":
            return products.some((product) => categoriesMatch("Serums", product.category));
        case "moisturizers":
            return products.some((product) => categoriesMatch("Moisturizers", product.category));
        case "mists":
            return products.some((product) => categoriesMatch("Mists", product.category));
        case "eye-creams":
            return products.some((product) => /eye\s*cream/i.test(product.name) || /eye/i.test(product.category));
        default:
            return false;
    }
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
    const { brand, locale } = await params;
    const resolvedSearchParams = await searchParams;
    const decodedBrand = decodeURIComponent(brand);
    const allProducts = await getProducts(locale);
    const brandProducts = allProducts.filter(
        (product) => product.brand.toLowerCase() === decodedBrand.toLowerCase()
    );
    const availableFilters = BRAND_FILTER_OPTIONS.filter((filter) =>
        filterHasProducts(filter.id, brandProducts)
    );
    const activeFilter = normalizeFilterValue(resolvedSearchParams.filter);
    const effectiveFilter = availableFilters.some((filter) => filter.id === activeFilter)
        ? activeFilter
        : "all";
    const gridFilterProps = mapFilterToGridProps(effectiveFilter);

    return (
        <div className="container mx-auto px-6 lg:px-20 py-12 mt-20">
            <h1 className="font-serif text-4xl md:text-6xl mb-16 text-center uppercase tracking-widest">{decodedBrand}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <aside className="lg:col-span-3 lg:sticky lg:top-28 h-fit">
                    <BrandSidebar filters={availableFilters} />
                </aside>

                <div className="lg:col-span-9">
                    <Suspense fallback={<div className="grid grid-cols-3 gap-8"><div className="h-64 bg-muted animate-pulse" /></div>}>
                        <ProductGrid brand={decodedBrand} {...gridFilterProps} />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
