"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/CartContext"
import { Minus, Plus } from "lucide-react"
import { useRouter } from "@/i18n/routing"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
import { useDisplayCurrency } from "@/context/DisplayCurrencyContext"
import { formatDisplayAmount } from "@/lib/display-currency"
import { resolveDisplayOriginalPrice, resolveDisplayPrice } from "@/lib/product-pricing"

interface ProductInfoProps {
    product: {
        id: string
        name: string
        price: number
        oldPrice?: number
        currency?: string
        priceAed?: number | null
        priceT?: number | null
        oldPriceAed?: number | null
        oldPriceT?: number | null
        description?: string
        ingredients?: string
        skinType?: string
        scent?: string
        waterResistance?: string
        bundleLabel?: string
        bundleProductId?: string
        economicalOption?: {
            name: string
            price: number
            quantity?: number
        }
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
    const t = useTranslations("Product")
    const locale = useLocale()
    const { currency: displayCurrency } = useDisplayCurrency()
    const { addToCart, setIsOpen } = useCart()
    const router = useRouter()
    const [quantity, setQuantity] = useState(1)
    const [bundleQuantity, setBundleQuantity] = useState(1)
    const [showAllDescription, setShowAllDescription] = useState(false)
    const [showAllIngredients, setShowAllIngredients] = useState(false)
    const displayBasePrice = resolveDisplayPrice(
        {
            price: product.price,
            currency: product.currency,
            priceAed: product.priceAed ?? null,
            priceT: product.priceT ?? null,
        },
        displayCurrency
    )
    const originalPriceInfo = resolveDisplayOriginalPrice(
        {
            originalPrice: product.oldPrice ?? null,
            originalPriceAed: product.oldPriceAed ?? null,
            originalPriceT: product.oldPriceT ?? null,
            currency: product.currency
        },
        displayCurrency
    )
    const totalPrice = displayBasePrice.amount * quantity
    const totalOldPrice = originalPriceInfo ? originalPriceInfo.amount * quantity : null
    const descriptionText = (product.description || "").trim()
    const hasMoreDescription = descriptionText.split(/\r?\n/).length > 9 || descriptionText.length > 420
    const ingredientLines = (product.ingredients || "")
        .split(/[\r\n,]+/)
        .map((line) => line.trim())
        .filter(Boolean)
    const visibleIngredientLines = showAllIngredients
        ? ingredientLines
        : ingredientLines.slice(0, 2)
    const hasMoreIngredients = ingredientLines.length > 2
    const economicalOptionQuantity =
        typeof product.economicalOption?.quantity === "number" &&
            product.economicalOption.quantity > 1
            ? product.economicalOption.quantity
            : 1

    const handleAddToCart = () => {
        const addedItem = {
            id: product.id,
            name: product.name,
            price: displayBasePrice.amount,
            quantity: quantity,
            image: product.images[0]
        }
        addToCart({
            ...addedItem
            ,
            currency: displayBasePrice.fromCurrency
        })
        toast.success(t("addedToCart"), {
            description: `${product.name} (x${quantity})`,
            action: {
                label: t("viewCart"),
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
        toast.success(t("bundleItemAdded"), {
            description: `${product.bundleProduct.name} (x${bundleQuantity})`,
            action: {
                label: t("viewCart"),
                onClick: () => setIsOpen(true),
            },
        })
    }

    const handleAddEconomicalOptionToCart = () => {
        if (!product.economicalOption) return
        addToCart({
            id: `${product.id}-eco`,
            name: product.economicalOption.name,
            price: product.economicalOption.price,
            quantity: 1,
            image: product.images[0],
            currency: product.currency || "USD"
        })
        toast.success(t("dealAddedToCart"), {
            description: `${product.economicalOption.name} (x1)`,
            action: {
                label: t("viewCart"),
                onClick: () => setIsOpen(true),
            },
        })
    }

    return (
        <div className="flex flex-col">
            <h1 className="text-4xl lg:text-5xl font-serif font-extrabold leading-tight mb-4 tracking-tight">{product.name}</h1>

            <div className="flex flex-wrap items-end gap-4 mb-8">
                <div className="flex items-baseline gap-4">
                    <span className="text-3xl font-light text-primary">
                        {formatDisplayAmount(totalPrice, displayBasePrice.fromCurrency, displayCurrency, locale)}
                    </span>
                    {totalOldPrice && (
                        <span className="text-lg opacity-40 line-through">
                            {formatDisplayAmount(
                                totalOldPrice,
                                originalPriceInfo?.fromCurrency || product.currency || "USD",
                                displayCurrency,
                                locale
                            )}
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
                        {t("addToCart")}
                    </Button>
                </div>
            </div>

            {product.description?.trim() && (
                <div className="mb-8">
                    <p
                        className="text-foreground/70 leading-relaxed text-lg whitespace-pre-line"
                        style={showAllDescription ? undefined : {
                            display: "-webkit-box",
                            WebkitLineClamp: 9,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}
                    >
                        {descriptionText}
                    </p>
                    {hasMoreDescription && (
                        <button
                            type="button"
                            onClick={() => setShowAllDescription((current) => !current)}
                            className="mt-3 inline-flex items-center rounded-md border border-border bg-muted/40 px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
                        >
                            {showAllDescription ? t("readLess") : t("readMore")}
                        </button>
                    )}
                </div>
            )}

            {(product.skinType?.trim() || product.scent?.trim() || product.waterResistance?.trim() || product.ingredients?.trim()) && (
                <div className="grid grid-cols-1 gap-4 mb-8">
                    {product.skinType?.trim() && (
                        <div className="rounded-lg border border-border p-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("skinType")}</p>
                            <p className="mt-2 text-sm font-medium">{product.skinType}</p>
                        </div>
                    )}
                    {product.scent?.trim() && (
                        <div className="rounded-lg border border-border p-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("scent")}</p>
                            <p className="mt-2 text-sm font-medium">{product.scent}</p>
                        </div>
                    )}
                    {product.waterResistance?.trim() && (
                        <div className="rounded-lg border border-border p-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("waterResistance")}</p>
                            <p className="mt-2 text-sm font-medium">{product.waterResistance}</p>
                        </div>
                    )}
                    {product.ingredients?.trim() && (
                        <div className="rounded-lg border border-border p-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("ingredients")}</p>
                            <div className="mt-2 space-y-1 text-sm leading-relaxed text-foreground/80">
                                {visibleIngredientLines.map((line, index) => (
                                    <p key={`${line}-${index}`}>{line}</p>
                                ))}
                            </div>
                            {hasMoreIngredients && (
                                <button
                                    type="button"
                                    onClick={() => setShowAllIngredients((current) => !current)}
                                    className="mt-3 inline-flex items-center rounded-md border border-border bg-muted/40 px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
                                >
                                    {showAllIngredients ? t("readLess") : t("readMore")}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {(product.bundleProduct || product.economicalOption) && (
                <div className="mb-8 rounded-lg border border-primary/25 bg-primary/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary/80">{t("buyCheaper")}</p>
                    {product.bundleLabel?.trim() && (
                        <p className="mt-2 text-sm text-foreground/80">{product.bundleLabel}</p>
                    )}
                    <div className="mt-3 grid grid-cols-1 gap-3">
                        {product.economicalOption && (
                            <div className="rounded-md border border-border bg-background p-3">
                                <p className="text-sm font-semibold">{product.economicalOption.name}</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <p className="text-sm font-semibold text-primary">
                                        {formatDisplayAmount(product.economicalOption.price, product.currency || "USD", displayCurrency, locale)}
                                    </p>
                                    {economicalOptionQuantity > 1 && (
                                        <p className="text-xs text-muted-foreground">
                                            {t("quantityShort")}: {economicalOptionQuantity}
                                        </p>
                                    )}
                                    {economicalOptionQuantity > 1 && (
                                        <p className="text-xs text-muted-foreground line-through">
                                            {formatDisplayAmount(product.price * economicalOptionQuantity, product.currency || "USD", displayCurrency, locale)}
                                        </p>
                                    )}
                                </div>
                                <div className="mt-3">
                                    <Button type="button" size="sm" onClick={handleAddEconomicalOptionToCart}>
                                        {t("addToCart")}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {product.bundleProduct && (
                            <div className="rounded-md border border-border bg-background p-3">
                                <div className="flex items-start gap-3">
                                    <img
                                        src={product.bundleProduct.image}
                                        alt={product.bundleProduct.name}
                                        className="h-16 w-16 rounded-md border object-cover"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold leading-snug">{product.bundleProduct.name}</p>
                                        {product.bundleProduct.size?.trim() && (
                                            <p className="mt-1 text-xs text-muted-foreground">{t("size")}: {product.bundleProduct.size}</p>
                                        )}
                                        <p className="mt-1 text-sm font-semibold text-primary">
                                            {formatDisplayAmount(product.bundleProduct.price, product.bundleProduct.currency || "USD", displayCurrency, locale)}
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
                                        {t("addToCart")}
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/products/${product.bundleProduct?.id}`)}
                                        className="text-sm font-semibold text-primary hover:underline"
                                    >
                                        {t("viewDetails")}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    )
}
