"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useCart } from "@/context/CartContext"
import { ChevronLeft, ChevronRight, CircleHelp, Minus, Plus } from "lucide-react"
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
        brand: string
        price: number
        oldPrice?: number
        currency?: string
        priceAed?: number | null
        priceT?: number | null
        oldPriceAed?: number | null
        oldPriceT?: number | null
        saleEndsAt?: string | null
        saleLabel?: string | null
        promoBadgeText?: string | null
        promoTooltipText?: string | null
        miniCalendar?: {
            type: "mini_price_calendar"
            timezone: string
            start_date: string
            days: Array<{
                date: string
                price: number
                state: "sale" | "regular" | "sale_start" | "sale_end"
                label: "Sale" | "Ends" | ""
            }>
            calendar_end_unknown: boolean
            calendar_header: string
            calendar_subheader: string
            days_left: number | null
        } | null
        sourceSaleStart?: string | null
        sourceSaleEnd?: string | null
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
        colorShades?: Array<{
            id: string
            name: string
            price: number
            priceAed?: number | null
            priceT?: number | null
        }>
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
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)
    const [calendarMonthIndex, setCalendarMonthIndex] = useState(0)
    const [selectedShadeId, setSelectedShadeId] = useState(
        product.colorShades && product.colorShades.length > 0 ? product.colorShades[0].id : ""
    )
    const displayBasePrice = resolveDisplayPrice(
        {
            price: product.price,
            currency: product.currency || "USD",
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
            currency: product.currency || "USD"
        },
        displayCurrency
    )
    const selectedShade =
        product.colorShades?.find((shade) => shade.id === selectedShadeId) ||
        product.colorShades?.[0] ||
        null
    const selectedShadePriceInfo = selectedShade
        ? resolveDisplayPrice(
            {
                price: selectedShade.price,
                currency: product.currency || "USD",
                priceAed: selectedShade.priceAed ?? null,
                priceT: selectedShade.priceT ?? null,
            },
            displayCurrency
        )
        : null
    const activeUnitPriceInfo = selectedShadePriceInfo || displayBasePrice
    const totalPrice = activeUnitPriceInfo.amount * quantity
    const totalOldPrice = selectedShade ? null : (originalPriceInfo ? originalPriceInfo.amount * quantity : null)
    const totalDiscountPercent =
        typeof totalOldPrice === "number" && totalOldPrice > totalPrice
            ? Math.round(((totalOldPrice - totalPrice) / totalOldPrice) * 100)
            : null
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
    const saleStartDate = product.sourceSaleStart?.trim() || null
    const saleEndDate = product.sourceSaleEnd?.trim() || null
    const saleBadgeText =
        product.saleLabel?.trim() ||
        (product.saleEndsAt
            ? `Sale ends: ${new Date(product.saleEndsAt).toLocaleDateString(locale)}`
            : (product.promoBadgeText?.trim() || ""))
    const hasMiniCalendar = Boolean(product.miniCalendar)
    const now = new Date()
    const todayYear = now.getFullYear()
    const todayMonth = now.getMonth() + 1
    const todayDay = now.getDate()
    const monthWindow = Array.from({ length: 2 }, (_, index) => {
        const date = new Date(todayYear, now.getMonth() + index, 1)
        return { year: date.getFullYear(), month: date.getMonth() + 1 }
    })
    const viewedMonth = monthWindow[calendarMonthIndex] || monthWindow[0]
    const viewedYear = viewedMonth.year
    const viewedMonthNumber = viewedMonth.month
    const daysInMonth = new Date(viewedYear, viewedMonthNumber, 0).getDate()
    const firstWeekday = new Date(viewedYear, viewedMonthNumber - 1, 1).getDay()
    const monthName = new Date(viewedYear, viewedMonthNumber - 1, 1).toLocaleDateString(locale, {
        month: "long",
    })
    const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const unitCurrentPrice = activeUnitPriceInfo.amount
    const unitRegularPrice = originalPriceInfo?.amount ?? null
    const saleDiscountPercent =
        unitRegularPrice && unitRegularPrice > unitCurrentPrice
            ? Math.round(((unitRegularPrice - unitCurrentPrice) / unitRegularPrice) * 100)
            : null
    const saleStartText = saleStartDate
        ? new Date(`${saleStartDate}T00:00:00`).toLocaleDateString(locale, {
            weekday: "short",
            month: "short",
            day: "numeric",
        })
        : "N/A"
    const saleEndDayOnlyText = saleEndDate
        ? new Date(`${saleEndDate}T00:00:00`).toLocaleDateString(locale, {
            weekday: "short",
            month: "short",
            day: "numeric",
        })
        : "N/A"
    const saleDaySet = new Set<string>()
    let saleEndDayKey: string | null = saleEndDate || null
    const formatDateKey = (year: number, month: number, day: number) =>
        `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    if (saleStartDate && saleEndDate) {
        const start = new Date(`${saleStartDate}T00:00:00Z`)
        const end = new Date(`${saleEndDate}T00:00:00Z`)
        for (let cursor = new Date(start); cursor.getTime() <= end.getTime(); cursor.setUTCDate(cursor.getUTCDate() + 1)) {
            const y = cursor.getUTCFullYear()
            const m = cursor.getUTCMonth() + 1
            const d = cursor.getUTCDate()
            saleDaySet.add(formatDateKey(y, m, d))
        }
    } else if (Array.isArray(product.miniCalendar?.days)) {
        product.miniCalendar.days.forEach((entry) => {
            if (entry.state === "regular") return
            const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(entry.date || "")
            if (!match) return
            const y = Number(match[1])
            const m = Number(match[2])
            const d = Number(match[3])
            const key = formatDateKey(y, m, d)
            saleDaySet.add(key)
            if (entry.state === "sale_end") {
                saleEndDayKey = key
            }
        })
    }
    const viewedMonthHasSale = Array.from({ length: daysInMonth }, (_, index) =>
        saleDaySet.has(formatDateKey(viewedYear, viewedMonthNumber, index + 1))
    ).some(Boolean)

    const handleAddToCart = () => {
        const cartItemId = selectedShade
            ? `${product.id}::shade::${selectedShade.id}`
            : product.id
        const addedItem = {
            id: cartItemId,
            productId: product.id,
            name: product.name,
            price: activeUnitPriceInfo.amount,
            quantity: quantity,
            image: product.images[0],
            shade: selectedShade?.name || undefined,
        }
        addToCart({
            ...addedItem,
            currency: activeUnitPriceInfo.fromCurrency
        })
        toast.success(t("addedToCart"), {
            description: `${product.name}${selectedShade ? ` - ${selectedShade.name}` : ""} (x${quantity})`,
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
            productId: product.bundleProduct.id,
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
            productId: product.id,
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
            <div className="mb-4 flex flex-wrap items-end gap-2">
                <h1 className="text-4xl lg:text-5xl font-serif font-extrabold leading-tight tracking-tight">{product.name}</h1>
                {product.brand?.trim() && (
                    <button
                        type="button"
                        onClick={() => router.push(`/brands/${encodeURIComponent(product.brand)}`)}
                        className="rounded-md border border-border px-2 py-1 text-sm font-semibold text-primary hover:bg-primary/5"
                    >
                        {product.brand}
                    </button>
                )}
            </div>

            <div className="flex flex-wrap items-end gap-4 mb-8">
                <div className="flex items-baseline gap-4">
                    <span className="text-3xl font-light text-primary">
                        {formatDisplayAmount(totalPrice, activeUnitPriceInfo.fromCurrency, displayCurrency, locale)}
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
                    {totalDiscountPercent !== null && (
                        <span className="text-sm font-bold text-red-600">-{totalDiscountPercent}%</span>
                    )}
                </div>
                {selectedShade && (
                    <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary">
                        Shade price: {formatDisplayAmount(activeUnitPriceInfo.amount, activeUnitPriceInfo.fromCurrency, displayCurrency, locale)}
                    </div>
                )}
                {saleBadgeText && (
                    <div className="flex items-center gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                        <span title={product.promoTooltipText || undefined}>{saleBadgeText}</span>
                        {hasMiniCalendar && (
                            <Dialog
                                open={isCalendarOpen}
                                onOpenChange={(open) => {
                                    setIsCalendarOpen(open)
                                    if (open) setCalendarMonthIndex(0)
                                }}
                            >
                                <DialogTrigger asChild>
                                    <button
                                        type="button"
                                        aria-label="Open sale calendar"
                                        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-red-400 text-red-600 transition-colors hover:bg-red-100"
                                    >
                                        <CircleHelp className="h-3.5 w-3.5" />
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="w-[340px] p-4 sm:max-w-[340px]" showCloseButton={false}>
                                    <DialogHeader>
                                        <div className="flex items-center justify-between">
                                            <button
                                                type="button"
                                                onClick={() => setCalendarMonthIndex((current) => Math.max(0, current - 1))}
                                                disabled={calendarMonthIndex === 0}
                                                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border text-black transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                                                aria-label="Previous month"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </button>
                                            <DialogTitle className="text-center text-3xl font-black capitalize">
                                                {monthName}
                                                <span className="ml-2 text-sm font-semibold text-black/60">{viewedYear}</span>
                                            </DialogTitle>
                                            <button
                                                type="button"
                                                onClick={() => setCalendarMonthIndex((current) => Math.min(monthWindow.length - 1, current + 1))}
                                                disabled={calendarMonthIndex >= monthWindow.length - 1}
                                                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border text-black transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                                                aria-label="Next month"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </DialogHeader>
                                    <div className="mt-2 rounded-xl border border-border bg-white p-3">
                                        <div className="grid grid-cols-7 gap-y-1.5 text-center">
                                            {weekdayLabels.map((label) => (
                                                <p key={label} className="text-[10px] font-semibold text-black/70">
                                                    {label}
                                                </p>
                                            ))}
                                            {Array.from({ length: firstWeekday }).map((_, index) => (
                                                <span key={`empty-${index}`} />
                                            ))}
                                            {Array.from({ length: daysInMonth }, (_, index) => {
                                                const day = index + 1
                                                const dayKey = formatDateKey(viewedYear, viewedMonthNumber, day)
                                                const isSaleDay = saleDaySet.has(dayKey)
                                                const isSaleEndDay = saleEndDayKey === dayKey
                                                const isToday = viewedYear === todayYear && viewedMonthNumber === todayMonth && todayDay === day
                                                return (
                                                    <span
                                                        key={`day-${day}`}
                                                        className={`mx-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                                                            isSaleEndDay ? "text-red-600" : (isSaleDay ? "text-amber-500" : "text-black")
                                                        } ${isToday ? "border-2 border-black" : ""}`}
                                                    >
                                                        {day}
                                                    </span>
                                                )
                                            })}
                                        </div>
                                        {viewedMonthHasSale && (
                                            <div className="mt-3 border-t border-border pt-2 text-[11px] font-medium text-black">
                                                <p>
                                                    Start: <span className="text-amber-500">{saleStartText}</span>
                                                </p>
                                                <p>
                                                    End: <span className="text-red-600">{saleEndDayOnlyText}</span>
                                                </p>
                                                <p>Discount: {saleDiscountPercent !== null ? `${saleDiscountPercent}% off` : "N/A"}</p>
                                            </div>
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                )}
                <div className="w-full">
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
            </div>

            {product.colorShades && product.colorShades.length > 0 && (
                <div className="mb-8 rounded-lg border border-border p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Color / Shade</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        This product has multiple shades. Choose your preferred one.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {product.colorShades.map((shade) => {
                            const shadePriceInfo = resolveDisplayPrice(
                                {
                                    price: shade.price,
                                    currency: product.currency || "USD",
                                    priceAed: shade.priceAed ?? null,
                                    priceT: shade.priceT ?? null,
                                },
                                displayCurrency
                            )
                            const isSelected = (selectedShade?.id || "") === shade.id
                            return (
                                <button
                                    key={shade.id}
                                    type="button"
                                    onClick={() => setSelectedShadeId(shade.id)}
                                    className={`rounded-md border px-3 py-2 text-left ${isSelected
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border hover:border-primary/40"
                                        }`}
                                >
                                    <p className="text-sm font-semibold">{shade.name}</p>
                                    <p className="text-xs">
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
