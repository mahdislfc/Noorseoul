import { Link } from '@/i18n/routing';
import { ArrowRight } from "lucide-react"
import { useTranslations } from 'next-intl';

export function DiscoverBrands() {
    const t = useTranslations('Home.brands')
    const brands = [
        {
            name: "COSRX",
            descriptionKey: "cosrxDesc",
            soldKey: "sold50",
            image: "/images/cosrx-brand-thumb.avif",
            backgroundPosition: "15% center"
        },
        {
            name: "Laneige",
            descriptionKey: "laneigeDesc",
            soldKey: "sold20",
            image: "/images/laneige-brand-thumb.avif"
        },
        {
            name: "Innisfree",
            descriptionKey: "innisfreeDesc",
            soldKey: "sold30",
            image: "/images/innisfree-brand-thumb.png"
        },
        {
            name: "Sulwhasoo",
            descriptionKey: "sulwhasooDesc",
            soldKey: "sold10",
            image: "/images/sulwhasoo-brand-thumb.avif"
        },
        {
            name: "Banila Co",
            descriptionKey: "banilaDesc",
            soldKey: "sold40",
            image: "/images/banila-co-brand-thumb.png"
        }
    ]

    return (
        <section className="py-20 px-6 lg:px-20 bg-background">
            <h2 className="font-serif text-3xl mb-12 text-center">{t('title')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 group/brands">
                {brands.map((brand, index) => (
                    <Link key={index} href={`/brands/${brand.name}`} className="group relative overflow-hidden h-64 rounded-sm border hover:shadow-xl transition-all duration-500 group-hover/brands:opacity-40 hover:!opacity-100 hover:scale-[1.02] hover:brightness-110">
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                            style={{
                                backgroundImage: `url('${brand.image}')`,
                                backgroundPosition: brand.backgroundPosition || "center"
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/30 transition-opacity duration-300" />

                        {/* Sold Badge */}
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-black text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                            {t(brand.soldKey)}
                        </div>

                        <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                            <h3 className="font-serif text-xl mb-1">{brand.name}</h3>
                            <p className="text-white/80 text-xs mb-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 line-clamp-2">
                                {t(brand.descriptionKey)}
                            </p>
                            <div className="flex items-center text-[10px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 text-primary-foreground">
                                {t('shopBrand')} <ArrowRight className="ml-1 w-3 h-3" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
