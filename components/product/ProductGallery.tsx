"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ZoomIn } from "lucide-react"

interface ProductGalleryProps {
    images: string[]
}

export function ProductGallery({ images }: ProductGalleryProps) {
    const [activeImage, setActiveImage] = useState(0)
    const [isZoomActive, setIsZoomActive] = useState(false)
    const [pointerPos, setPointerPos] = useState({ x: 50, y: 50 })

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

    const handleChangeImage = (index: number) => {
        setActiveImage(index)
        setIsZoomActive(false)
        setPointerPos({ x: 50, y: 50 })
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
                    className="h-full w-full object-contain transition-transform duration-200"
                    style={{
                        transformOrigin: `${pointerPos.x}% ${pointerPos.y}%`,
                        transform: isZoomActive ? "scale(2.2)" : "scale(1)",
                    }}
                />
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className="bg-primary px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                        New Arrival
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => undefined}
                    className="absolute bottom-6 right-6 h-12 w-12 flex items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-xl text-foreground transition-transform hover:scale-110"
                    aria-label="Move cursor over image to zoom"
                >
                    <ZoomIn className="w-5 h-5" />
                </button>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-4">
                {images.map((img, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "aspect-square rounded-lg border-2 overflow-hidden cursor-pointer transition-colors",
                            activeImage === idx ? "border-primary" : "border-transparent hover:border-primary/50"
                        )}
                        onClick={() => handleChangeImage(idx)}
                    >
                        <div
                            className="h-full w-full bg-contain bg-center bg-no-repeat"
                            style={{ backgroundImage: `url('${img}')` }}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
