"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

interface ProductGalleryProps {
    images: string[]
}

export function ProductGallery({ images }: ProductGalleryProps) {
    const t = useTranslations("Home.badges")
    const [activeImage, setActiveImage] = useState(0)
    const [showMoreThumbnails, setShowMoreThumbnails] = useState(false)
    const [isZoomActive, setIsZoomActive] = useState(false)
    const [pointerPos, setPointerPos] = useState({ x: 50, y: 50 })

    const handleChangeImage = (index: number) => {
        setActiveImage(index)
        setIsZoomActive(false)
        setPointerPos({ x: 50, y: 50 })
    }

    const handlePointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = event.currentTarget.getBoundingClientRect()
        const x = ((event.clientX - left) / width) * 100
        const y = ((event.clientY - top) / height) * 100
        setPointerPos({
            x: Math.min(100, Math.max(0, x)),
            y: Math.min(100, Math.max(0, y)),
        })
        setIsZoomActive(true)
    }

    const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
        const touch = event.touches[0]
        if (!touch) return
        const { left, top, width, height } = event.currentTarget.getBoundingClientRect()
        const x = ((touch.clientX - left) / width) * 100
        const y = ((touch.clientY - top) / height) * 100
        setPointerPos({
            x: Math.min(100, Math.max(0, x)),
            y: Math.min(100, Math.max(0, y)),
        })
        setIsZoomActive(true)
    }

    return (
        <div className="space-y-4">
            <div
                className={cn(
                    "relative group aspect-[4/5] w-full overflow-hidden rounded-xl bg-secondary/10",
                    isZoomActive ? "cursor-zoom-out" : "cursor-zoom-in"
                )}
                onMouseMove={handlePointerMove}
                onMouseLeave={() => setIsZoomActive(false)}
                onTouchStart={() => setIsZoomActive(false)}
                onTouchMove={handleTouchMove}
                onTouchEnd={() => setIsZoomActive(false)}
            >
                <img
                    src={images[activeImage]}
                    alt={`Product image ${activeImage + 1}`}
                    className="h-full w-full object-contain transition-transform duration-150"
                    style={{
                        transformOrigin: `${pointerPos.x}% ${pointerPos.y}%`,
                        transform: isZoomActive ? "scale(2.2)" : "scale(1)",
                    }}
                />
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className="bg-primary px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                        {t("newArrival")}
                    </span>
                </div>
            </div>

            {/* Thumbnails */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
                {(showMoreThumbnails ? images : images.slice(0, 2)).map((img, idx) => (
                    <button
                        type="button"
                        key={idx}
                        className={cn(
                            "h-12 w-12 sm:h-14 sm:w-14 rounded-lg border-2 overflow-hidden cursor-pointer transition-colors",
                            activeImage === idx ? "border-primary" : "border-transparent hover:border-primary/50"
                        )}
                        onClick={() => handleChangeImage(idx)}
                    >
                        <div
                            className="h-full w-full bg-contain bg-center bg-no-repeat"
                            style={{ backgroundImage: `url('${img}')` }}
                        />
                    </button>
                ))}
                {images.length > 2 && (
                    <button
                        type="button"
                        onClick={() => setShowMoreThumbnails((prev) => !prev)}
                        className="h-12 px-3 sm:h-14 rounded-lg border border-border text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                    >
                        {showMoreThumbnails ? "See less" : "See more"}
                    </button>
                )}
            </div>
        </div>
    )
}
