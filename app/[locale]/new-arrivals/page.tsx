import { ProductGrid } from "@/components/product/ProductGrid";
import { getTranslations } from 'next-intl/server';

export default async function NewArrivalsPage() {
    const t = await getTranslations('Navigation');

    return (
        <div className="container mx-auto px-6 lg:px-20 py-12 mt-20">
            <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center">{t('newArrivals')}</h1>
            <div className="bg-accent/20 p-6 rounded-lg mb-10 text-center">
                <p className="text-primary font-bold tracking-widest uppercase">Limited Time Offers</p>
            </div>
            <ProductGrid newArrival={true} />
        </div>
    )
}
