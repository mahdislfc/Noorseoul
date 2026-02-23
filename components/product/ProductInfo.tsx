"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/CartContext"
import { Minus, Plus } from "lucide-react"
import { useRouter } from "@/i18n/routing"
import { toast } from "sonner"

interface ProductInfoProps {
    product: {
        id: string
        name: string
        price: number
        oldPrice?: number
        currency?: string
        description?: string
        ingredients?: string
        skinType?: string
        scent?: string
        waterResistance?: string
        bundleLabel?: string
        bundleProductId?: string
        bundleProduct?: {
            id: string
            name: string
            price: number
            currency?: string
            size?: string
            image: string
        }
        images: string[]
    }
}

export function ProductInfo({ product }: ProductInfoProps) {
    const { addToCart, setIsOpen } = useCart()
    const router = useRouter()
    const [quantity, setQuantity] = useState(1)
    const [bundleQuantity, setBundleQuantity] = useState(1)
    const [showAllIngredients, setShowAllIngredients] = useState(false)
    const formatAmount = (amount: number) => (
        Number.isInteger(amount) ? amount.toString() : amount.toFixed(2)
    )
    const totalPrice = product.price * quantity
    const totalOldPrice = product.oldPrice ? product.oldPrice * quantity : null
    const ingredientLines = (product.ingredients || "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
    const visibleIngredientLines = showAllIngredients
        ? ingredientLines
        : ingredientLines.slice(0, 5)
    const hasMoreIngredients = ingredientLines.length > 5

    const handleAddToCart = () => {
        const addedItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: product.images[0]
        }
        addToCart({
            ...addedItem
            ,
            currency: product.currency || "USD"
        })
        toast.success("Item added to cart", {
            description: `${product.name} (x${quantity})`,
            action: {
                label: "View Cart",
                onClick: () => setIsOpen(true),
            },
        })
    }

    const handleAddBundleToCart = () => {
        if (!product.bundleProduct) return
        addToCart({
            id: product.bundleProduct.id,
            name: product.bundleProduct.name,
            price: product.bundleProduct.price,
            quantity: bundleQuantity,
            image: product.bundleProduct.image,
            currency: product.bundleProduct.currency || "USD"
        })
        toast.success("Bundle item added to cart", {
            description: `${product.bundleProduct.name} (x${bundleQuantity})`,
            action: {
                label: "View Cart",
                onClick: () => setIsOpen(true),
            },
        })
    }

    return (
        <div className="flex flex-col">
            <h1 className="text-4xl lg:text-5xl font-serif font-extrabold leading-tight mb-4 tracking-tight">{product.name}</h1>

            <div className="flex flex-wrap items-end gap-4 mb-8">
                <div className="flex items-baseline gap-4">
                    <span className="text-3xl font-light text-primary">{formatAmount(totalPrice)} {product.currency || "AED"}</span>
                    {totalOldPrice && (
                        <span className="text-lg opacity-40 line-through">
                            {formatAmount(totalOldPrice)} {product.currency || "AED"}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
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
                        className="px-6 py-3 shadow-lg shadow-primary/20"
                        onClick={handleAddToCart}
                    >
                        Add to Cart
                    </Button>
                </div>
            </div>

            {product.description?.trim() && (
                <p className="text-foreground/70 leading-relaxed mb-8 text-lg">
                    {product.description}
                </p>
            )}

            {(product.skinType?.trim() || product.scent?.trim() || product.waterResistance?.trim() || product.ingredients?.trim()) && (
                <div className="grid grid-cols-1 gap-4 mb-8">
                    {product.skinType?.trim() && (
                        <div className="rounded-lg border border-border p-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Skin Type</p>
                            <p className="mt-2 text-sm font-medium">{product.skinType}</p>
                        </div>
                    )}
                    {product.scent?.trim() && (
                        <div className="rounded-lg border border-border p-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Scent</p>
                            <p className="mt-2 text-sm font-medium">{product.scent}</p>
                        </div>
                    )}
                    {product.waterResistance?.trim() && (
                        <div className="rounded-lg border border-border p-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Water Resistance</p>
                            <p className="mt-2 text-sm font-medium">{product.waterResistance}</p>
                        </div>
                    )}
                    {product.ingredients?.trim() && (
                        <div className="rounded-lg border border-border p-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ingredients</p>
                            <div className="mt-2 space-y-1 text-sm leading-relaxed text-foreground/80">
                                {visibleIngredientLines.map((line, index) => (
                                    <p key={`${line}-${index}`}>{line}</p>
                                ))}
                            </div>
                            {hasMoreIngredients && (
                                <button
                                    type="button"
                                    onClick={() => setShowAllIngredients((current) => !current)}
                                    className="mt-3 text-sm font-semibold text-primary hover:underline"
                                >
                                    {showAllIngredients ? "Read less" : "Read more"}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {product.bundleProduct && (
                <div className="mb-8 rounded-lg border border-primary/25 bg-primary/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary/80">Economical Bundle</p>
                    {product.bundleLabel?.trim() && (
                        <p className="mt-2 text-sm text-foreground/80">{product.bundleLabel}</p>
                    )}
                    <div className="mt-3 rounded-md border border-border bg-background p-3">
                        <div className="flex items-start gap-3">
                            <img
                                src={product.bundleProduct.image}
                                alt={product.bundleProduct.name}
                                className="h-16 w-16 rounded-md border object-cover"
                            />
                            <div className="flex-1">
                                <p className="text-sm font-semibold leading-snug">{product.bundleProduct.name}</p>
                                {product.bundleProduct.size?.trim() && (
                                    <p className="mt-1 text-xs text-muted-foreground">Size: {product.bundleProduct.size}</p>
                                )}
                                <p className="mt-1 text-sm font-semibold text-primary">
                                    {formatAmount(product.bundleProduct.price)} {product.bundleProduct.currency || "AED"}
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <div className="flex items-center border border-border rounded-md px-2">
                                <button
                                    type="button"
                                    className="p-1 hover:text-primary transition-colors"
                                    onClick={() => setBundleQuantity((current) => Math.max(1, current - 1))}
                                >
                                    <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center text-sm font-semibold">{bundleQuantity}</span>
                                <button
                                    type="button"
                                    className="p-1 hover:text-primary transition-colors"
                                    onClick={() => setBundleQuantity((current) => current + 1)}
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                            <Button type="button" size="sm" onClick={handleAddBundleToCart}>
                                Add to Cart
                            </Button>
                            <button
                                type="button"
                                onClick={() => router.push(`/products/${product.bundleProduct?.id}`)}
                                className="text-sm font-semibold text-primary hover:underline"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
