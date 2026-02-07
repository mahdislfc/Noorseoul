"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ZoomIn } from "lucide-react"

interface ProductGalleryProps {
    images: string[]
}

export function ProductGallery({ images }: ProductGalleryProps) {
    const [activeImage, setActiveImage] = useState(0)

    return (
        <div className="space-y-4">
            <div className="relative group aspect-[4/5] w-full overflow-hidden rounded-xl bg-secondary/10">
                <div
                    className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url('${images[activeImage]}')` }}
                />
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className="bg-primary px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                        New Arrival
                    </span>
                </div>
                <button className="absolute bottom-6 right-6 h-12 w-12 flex items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-xl text-foreground transition-transform hover:scale-110">
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
                        onClick={() => setActiveImage(idx)}
                    >
                        <div
                            className="h-full w-full bg-cover bg-center"
                            style={{ backgroundImage: `url('${img}')` }}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
