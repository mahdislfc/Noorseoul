"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { useTranslations } from 'next-intl';
import { useCart } from "@/context/CartContext"
import { Minus, Plus } from "lucide-react"
import { toast } from "sonner"
import type { Product } from "@/lib/types"
import { ProductQuickView } from "./ProductQuickView"
import { Link } from "@/i18n/routing"
import { useLocale } from "next-intl"
import { useDisplayCurrency } from "@/context/DisplayCurrencyContext"
import { formatDisplayAmount } from "@/lib/display-currency"
import { resolveDisplayOriginalPrice, resolveDisplayPrice } from "@/lib/product-pricing"

export function ProductCard({ product }: { product: Product }) {
    const t = useTranslations('Product');
    const locale = useLocale()
    const { currency: displayCurrency } = useDisplayCurrency()
    const { addToCart, setIsOpen } = useCart()
    const [quantity, setQuantity] = useState(1)
    const [showQuickView, setShowQuickView] = useState(false)
    const [hasSeenQuickView, setHasSeenQuickView] = useState(false)
    const displayBasePrice = resolveDisplayPrice(product, displayCurrency)
    const originalPriceInfo = resolveDisplayOriginalPrice(product, displayCurrency)
    const totalPrice = displayBasePrice.amount * quantity
    const totalOriginalPrice = originalPriceInfo ? originalPriceInfo.amount * quantity : null

    const handleAddToCart = () => {
        if (product.colorShades && product.colorShades.length > 0) {
            setShowQuickView(true)
            setHasSeenQuickView(true)
            return
        }
        addToCart({
            id: product.id,
            productId: product.id,
            name: product.name,
            price: displayBasePrice.amount,
            quantity: quantity,
            image: product.image,
            currency: displayBasePrice.fromCurrency,
        })
        toast.success(t('addedToCart'), {
            description: `${product.name} (x${quantity})`,
            action: {
                label: t('viewCart'),
                onClick: () => setIsOpen(true)
            }
        })
        setQuantity(1)
    }

    const incrementQuantity = () => setQuantity(q => q + 1)
    const decrementQuantity = () => setQuantity(q => (q > 1 ? q - 1 : 1))

    const imageUrl =
        product.image.startsWith("http") || product.image.startsWith("/")
            ? product.image
            : "https://placehold.co/400x500/e3d5c5/1a1a1a?text=" +
              product.name.split(" ").join("+")

    const handleFirstInteractionOpenQuickView = (
        event: React.MouseEvent<HTMLAnchorElement>
    ) => {
        if (hasSeenQuickView) return
        event.preventDefault()
        setShowQuickView(true)
        setHasSeenQuickView(true)
    }

    return (
        <div className="group relative bg-white p-4 rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 h-full flex flex-col">
            <div className="relative overflow-hidden rounded-lg aspect-[4/5] bg-secondary/20 mb-4">
                {/* Fallback image logic if image missing */}
                <Link
                    href={`/products/${product.id}`}
                    aria-label={`View details for ${product.name}`}
                    onClick={handleFirstInteractionOpenQuickView}
                >
                    <div
                        className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-700 cursor-pointer"
                        style={{ backgroundImage: `url('${imageUrl}')` }}
                    />
                </Link>
                <Button
                    variant="default"
                    size="sm"
                    className="absolute bottom-4 left-4 right-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity w-auto shadow-md"
                    onClick={handleAddToCart}
                >
                    {t('addToCart')}
                </Button>
                {product.originalPrice && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm">
                        {t("sale")}
                    </div>
                )}
            </div>
            <div className="text-center px-2 flex-col flex gap-2 flex-grow">
                <div>
                    <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">{product.category}</p>
                    <Link
                        href={`/products/${product.id}`}
                        className="hover:text-primary transition-colors"
                        onClick={handleFirstInteractionOpenQuickView}
                    >
                        <h3 className="font-serif text-lg leading-tight line-clamp-2 min-h-[1.5em]">{product.name}</h3>
                    </Link>
                </div>
                <div className="flex items-center justify-center gap-2">
                    {totalOriginalPrice && (
                        <span className="text-gray-400 line-through text-sm">
                            {formatDisplayAmount(
                                totalOriginalPrice,
                                originalPriceInfo?.fromCurrency || product.currency || "USD",
                                displayCurrency,
                                locale
                            )}
                        </span>
                    )}
                    <p className="text-primary font-bold text-lg">
                        {formatDisplayAmount(totalPrice, displayBasePrice.fromCurrency, displayCurrency, locale)}
                    </p>
                </div>
                {product.colorShades && product.colorShades.length > 0 && (
                    <p className="text-xs text-primary font-semibold">
                        {product.colorShades.length} shades available
                    </p>
                )}
                <Link
                    href={`/products/${product.id}`}
                    className="text-xs font-semibold uppercase tracking-widest text-primary hover:underline"
                >
                    {t("viewDetails")}
                </Link>

                {/* Quantity Selector */}
                <div className="flex items-center justify-center gap-3 mt-auto pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        onClick={decrementQuantity}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                        disabled={quantity <= 1}
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-medium font-serif text-lg">{quantity}</span>
                    <button
                        onClick={incrementQuantity}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:border-primary hover:text-primary transition-colors"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            </div>
            <ProductQuickView
                product={product}
                open={showQuickView}
                onOpenChange={setShowQuickView}
            />
        </div>
    )
}
