"use client"

import { Button } from "@/components/ui/button"
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export function Hero() {
    const t = useTranslations('Hero');

    return (
        <section className="relative h-[85vh] w-full overflow-hidden">
            <div className="absolute inset-0">
                <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `linear-gradient(to right, rgba(200,200,200,0.3) 0%, rgba(200,200,200,0.1) 50%), url('/images/hero-main.jpg')` }}
                />
            </div>
            <div className="relative h-full flex flex-col justify-center px-6 lg:px-40 max-w-5xl z-10">
                <span className="text-primary font-bold tracking-[0.3em] uppercase text-sm mb-4 animate-fade-in">
                    Seoul Luxury Skincare
                </span>
                <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-black leading-tight mb-8">
                    {t.rich('headline', {
                        br: () => <br />,
                        span: (chunks) => <span className="italic">{chunks}</span>
                    })}
                </h1>
                <p className="text-black text-lg md:text-xl max-w-xl mb-10 leading-relaxed font-light">
                    {t('subheadline')}
                </p>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-5">
                        <Link href="/best-sellers">
                            <Button size="lg" className="rounded-none h-14 px-8 text-lg bg-black text-white hover:bg-black/80 shadow-lg hover:shadow-xl transition-all">{t('shopNow')}</Button>
                        </Link>
                        <Link href="/register">
                            <Button variant="hero-outline" size="lg" className="rounded-none h-14 px-8 text-lg bg-white/90 text-black border-2 border-white hover:bg-white hover:scale-105 shadow-lg transition-all">
                                {t('becomeMember')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
