"use client"

import { useEffect, useState, type TouchEvent } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"

const HERO_SLIDES = [
    "/images/sulh.jpg",
    "/images/Banilaco_Still_01-1.webp",
    "/images/a90c12e1ef50119eea983051bb5c4de8.jpg",
    "/images/20240105172753726c316bc26246348c0bc34d27c2775abf8.jpg",
    "/images/optimised_beautyofjoseon_brand_compressed3_85bd5301-55f5-4453-941b-3dfa247bcc2f.webp",
    "/images/CORSXBrandPhoto_Edit1_compressed_png.webp",
]

export function Hero() {
    const t = useTranslations("Hero")
    const [activeSlide, setActiveSlide] = useState(0)
    const [touchStartX, setTouchStartX] = useState<number | null>(null)

    const goToNextSlide = () => {
        setActiveSlide((current) => (current + 1) % HERO_SLIDES.length)
    }

    const goToPreviousSlide = () => {
        setActiveSlide((current) => (current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
    }

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setActiveSlide((current) => (current + 1) % HERO_SLIDES.length)
        }, 5000)

        return () => window.clearInterval(intervalId)
    }, [])

    const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
        setTouchStartX(event.touches[0]?.clientX ?? null)
    }

    const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
        if (touchStartX === null) return
        const touchEndX = event.changedTouches[0]?.clientX
        if (typeof touchEndX !== "number") return

        const deltaX = touchEndX - touchStartX
        if (Math.abs(deltaX) < 50) return

        if (deltaX < 0) {
            goToNextSlide()
        } else {
            goToPreviousSlide()
        }
    }

    return (
        <>
            <section
                className="relative h-[85vh] w-full overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <div className="absolute inset-0">
                    {HERO_SLIDES.map((image, index) => (
                        <div
                            key={image}
                            className="absolute inset-0 h-full w-full bg-cover bg-center transition-opacity duration-1000"
                            style={{
                                backgroundImage: `linear-gradient(to right, rgba(200,200,200,0.3) 0%, rgba(200,200,200,0.1) 50%), url('${image}')`,
                                opacity: index === activeSlide ? 1 : 0,
                            }}
                        />
                    ))}
                </div>
                <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
                    {HERO_SLIDES.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setActiveSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                            className={`h-2 rounded-full transition-all ${index === activeSlide ? "w-12 bg-black" : "w-6 bg-black/35 hover:bg-black/55"}`}
                        />
                    ))}
                </div>
            </section>
            <section className="bg-background px-6 py-10 lg:px-24">
                <div className="max-w-3xl">
                    <span className="text-primary font-bold tracking-[0.3em] uppercase text-sm mb-4 block">
                        Seoul Luxury Skincare
                    </span>
                    <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-black leading-tight mb-8">
                        {t.rich("headline", {
                            br: () => <br />,
                            span: (chunks) => <span className="italic">{chunks}</span>,
                        })}
                    </h1>
                    <p className="text-black text-base md:text-lg max-w-xl mb-10 leading-relaxed font-light">
                        {t("subheadline")}
                    </p>
                    <div className="flex flex-wrap gap-5">
                        <Link href="/categories">
                            <Button size="lg" className="rounded-none h-14 px-8 text-lg bg-black text-white hover:bg-black/80 shadow-lg hover:shadow-xl transition-all">{t("shopNow")}</Button>
                        </Link>
                        <Link href="/register">
                            <Button variant="hero-outline" size="lg" className="rounded-none h-14 px-8 text-lg bg-white text-black border-2 border-black/15 hover:bg-white hover:scale-105 shadow-lg transition-all">
                                {t("becomeMember")}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </>
    )
}
