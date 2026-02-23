import { ProductGrid } from "@/components/product/ProductGrid";
import { Link } from '@/i18n/routing';

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await searchParams;
    const category = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined;
    const subcategory = typeof resolvedParams.subcategory === 'string' ? resolvedParams.subcategory : undefined;
    const brand = typeof resolvedParams.brand === 'string' ? resolvedParams.brand : undefined;
    const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : "";
    const view = typeof resolvedParams.view === 'string' ? resolvedParams.view : "all";
    const isSaleOnly = view === "sale";
    const isNewOnly = view === "new";
    const isBestOnly = view === "best";
    const isComingSoonOnly = view === "coming-soon";
    const heading = subcategory ? subcategory : brand || category || "All Products";

    return (
        <div className="container mx-auto px-6 lg:px-20 py-12 mt-20">
            <div className="mb-8 text-center">
                <h1 className="font-serif text-4xl md:text-5xl capitalize mb-4">
                    {heading}
                </h1>
                {category && subcategory && (
                    <p className="text-muted-foreground">
                        <Link href={`/products?category=${encodeURIComponent(category)}`} className="hover:text-primary transition-colors hover:underline">
                            {category}
                        </Link>
                        {' / '}
                        <span className="text-foreground">{subcategory}</span>
                    </p>
                )}
            </div>

            <form method="GET" className="mb-8 rounded-xl border border-border bg-background p-4 md:p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Search product</label>
                        <input
                            type="text"
                            name="search"
                            defaultValue={search}
                            placeholder="Type product name..."
                            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Filter</label>
                        <select
                            name="view"
                            defaultValue={view}
                            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="all">All products</option>
                            <option value="sale">On sale</option>
                            <option value="new">New arrivals</option>
                            <option value="best">Best sellers</option>
                            <option value="coming-soon">Coming soon</option>
                        </select>
                    </div>
                </div>

                {category && <input type="hidden" name="category" value={category} />}
                {subcategory && <input type="hidden" name="subcategory" value={subcategory} />}
                {brand && <input type="hidden" name="brand" value={brand} />}

                <div className="mt-3 flex justify-end">
                    <button
                        type="submit"
                        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                    >
                        Apply
                    </button>
                </div>
            </form>

            <ProductGrid
                department={category}
                category={subcategory}
                brand={brand}
                search={search}
                discounted={isSaleOnly}
                newArrival={isNewOnly}
                bestSeller={isBestOnly}
                comingSoon={isComingSoonOnly}
            />
        </div>
    );
}
