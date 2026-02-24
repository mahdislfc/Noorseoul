import { ProductGrid } from "@/components/product/ProductGrid";
import { getTranslations } from 'next-intl/server';

export default async function NewArrivalsPage() {
    const t = await getTranslations('Navigation');

    return (
        <div className="container mx-auto px-6 lg:px-20 py-12 mt-20">
            <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center">{t('newArrivals')}</h1>
            <ProductGrid newArrival={true} />
        </div>
    )
}
