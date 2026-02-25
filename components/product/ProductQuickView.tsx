"use client"

import React, { useState } from "react"
import type { Product } from "@/lib/types"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useCart } from "@/context/CartContext"
import { useTranslations } from 'next-intl'
import { toast } from "sonner"
import { Minus, Plus, ShoppingBag } from "lucide-react"
import { Link } from "@/i18n/routing"
import { useLocale } from "next-intl"
import { useDisplayCurrency } from "@/context/DisplayCurrencyContext"
import { formatDisplayAmount } from "@/lib/display-currency"
import { resolveDisplayOriginalPrice, resolveDisplayPrice } from "@/lib/product-pricing"

interface ProductQuickViewProps {
    product: Product
    open: boolean
    onOpenChange: (open: boolean) => void
    children?: React.ReactNode
}

export function ProductQuickView({ product, open, onOpenChange, children }: ProductQuickViewProps) {
    const t = useTranslations('Product')
    const locale = useLocale()
    const { currency: displayCurrency } = useDisplayCurrency()
    const { addToCart } = useCart()
    const { setIsOpen } = useCart()
    const [selectedImage, setSelectedImage] = useState(product.image)
    const [isEconomicalSet, setIsEconomicalSet] = useState(false)
    const [selectedShadeId, setSelectedShadeId] = useState("")
    const [quantity, setQuantity] = useState(1)
    const [isHovering, setIsHovering] = useState(false)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const displayBasePrice = resolveDisplayPrice(product, displayCurrency)
    const originalPriceInfo = resolveDisplayOriginalPrice(product, displayCurrency)

    const productImages = product.images || [product.image]
    const selectedShade =
        product.colorShades?.find((shade) => shade.id === selectedShadeId) || null
    const selectedShadePriceInfo = selectedShade
        ? resolveDisplayPrice(
            {
                price: selectedShade.price,
                currency: product.currency,
                priceAed: selectedShade.priceAed ?? null,
                priceT: selectedShade.priceT ?? null,
            },
            displayCurrency
        )
        : null

    // Calculate current effective price based on selection
    const currentPrice = isEconomicalSet && product.economicalOption
        ? product.economicalOption.price
        : (selectedShadePriceInfo?.amount ?? displayBasePrice.amount)
    const currentPriceCurrency = isEconomicalSet && product.economicalOption
        ? (product.currency || "USD")
        : (selectedShadePriceInfo?.fromCurrency ?? displayBasePrice.fromCurrency)
    const currentTotalPrice = currentPrice * quantity
    const originalTotalPrice =
        !isEconomicalSet &&
        typeof product.originalPrice === "number" &&
        product.originalPrice > currentPrice
            ? product.originalPrice * quantity
            : null
    const discountPercent =
        typeof originalTotalPrice === "number" && originalTotalPrice > currentTotalPrice
            ? Math.round(((originalTotalPrice - currentTotalPrice) / originalTotalPrice) * 100)
            : null

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - left) / width) * 100
        const y = ((e.clientY - top) / height) * 100
        setMousePos({ x, y })
    }

    const handleAddToCart = () => {
        if (!isEconomicalSet && product.colorShades && product.colorShades.length > 0 && !selectedShade) {
            toast.error(`There are ${product.colorShades.length} shades available. Which shade would you like to order?`)
            return
        }

        // Prepare the item to add
        const itemToAdd = isEconomicalSet && product.economicalOption
            ? {
                id: `${product.id}-eco`, // Unique ID for the set variant
                productId: product.id,
                name: product.economicalOption.name,
                price: product.economicalOption.price,
                quantity,
                image: product.image,
                currency: product.currency || "USD",
            }
            : {
                id: selectedShade ? `${product.id}::shade::${selectedShade.id}` : product.id,
                productId: product.id,
                name: product.name,
                price: currentPrice,
                quantity,
                image: product.image,
                currency: currentPriceCurrency,
                shade: selectedShade?.name || undefined,
            }

        addToCart(itemToAdd)

        toast.success(t('addedToCart'), {
            description: `${itemToAdd.name} (x${quantity})`,
            action: {
                label: t('viewCart'),
                onClick: () => setIsOpen(true)
            }
        })
        setQuantity(1)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px] md:max-w-4xl p-0 overflow-hidden bg-white gap-0">
                <div className="grid grid-cols-1 md:grid-cols-2 h-[80vh] md:h-[600px]">

                    {/* Image Gallery Section */}
                    <div className="bg-secondary/10 p-6 flex flex-col gap-4 overflow-hidden">
                        <div
                            className="relative flex-1 bg-white rounded-lg overflow-hidden border border-gray-100 group cursor-zoom-in"
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        >
                            {typeof product.originalPrice === "number" &&
                                product.originalPrice > product.price && (
                                    <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide">
                                        {t("sale")}
                                    </div>
                                )}
                            <div
                                className="w-full h-full bg-contain bg-center bg-no-repeat transition-transform duration-200"
                                style={{
                                    backgroundImage: `url('${selectedImage}')`,
                                    transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                                    transform: isHovering ? 'scale(2.5)' : 'scale(1)'
                                }}
                            />
                        </div>

                        {/* Thumbnails */}
                        {productImages.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {productImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
                                        className={`w-16 h-16 flex-shrink-0 border-2 rounded-md overflow-hidden bg-white transition-all ${selectedImage === img ? 'border-primary ring-1 ring-primary/20' : 'border-transparent hover:border-gray-200'
                                            }`}
                                    >
                                        <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-contain" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details Section */}
                    <div className="p-6 md:p-8 flex flex-col overflow-y-auto">
                        <div className="mb-6">
                            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1 font-medium">{product.brand}</p>
                            <DialogTitle className="font-serif text-2xl md:text-3xl leading-tight mb-2">{product.name}</DialogTitle>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>

                        <div className="text-2xl font-bold text-primary mb-6 flex items-baseline gap-2">
                            <span>{formatDisplayAmount(currentTotalPrice, currentPriceCurrency, displayCurrency, locale)}</span>
                            {originalTotalPrice && (
                                <span className="text-sm text-muted-foreground line-through decoration-red-500/50">
                                    {formatDisplayAmount(
                                        originalTotalPrice,
                                        originalPriceInfo?.fromCurrency || product.currency || "USD",
                                        displayCurrency,
                                        locale
                                    )}
                                </span>
                            )}
                            {discountPercent !== null && (
                                <span className="text-xs font-bold text-red-600">-{discountPercent}%</span>
                            )}
                        </div>

                        {product.size && (
                            <div className="mb-6">
                                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-2">{t("size")}</span>
                                <div className="inline-block px-3 py-1 bg-secondary/30 rounded-md text-sm font-medium">
                                    {product.size}
                                </div>
                            </div>
                        )}

                        {product.colorShades && product.colorShades.length > 0 && (
                            <div className="mb-6 rounded-lg border border-border p-3">
                                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                    Color / Shade
                                </p>
                                <p className={`mb-2 text-xs ${selectedShade ? "text-muted-foreground" : "text-amber-700"}`}>
                                    There are {product.colorShades.length} shades available. Which shade would you like to order?
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {product.colorShades.map((shade) => {
                                        const shadePriceInfo = resolveDisplayPrice(
                                            {
                                                price: shade.price,
                                                currency: product.currency,
                                                priceAed: shade.priceAed ?? null,
                                                priceT: shade.priceT ?? null,
                                            },
                                            displayCurrency
                                        )
                                        return (
                                            <button
                                                key={shade.id}
                                                type="button"
                                                onClick={() => setSelectedShadeId(shade.id)}
                                                className={`rounded-md border px-2 py-1 text-left text-xs ${selectedShade?.id === shade.id
                                                        ? "border-primary bg-primary/10 text-primary"
                                                        : "border-border"
                                                    }`}
                                            >
                                                <p className="font-semibold">{shade.name}</p>
                                                <p>
                                                    {formatDisplayAmount(
                                                        shadePriceInfo.amount,
                                                        shadePriceInfo.fromCurrency,
                                                        displayCurrency,
                                                        locale
                                                    )}
                                                </p>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {product.economicalOption && (
                            <div className="mb-8 p-4 border border-primary/20 bg-primary/5 rounded-lg">
                                <div className="flex items-start space-x-3">
                                    <Checkbox
                                        id="eco-set"
                                        checked={isEconomicalSet}
                                        onCheckedChange={(checked) => setIsEconomicalSet(checked as boolean)}
                                        className="mt-1"
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <label
                                            htmlFor="eco-set"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-primary"
                                        >
                                            {product.economicalOption.name}
                                        </label>
                                        <p className="text-xs text-muted-foreground">
                                            {t("economicalSetHint")}
                                        </p>
                                        <p className="text-sm font-bold mt-1">
                                            {formatDisplayAmount(product.economicalOption.price, product.currency || "USD", displayCurrency, locale)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-auto pt-6 border-t">
                            <div className="space-y-2">
                                {product.colorShades && product.colorShades.length > 0 && !selectedShade && !isEconomicalSet && (
                                    <p className="text-xs font-medium text-amber-700">
                                        Please choose a shade before adding to cart.
                                    </p>
                                )}
                                <div className="flex items-center gap-2">
                                    <div className="flex h-12 items-center rounded-md border border-input bg-background px-2">
                                        <button
                                            type="button"
                                            className="h-8 w-8 inline-flex items-center justify-center rounded-sm hover:text-primary transition-colors"
                                            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                                            aria-label={t("decreaseQuantity")}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                                        <button
                                            type="button"
                                            className="h-8 w-8 inline-flex items-center justify-center rounded-sm hover:text-primary transition-colors"
                                            onClick={() => setQuantity((current) => current + 1)}
                                            aria-label={t("increaseQuantity")}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <Button
                                        size="lg"
                                        className="flex-1 text-lg h-12 gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                                        onClick={handleAddToCart}
                                        disabled={Boolean(
                                            !isEconomicalSet &&
                                            product.colorShades &&
                                            product.colorShades.length > 0 &&
                                            !selectedShade
                                        )}
                                    >
                                        <ShoppingBag className="w-5 h-5" />
                                        {t('addToCart')}
                                    </Button>
                                </div>
                                <Link
                                    href={`/products/${product.id}`}
                                    className="block text-center text-sm font-semibold uppercase tracking-widest text-primary hover:underline"
                                    onClick={() => onOpenChange(false)}
                                >
                                    {t("viewDetails")}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
