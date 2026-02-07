import { ProductGrid } from "@/components/product/ProductGrid";
import { getTranslations } from 'next-intl/server';

export default async function MakeupPage() {
    const t = await getTranslations('Navigation');

    return (
        <div className="container mx-auto px-6 lg:px-20 py-12 mt-20">
            <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center">{t('makeup')}</h1>
            <ProductGrid department="makeup" />
        </div>
    )
}
