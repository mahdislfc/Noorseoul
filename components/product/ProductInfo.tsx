"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/CartContext"
import { Star, Minus, Plus, CheckCircle, ChevronDown, ShieldCheck, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductInfoProps {
    product: {
        id: string
        name: string
        price: number
        oldPrice?: number
        currency?: string
        description: string
        reviews: number
        rating: number
        tags: string[]
        images: string[]
    }
}

export function ProductInfo({ product }: ProductInfoProps) {
    const { addToCart } = useCart()
    const [quantity, setQuantity] = useState(1)
    const [activeTab, setActiveTab] = useState<string | null>("benefits")

    const handleAddToCart = () => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: product.images[0]
        })
    }

    const toggleTab = (tab: string) => {
        setActiveTab(activeTab === tab ? null : tab)
    }

    return (
        <div className="flex flex-col">
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1 text-primary">
                    {[1, 2, 3, 4, 5].map((_, i) => (
                        <Star key={i} className={cn("w-4 h-4 fill-current", i < Math.floor(product.rating) ? "text-primary" : "text-gray-300")} />
                    ))}
                    <span className="ml-2 text-xs font-bold text-foreground/60 tracking-tight">{product.rating} ({product.reviews} Reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    In Stock
                </div>
            </div>

            <h1 className="text-4xl lg:text-5xl font-serif font-extrabold leading-tight mb-4 tracking-tight">{product.name}</h1>

            <div className="flex items-baseline gap-4 mb-8">
                <span className="text-3xl font-light text-primary">{product.price} {product.currency || "AED"}</span>
                {product.oldPrice && (
                    <span className="text-lg opacity-40 line-through">
                        {product.oldPrice} {product.currency || "AED"}
                    </span>
                )}
            </div>

            <p className="text-foreground/70 leading-relaxed mb-8 text-lg">
                {product.description}
            </p>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-6 mb-10 py-6 border-y border-border/40">
                <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-50">Best For</span>
                    <p className="font-semibold text-sm">All Skin Types</p>
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-50">Scent</span>
                    <p className="font-semibold text-sm">Damask Rose & Oud</p>
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 mb-12">
                <div className="flex gap-4">
                    <div className="flex items-center border border-border rounded-lg px-2">
                        <button
                            className="p-2 hover:text-primary transition-colors"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-bold">{quantity}</span>
                        <button
                            className="p-2 hover:text-primary transition-colors"
                            onClick={() => setQuantity(quantity + 1)}
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    <Button
                        className="flex-1 py-6 shadow-lg shadow-primary/20"
                        onClick={handleAddToCart}
                    >
                        Add to Cart
                    </Button>
                </div>
                <Button variant="secondary" className="w-full py-6">Buy Now</Button>
            </div>

            {/* Accordions */}
            <div className="space-y-6">
                <div className="border-b border-border/40 pb-6">
                    <button
                        className="flex w-full items-center justify-between cursor-pointer"
                        onClick={() => toggleTab('benefits')}
                    >
                        <h3 className="font-bold text-lg uppercase tracking-wider">Benefits</h3>
                        <ChevronDown className={cn("transition-transform", activeTab === 'benefits' ? "rotate-180" : "")} />
                    </button>
                    {activeTab === 'benefits' && (
                        <ul className="mt-4 space-y-3 text-sm opacity-80 leading-relaxed animate-in fade-in slide-in-from-top-2">
                            <li className="flex items-start gap-3">
                                <CheckCircle className="text-primary w-5 h-5" />
                                <span>Deep cellular hydration with triple-weight Hyaluronic Acid.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="text-primary w-5 h-5" />
                                <span>24K Gold particles stimulate collagen production and instant glow.</span>
                            </li>
                        </ul>
                    )}
                </div>
                <div className="border-b border-border/40 pb-6">
                    <button
                        className="flex w-full items-center justify-between cursor-pointer"
                        onClick={() => toggleTab('ingredients')}
                    >
                        <h3 className="font-bold text-lg uppercase tracking-wider">Key Ingredients</h3>
                        <ChevronDown className={cn("transition-transform", activeTab === 'ingredients' ? "rotate-180" : "")} />
                    </button>
                    {activeTab === 'ingredients' && (
                        <div className="mt-4 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                            <div className="p-3 bg-secondary/20 rounded-lg">
                                <p className="font-bold text-sm text-primary">24K Gold Flakes</p>
                            </div>
                            <div className="p-3 bg-secondary/20 rounded-lg">
                                <p className="font-bold text-sm text-primary">Hyaluronic Acid</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap items-center justify-between gap-6 opacity-60">
                <div className="flex flex-col items-center gap-2">
                    <Heart className="w-8 h-8 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-center">Cruelty-Free</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <ShieldCheck className="w-8 h-8 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-center">Dermatologist Tested</span>
                </div>
            </div>
        </div>
    )
}
