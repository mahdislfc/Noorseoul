import { Link } from '@/i18n/routing';
import { ArrowRight } from "lucide-react"

export function DiscoverBrands() {
    const brands = [
        {
            name: "COSRX",
            description: "Minimalist skincare with high-performance ingredients.",
            sold: "50M+ Sold",
            image: "https://placehold.co/600x400/f5f5f5/000?text=COSRX"
        },
        {
            name: "Laneige",
            description: "Advanced water science for luminous hydration.",
            sold: "20M+ Sold",
            image: "https://placehold.co/600x400/e0f7fa/000?text=Laneige"
        },
        {
            name: "Innisfree",
            description: "Natural benefits from the pristine island of Jeju.",
            sold: "30M+ Sold",
            image: "https://placehold.co/600x400/e8f5e9/000?text=Innisfree"
        },
        {
            name: "Sulwhasoo",
            description: "Holistic beauty powered by Korean herbal medicine.",
            sold: "10M+ Sold",
            image: "https://placehold.co/600x400/fff3e0/000?text=Sulwhasoo"
        },
        {
            name: "Banila Co",
            description: "Skincare designed for makeup lovers.",
            sold: "40M+ Sold",
            image: "https://placehold.co/600x400/fce4ec/000?text=Banila+Co"
        }
    ]

    return (
        <section className="py-20 px-6 lg:px-20 bg-background">
            <h2 className="font-serif text-3xl mb-12 text-center">Top Brands in Korea</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 group/brands">
                {brands.map((brand, index) => (
                    <Link key={index} href={`/brands/${brand.name}`} className="group relative overflow-hidden h-64 rounded-sm border hover:shadow-xl transition-all duration-500 group-hover/brands:opacity-40 hover:!opacity-100 hover:scale-[1.02] hover:brightness-110">
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                            style={{ backgroundImage: `url('${brand.image}')` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300" />

                        {/* Sold Badge */}
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-black text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                            {brand.sold}
                        </div>

                        <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                            <h3 className="font-serif text-xl mb-1">{brand.name}</h3>
                            <p className="text-white/80 text-xs mb-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 line-clamp-2">
                                {brand.description}
                            </p>
                            <div className="flex items-center text-[10px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 text-primary-foreground">
                                Shop Brand <ArrowRight className="ml-1 w-3 h-3" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
