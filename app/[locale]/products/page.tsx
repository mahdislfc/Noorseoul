import { ProductGrid } from "@/components/product/ProductGrid";
import { Link } from '@/i18n/routing';

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const resolvedParams = searchParams;
    const category = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined;
    const subcategory = typeof resolvedParams.subcategory === 'string' ? resolvedParams.subcategory : undefined;

    return (
        <div className="container mx-auto px-6 lg:px-20 py-12 mt-20">
            <div className="mb-8 text-center">
                <h1 className="font-serif text-4xl md:text-5xl capitalize mb-4">
                    {subcategory ? subcategory : category || "All Products"}
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

            <ProductGrid
                department={category}
                category={subcategory}
            />
        </div>
    );
}
