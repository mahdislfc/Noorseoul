import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

const categories = [
    {
        key: "makeup",
        href: "/makeup",
        image: "/images/makeup-thumb-final.png?v=20260220-2145"
    },
    {
        key: "skincare",
        href: "/skincare",
        image: "/images/skincare-thumb-v2.png"
    },
    {
        key: "newArrivals",
        href: "/new-arrivals",
        image: "/images/new-arrivals-thumb-final.png?v=20260220-2150",
        backgroundSize: "185%",
        backgroundPosition: "center 50%"
    },
    {
        key: "bestSellers",
        href: "/best-sellers",
        image: "/images/best-sellers-thumb-final.png?v=20260220-2154",
        backgroundSize: "185%",
        backgroundPosition: "center 50%"
    }
]

export function Categories() {
    const t = useTranslations('Home.categories')

    return (
        <section className="py-20 bg-background px-6 lg:px-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                <div>
                    <h2 className="font-serif text-4xl mb-2">{t('title')}</h2>
                    <p className="text-muted-foreground">{t('subtitle')}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 group/categories">
                {categories.map((category, index) => (
                    <Link href={category.href} key={index} className="group/card text-center transition-opacity duration-500 group-hover/categories:opacity-40 hover:!opacity-100">
                        <div className={`aspect-square rounded-full overflow-hidden border-2 transition-all duration-500 ease-out p-2 mb-4 border-transparent group-hover/card:border-primary group-hover/card:scale-105 group-hover/card:brightness-110 bg-secondary/20`}>
                            <div
                                className="w-full h-full rounded-full bg-cover bg-center"
                                style={
                                    category.image
                                        ? {
                                            backgroundImage: `url('${category.image}')`,
                                            backgroundSize: category.backgroundSize ?? undefined,
                                            backgroundPosition: category.backgroundPosition ?? undefined
                                        }
                                        : undefined
                                }
                            />
                        </div>
                        <h3 className={`font-bold uppercase tracking-widest text-sm transition-colors group-hover/card:text-primary`}>
                            {t(category.key)}
                        </h3>
                    </Link>
                ))}
            </div>
            <div className="mt-10 text-center">
                <Link href="/categories" className="inline-block text-primary font-bold border-b border-primary pb-1 uppercase tracking-tight text-lg">
                    {t('viewAll')}
                </Link>
            </div>
        </section>
    )
}
