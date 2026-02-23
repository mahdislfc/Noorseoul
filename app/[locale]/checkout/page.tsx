"use client"


import { useEffect, useState } from "react"
import { Footer } from "@/components/layout/Footer"
import { useCart } from "@/context/CartContext"
import { useUser } from "@/context/UserContext"
import { ChevronRight, CreditCard, Lock, Minus, Plus, ShieldCheck, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { clearRewardPointsCacheOnce, pointsFromOrderTotal } from "@/lib/reward-points"
import { getShippingCostForSubtotal } from "@/lib/shipping"
import { useDisplayCurrency } from "@/context/DisplayCurrencyContext"
import { formatDisplayAmount } from "@/lib/display-currency"

import { useLocale, useTranslations } from 'next-intl';

export default function CheckoutPage() {
    const t = useTranslations("Checkout")
    const locale = useLocale();
    const isRtl = locale === 'ar' || locale === "fa";
    const { currency: displayCurrency } = useDisplayCurrency()
    const { items, totalPrice, clearCart, addToCart, removeFromCart } = useCart()
    const { user, orders } = useUser()
    const [activeStep, setActiveStep] = useState(1)
    const [email, setEmail] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [address, setAddress] = useState("")
    const [city, setCity] = useState("Seoul")
    const [placingOrder, setPlacingOrder] = useState(false)
    const [checkoutError, setCheckoutError] = useState("")
    const [successOrderNumber, setSuccessOrderNumber] = useState("")
    const [rewardCodeInput, setRewardCodeInput] = useState("")
    const [activeFreeShippingCode, setActiveFreeShippingCode] = useState("")
    const [shippingRewardApplied, setShippingRewardApplied] = useState(false)
    const [activeVoucher15Code, setActiveVoucher15Code] = useState("")
    const [activeVoucher30Code, setActiveVoucher30Code] = useState("")
    const [activeVoucher50Code, setActiveVoucher50Code] = useState("")
    const [activeFirstPurchaseSampleCode, setActiveFirstPurchaseSampleCode] = useState("")
    const [isFirstPurchaseSampleApplied, setIsFirstPurchaseSampleApplied] = useState(false)
    const [hasUsedFirstPurchaseSample, setHasUsedFirstPurchaseSample] = useState(false)
    const [appliedRewards, setAppliedRewards] = useState<string[]>([])
    const [appliedCodeValues, setAppliedCodeValues] = useState<string[]>([])
    const [voucherDiscountAmount, setVoucherDiscountAmount] = useState(0)
    const [appliedVoucherCode, setAppliedVoucherCode] = useState("")
    const [rewardCodeMessage, setRewardCodeMessage] = useState("")
    const [rewardCodeHighlight, setRewardCodeHighlight] = useState("")
    const [isRewardCodeMessageSuccess, setIsRewardCodeMessageSuccess] = useState(false)

    const FREE_SHIPPING_CODE_KEY = "reward_free_shipping_code"
    const FREE_SHIPPING_CLAIMED_KEY = "reward_free_shipping_claimed"
    const FIRST_PURCHASE_SAMPLE_CODE_KEY = "reward_first_purchase_sample_code"
    const FIRST_PURCHASE_SAMPLE_CLAIMED_KEY = "reward_first_purchase_sample_claimed"
    const FIRST_PURCHASE_SAMPLE_USED_KEY = "reward_first_purchase_sample_used"
    const VOUCHER_15_CODE_KEY = "reward_voucher_15_code"
    const VOUCHER_15_CLAIMED_KEY = "reward_voucher_15_claimed"
    const VOUCHER_30_CODE_KEY = "reward_voucher_30_code"
    const VOUCHER_30_CLAIMED_KEY = "reward_voucher_30_claimed"
    const VOUCHER_50_CODE_KEY = "reward_voucher_50_code"
    const VOUCHER_50_CLAIMED_KEY = "reward_voucher_50_claimed"
    const CLAIMED_REWARDS_KEY = "reward_claimed_rewards"
    const userKey = user?.email?.toLowerCase() || "guest"
    const storageKey = (baseKey: string) => `${baseKey}:${userKey}`
    const cartCurrencies = Array.from(new Set(items.map((item) => (item.currency || "AED").toUpperCase())))
    const cartCurrency = cartCurrencies.length === 1 ? cartCurrencies[0] : "AED"

    const subtotal = totalPrice
    const baseShippingCost = getShippingCostForSubtotal(subtotal)
    const shippingCost = shippingRewardApplied ? 0 : baseShippingCost
    const appliedDiscount = Math.min(voucherDiscountAmount, subtotal)
    const discountedSubtotal = Math.max(0, subtotal - appliedDiscount)
    const shippingDiscount = shippingRewardApplied ? baseShippingCost : 0
    const totalSavings = appliedDiscount + shippingDiscount
    const vat = discountedSubtotal * 0.05
    const finalTotal = discountedSubtotal + shippingCost + vat
    const estimatedGems = pointsFromOrderTotal(finalTotal)
    const totalItemQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
    const displayMoney = (amount: number) => formatDisplayAmount(amount, cartCurrency, displayCurrency, locale)
    const rewardFreeShipping = t("rewards.freeShipping")
    const rewardSample = t("rewards.sample")
    const rewardDiscount10 = t("rewards.discount10")
    const rewardDiscount20 = t("rewards.discount20")
    const rewardDiscount30 = t("rewards.discount30")

    useEffect(() => {
        if (!user) return

        setEmail((current) => current.trim() ? current : (user.email || ""))
        setFirstName((current) => current.trim() ? current : (user.firstName || ""))
        setLastName((current) => current.trim() ? current : (user.lastName || ""))
        setAddress((current) => current.trim() ? current : (user.address || ""))
        setCity((current) => {
            if (current.trim() && current !== "Seoul") return current
            const profileCity = user.city?.trim()
            return profileCity || current || "Seoul"
        })
    }, [user])

    useEffect(() => {
        clearRewardPointsCacheOnce()
        try {
            const key = (baseKey: string) => `${baseKey}:${userKey}`

            // Clean legacy global keys from the old reward system.
            localStorage.removeItem(FREE_SHIPPING_CODE_KEY)
            localStorage.removeItem(FREE_SHIPPING_CLAIMED_KEY)
            localStorage.removeItem(VOUCHER_15_CODE_KEY)
            localStorage.removeItem(VOUCHER_15_CLAIMED_KEY)
            localStorage.removeItem(VOUCHER_30_CODE_KEY)
            localStorage.removeItem(VOUCHER_30_CLAIMED_KEY)
            localStorage.removeItem(VOUCHER_50_CODE_KEY)
            localStorage.removeItem(VOUCHER_50_CLAIMED_KEY)

            const shippingCode = localStorage.getItem(key(FREE_SHIPPING_CODE_KEY))
            const shippingClaimed = localStorage.getItem(key(FREE_SHIPPING_CLAIMED_KEY)) === "true"
            if (shippingCode && shippingClaimed) {
                setActiveFreeShippingCode(shippingCode)
            } else {
                setActiveFreeShippingCode("")
            }

            const firstPurchaseSampleCode = localStorage.getItem(key(FIRST_PURCHASE_SAMPLE_CODE_KEY))
            const firstPurchaseSampleClaimed = localStorage.getItem(key(FIRST_PURCHASE_SAMPLE_CLAIMED_KEY)) === "true"
            const firstPurchaseSampleUsed = localStorage.getItem(key(FIRST_PURCHASE_SAMPLE_USED_KEY)) === "true"
            if (firstPurchaseSampleCode && firstPurchaseSampleClaimed && !firstPurchaseSampleUsed) {
                setActiveFirstPurchaseSampleCode(firstPurchaseSampleCode)
            } else {
                setActiveFirstPurchaseSampleCode("")
            }
            setHasUsedFirstPurchaseSample(firstPurchaseSampleUsed)

            const voucher15Code = localStorage.getItem(key(VOUCHER_15_CODE_KEY))
            const voucher15Claimed = localStorage.getItem(key(VOUCHER_15_CLAIMED_KEY)) === "true"
            if (voucher15Code && voucher15Claimed) {
                setActiveVoucher15Code(voucher15Code)
            } else {
                setActiveVoucher15Code("")
            }

            const voucher30Code = localStorage.getItem(key(VOUCHER_30_CODE_KEY))
            const voucher30Claimed = localStorage.getItem(key(VOUCHER_30_CLAIMED_KEY)) === "true"
            if (voucher30Code && voucher30Claimed) {
                setActiveVoucher30Code(voucher30Code)
            } else {
                setActiveVoucher30Code("")
            }

            const voucher50Code = localStorage.getItem(key(VOUCHER_50_CODE_KEY))
            const voucher50Claimed = localStorage.getItem(key(VOUCHER_50_CLAIMED_KEY)) === "true"
            if (voucher50Code && voucher50Claimed) {
                setActiveVoucher50Code(voucher50Code)
            } else {
                setActiveVoucher50Code("")
            }
        } catch {
            // ignore storage issues
        }
    }, [userKey])

    const handleApplyRewardCode = (codeToApply?: string | unknown) => {
        const rawInput = typeof codeToApply === "string" ? codeToApply : rewardCodeInput
        const normalizedInput = rawInput.trim().toUpperCase()
        let latestShippingCode = activeFreeShippingCode
        let latestFirstPurchaseSampleCode = activeFirstPurchaseSampleCode
        let latestVoucher15Code = activeVoucher15Code
        let latestVoucher30Code = activeVoucher30Code
        let latestVoucher50Code = activeVoucher50Code

        try {
            const shippingCode = localStorage.getItem(storageKey(FREE_SHIPPING_CODE_KEY))
            const shippingClaimed = localStorage.getItem(storageKey(FREE_SHIPPING_CLAIMED_KEY)) === "true"
            latestShippingCode = shippingCode && shippingClaimed ? shippingCode : ""

            const firstPurchaseSampleCode = localStorage.getItem(storageKey(FIRST_PURCHASE_SAMPLE_CODE_KEY))
            const firstPurchaseSampleClaimed = localStorage.getItem(storageKey(FIRST_PURCHASE_SAMPLE_CLAIMED_KEY)) === "true"
            const firstPurchaseSampleUsed = localStorage.getItem(storageKey(FIRST_PURCHASE_SAMPLE_USED_KEY)) === "true"
            latestFirstPurchaseSampleCode =
                firstPurchaseSampleCode && firstPurchaseSampleClaimed && !firstPurchaseSampleUsed
                    ? firstPurchaseSampleCode
                    : ""
            setHasUsedFirstPurchaseSample(firstPurchaseSampleUsed)

            const voucher15Code = localStorage.getItem(storageKey(VOUCHER_15_CODE_KEY))
            const voucher15Claimed = localStorage.getItem(storageKey(VOUCHER_15_CLAIMED_KEY)) === "true"
            latestVoucher15Code = voucher15Code && voucher15Claimed ? voucher15Code : ""

            const voucher30Code = localStorage.getItem(storageKey(VOUCHER_30_CODE_KEY))
            const voucher30Claimed = localStorage.getItem(storageKey(VOUCHER_30_CLAIMED_KEY)) === "true"
            latestVoucher30Code = voucher30Code && voucher30Claimed ? voucher30Code : ""

            const voucher50Code = localStorage.getItem(storageKey(VOUCHER_50_CODE_KEY))
            const voucher50Claimed = localStorage.getItem(storageKey(VOUCHER_50_CLAIMED_KEY)) === "true"
            latestVoucher50Code = voucher50Code && voucher50Claimed ? voucher50Code : ""

            setActiveFreeShippingCode(latestShippingCode)
            setActiveFirstPurchaseSampleCode(latestFirstPurchaseSampleCode)
            setActiveVoucher15Code(latestVoucher15Code)
            setActiveVoucher30Code(latestVoucher30Code)
            setActiveVoucher50Code(latestVoucher50Code)
        } catch {
            // ignore storage issues
        }

        const normalizedShippingCode = latestShippingCode.trim().toUpperCase()
        const normalizedFirstPurchaseSampleCode = latestFirstPurchaseSampleCode.trim().toUpperCase()
        const normalizedVoucher15Code = latestVoucher15Code.trim().toUpperCase()
        const normalizedVoucher30Code = latestVoucher30Code.trim().toUpperCase()
        const normalizedVoucher50Code = latestVoucher50Code.trim().toUpperCase()

        if (!normalizedInput) {
            setRewardCodeMessage(t("messages.enterRewardCode"))
            setRewardCodeHighlight("")
            setIsRewardCodeMessageSuccess(false)
            return
        }

        if (
            !normalizedShippingCode &&
            !normalizedFirstPurchaseSampleCode &&
            !normalizedVoucher15Code &&
            !normalizedVoucher30Code &&
            !normalizedVoucher50Code
        ) {
            setRewardCodeMessage(t("messages.noActiveRewardCode"))
            setRewardCodeHighlight("")
            setIsRewardCodeMessageSuccess(false)
            return
        }

        if (normalizedInput === normalizedShippingCode) {
            setShippingRewardApplied(true)
            setAppliedRewards((current) => (current.includes(rewardFreeShipping) ? current : [...current, rewardFreeShipping]))
            setAppliedCodeValues((current) => (current.includes(normalizedInput) ? current : [...current, normalizedInput]))
            setRewardCodeMessage(t("messages.codeApplied", { code: normalizedInput }))
            setRewardCodeHighlight("")
            setIsRewardCodeMessageSuccess(true)
            setRewardCodeInput("")
            return
        }

        if (normalizedInput === normalizedFirstPurchaseSampleCode) {
            if (hasUsedFirstPurchaseSample) {
                setRewardCodeMessage(t("messages.sampleCodeUsed"))
                setRewardCodeHighlight("")
                setIsRewardCodeMessageSuccess(false)
                return
            }

            if (orders.length > 0) {
                setRewardCodeMessage(t("messages.sampleFirstPurchaseOnly"))
                setRewardCodeHighlight("")
                setIsRewardCodeMessageSuccess(false)
                return
            }

            if (totalItemQuantity < 3) {
                setRewardCodeMessage(t("messages.sampleNeedsThreeItems"))
                setRewardCodeHighlight("")
                setIsRewardCodeMessageSuccess(false)
                return
            }

            setIsFirstPurchaseSampleApplied(true)
            setAppliedRewards((current) => (
                current.includes(rewardSample)
                    ? current
                    : [...current, rewardSample]
            ))
            setAppliedCodeValues((current) => (current.includes(normalizedInput) ? current : [...current, normalizedInput]))
            setRewardCodeMessage(t("messages.codeApplied", { code: normalizedInput }))
            setRewardCodeHighlight("")
            setIsRewardCodeMessageSuccess(true)
            setRewardCodeInput("")
            return
        }

        if (normalizedInput === normalizedVoucher15Code) {
            setVoucherDiscountAmount(10)
            setAppliedVoucherCode(normalizedVoucher15Code)
            setAppliedRewards((current) => {
                const withoutVoucher = current.filter(
                    (reward) =>
                        reward !== rewardDiscount10 &&
                        reward !== rewardDiscount20 &&
                        reward !== rewardDiscount30
                )
                return [...withoutVoucher, rewardDiscount10]
            })
            setAppliedCodeValues((current) => (current.includes(normalizedInput) ? current : [...current, normalizedInput]))
            setRewardCodeMessage(t("messages.codeApplied", { code: normalizedInput }))
            setRewardCodeHighlight("")
            setIsRewardCodeMessageSuccess(true)
            setRewardCodeInput("")
            return
        }

        if (normalizedInput === normalizedVoucher30Code) {
            setVoucherDiscountAmount(20)
            setAppliedVoucherCode(normalizedVoucher30Code)
            setAppliedRewards((current) => {
                const withoutVoucher = current.filter(
                    (reward) =>
                        reward !== rewardDiscount10 &&
                        reward !== rewardDiscount20 &&
                        reward !== rewardDiscount30
                )
                return [...withoutVoucher, rewardDiscount20]
            })
            setAppliedCodeValues((current) => (current.includes(normalizedInput) ? current : [...current, normalizedInput]))
            setRewardCodeMessage(t("messages.codeApplied", { code: normalizedInput }))
            setRewardCodeHighlight("")
            setIsRewardCodeMessageSuccess(true)
            setRewardCodeInput("")
            return
        }

        if (normalizedInput === normalizedVoucher50Code) {
            setVoucherDiscountAmount(30)
            setAppliedVoucherCode(normalizedVoucher50Code)
            setAppliedRewards((current) => {
                const withoutVoucher = current.filter(
                    (reward) =>
                        reward !== rewardDiscount10 &&
                        reward !== rewardDiscount20 &&
                        reward !== rewardDiscount30
                )
                return [...withoutVoucher, rewardDiscount30]
            })
            setAppliedCodeValues((current) => (current.includes(normalizedInput) ? current : [...current, normalizedInput]))
            setRewardCodeMessage(t("messages.codeApplied", { code: normalizedInput }))
            setRewardCodeHighlight("")
            setIsRewardCodeMessageSuccess(true)
            setRewardCodeInput("")
            return
        }

        setRewardCodeMessage(t("messages.invalidCode"))
        setRewardCodeHighlight("")
        setIsRewardCodeMessageSuccess(false)
    }

    const availableCodes = [activeFirstPurchaseSampleCode, activeFreeShippingCode, activeVoucher15Code, activeVoucher30Code, activeVoucher50Code]
        .map((code) => code.trim().toUpperCase())
        .filter((code) => Boolean(code) && !appliedCodeValues.includes(code))

    const clearClaimedReward = (rewardId: "shipping" | "voucher15" | "voucher30" | "voucher50") => {
        try {
            const raw = localStorage.getItem(storageKey(CLAIMED_REWARDS_KEY))
            if (!raw) return
            const parsed = JSON.parse(raw) as Record<string, boolean>
            if (!parsed[rewardId]) return
            delete parsed[rewardId]
            localStorage.setItem(storageKey(CLAIMED_REWARDS_KEY), JSON.stringify(parsed))
        } catch {
            // ignore storage issues
        }
    }

    const handleCompletePurchase = async () => {
        setCheckoutError("")
        setSuccessOrderNumber("")

        if (!email.trim() || !firstName.trim() || !lastName.trim() || !city.trim()) {
            setCheckoutError(t("messages.completeDetails"))
            return
        }

        if (items.length === 0) {
            setCheckoutError(t("messages.bagEmpty"))
            return
        }

        setPlacingOrder(true)
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    firstName,
                    lastName,
                    address,
                    city,
                    currency: cartCurrency,
                    firstPurchaseSampleApplied: isFirstPurchaseSampleApplied,
                    shippingRewardApplied,
                    items,
                }),
            })

            const data = await res.json().catch(() => null)
            if (!res.ok) {
                throw new Error(data?.error || t("messages.failedToPlaceOrder"))
            }

            setSuccessOrderNumber(data?.order?.orderNumber || "")
            if (isFirstPurchaseSampleApplied && activeFirstPurchaseSampleCode) {
                try {
                    localStorage.setItem(storageKey(FIRST_PURCHASE_SAMPLE_USED_KEY), "true")
                    localStorage.removeItem(storageKey(FIRST_PURCHASE_SAMPLE_CODE_KEY))
                    setHasUsedFirstPurchaseSample(true)
                } catch {
                    // ignore storage issues
                }
                setActiveFirstPurchaseSampleCode("")
                setIsFirstPurchaseSampleApplied(false)
                setRewardCodeInput("")
                setRewardCodeMessage("")
                setRewardCodeHighlight("")
                setIsRewardCodeMessageSuccess(false)
            }
            if (shippingRewardApplied && activeFreeShippingCode) {
                try {
                    localStorage.removeItem(storageKey(FREE_SHIPPING_CODE_KEY))
                    localStorage.removeItem(storageKey(FREE_SHIPPING_CLAIMED_KEY))
                    clearClaimedReward("shipping")
                } catch {
                    // ignore storage issues
                }
                setActiveFreeShippingCode("")
                setRewardCodeInput("")
                setRewardCodeMessage("")
                setRewardCodeHighlight("")
                setIsRewardCodeMessageSuccess(false)
                setShippingRewardApplied(false)
            }
            if (voucherDiscountAmount > 0 && appliedVoucherCode) {
                try {
                    if (appliedVoucherCode === activeVoucher15Code.toUpperCase()) {
                        localStorage.removeItem(storageKey(VOUCHER_15_CODE_KEY))
                        localStorage.removeItem(storageKey(VOUCHER_15_CLAIMED_KEY))
                        clearClaimedReward("voucher15")
                        setActiveVoucher15Code("")
                    }
                    if (appliedVoucherCode === activeVoucher30Code.toUpperCase()) {
                        localStorage.removeItem(storageKey(VOUCHER_30_CODE_KEY))
                        localStorage.removeItem(storageKey(VOUCHER_30_CLAIMED_KEY))
                        clearClaimedReward("voucher30")
                        setActiveVoucher30Code("")
                    }
                    if (appliedVoucherCode === activeVoucher50Code.toUpperCase()) {
                        localStorage.removeItem(storageKey(VOUCHER_50_CODE_KEY))
                        localStorage.removeItem(storageKey(VOUCHER_50_CLAIMED_KEY))
                        clearClaimedReward("voucher50")
                        setActiveVoucher50Code("")
                    }
                } catch {
                    // ignore storage issues
                }
                setVoucherDiscountAmount(0)
                setAppliedVoucherCode("")
                setRewardCodeInput("")
                setRewardCodeMessage("")
                setRewardCodeHighlight("")
                setIsRewardCodeMessageSuccess(false)
            }
            setAppliedRewards([])
            setAppliedCodeValues([])
            clearCart()
        } catch (error) {
            setCheckoutError(error instanceof Error ? error.message : t("messages.failedToPlaceOrder"))
        } finally {
            setPlacingOrder(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col font-sans bg-background">
            <main className="flex-grow pt-32 pb-12">
                <div className="container mx-auto px-6 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Column: Checkout Steps */}
                    <div className="lg:col-span-7 flex flex-col gap-8">
                        <h1 className="text-3xl font-serif font-bold tracking-tight">{t("title")}</h1>
                        <nav className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            <span>{t("steps.bag")}</span>
                            <ChevronRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
                            <span className="text-foreground">{t("steps.details")}</span>
                            <ChevronRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
                            <span>{t("steps.confirmation")}</span>
                        </nav>

                        <div className="flex flex-col gap-4">
                            {/* Step 1: Information */}
                            <div className="border border-border rounded-xl overflow-hidden">
                                <button
                                    className="w-full flex items-center justify-between p-6 bg-secondary/5"
                                    onClick={() => setActiveStep(activeStep === 1 ? 0 : 1)}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className={cn("flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold", activeStep === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>1</span>
                                        <h3 className="text-lg font-semibold">{t("sections.information")}</h3>
                                    </div>
                                </button>
                                {activeStep === 1 && (
                                    <div className="p-6 border-t border-border animate-in fade-in slide-in-from-top-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-foreground">{t("fields.emailAddress")}</label>
                                                <input
                                                    type="email"
                                                    placeholder={t("placeholders.email")}
                                                    value={email}
                                                    onChange={(event) => setEmail(event.target.value)}
                                                    className="h-12 w-full rounded-lg border border-border bg-transparent px-4 focus:ring-1 focus:ring-primary outline-none"
                                                />
                                            </div>
                                            <Button type="button" className="h-12 mt-auto" onClick={() => setActiveStep(2)}>{t("actions.continueToShipping")}</Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Step 2: Shipping */}
                            <div className="border border-border rounded-xl overflow-hidden">
                                <button
                                    className="w-full flex items-center justify-between p-6 bg-secondary/5"
                                    onClick={() => setActiveStep(activeStep === 2 ? 0 : 2)}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className={cn("flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold", activeStep === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>2</span>
                                        <h3 className="text-lg font-semibold">{t("sections.shipping")}</h3>
                                    </div>
                                </button>
                                {activeStep === 2 && (
                                    <div className="p-6 border-t border-border animate-in fade-in slide-in-from-top-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-bold uppercase tracking-widest">{t("fields.firstName")}</label>
                                                <input
                                                    type="text"
                                                    value={firstName}
                                                    onChange={(event) => setFirstName(event.target.value)}
                                                    className="h-12 rounded-lg border border-border bg-transparent px-4 outline-none"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-bold uppercase tracking-widest">{t("fields.lastName")}</label>
                                                <input
                                                    type="text"
                                                    value={lastName}
                                                    onChange={(event) => setLastName(event.target.value)}
                                                    className="h-12 rounded-lg border border-border bg-transparent px-4 outline-none"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2 md:col-span-2">
                                                <label className="text-xs font-bold uppercase tracking-widest">{t("fields.address")}</label>
                                                <input
                                                    type="text"
                                                    value={address}
                                                    onChange={(event) => setAddress(event.target.value)}
                                                    className="h-12 rounded-lg border border-border bg-transparent px-4 outline-none"
                                                    placeholder={t("placeholders.address")}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2 md:col-span-2">
                                                <label className="text-xs font-bold uppercase tracking-widest">{t("fields.city")}</label>
                                                <select
                                                    value={city}
                                                    onChange={(event) => setCity(event.target.value)}
                                                    className="h-12 rounded-lg border border-border bg-transparent px-4 outline-none bg-background"
                                                >
                                                    <option>Seoul</option>
                                                    <option>Busan</option>
                                                    <option>Incheon</option>
                                                </select>
                                            </div>
                                            <Button type="button" className="md:col-span-2 h-12" onClick={() => setActiveStep(3)}>{t("actions.continueToPayment")}</Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Step 3: Payment */}
                            <div className="border border-border rounded-xl overflow-hidden">
                                <button
                                    className="w-full flex items-center justify-between p-6 bg-secondary/5"
                                    onClick={() => setActiveStep(activeStep === 3 ? 0 : 3)}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className={cn("flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold", activeStep === 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>3</span>
                                        <h3 className="text-lg font-semibold">{t("sections.payment")}</h3>
                                    </div>
                                </button>
                                {activeStep === 3 && (
                                    <div className="p-6 border-t border-border animate-in fade-in slide-in-from-top-2">
                                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6 flex items-start gap-4">
                                            <ShieldCheck className="text-primary w-6 h-6" />
                                            <div>
                                                <p className="text-sm font-bold uppercase tracking-wider">{t("payment.encryptedSecure")}</p>
                                                <p className="text-xs text-muted-foreground">{t("payment.encryptionNote")}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-bold uppercase tracking-widest">{t("fields.cardNumber")}</label>
                                                <input type="text" placeholder="0000 0000 0000 0000" className="h-12 w-full rounded-lg border border-border bg-transparent px-4 outline-none" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-xs font-bold uppercase tracking-widest">{t("fields.expiry")}</label>
                                                    <input type="text" placeholder="MM / YY" className="h-12 rounded-lg border border-border bg-transparent px-4 outline-none" />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-xs font-bold uppercase tracking-widest">{t("fields.cvc")}</label>
                                                    <input type="text" placeholder="123" className="h-12 rounded-lg border border-border bg-transparent px-4 outline-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24 bg-surface rounded-2xl border border-border p-8 flex flex-col gap-6 shadow-sm">
                            <h2 className="text-xl font-bold border-b border-border pb-4 tracking-tight">{t("summary.title")}</h2>

                            <div className="flex flex-col gap-6 max-h-80 overflow-y-auto">
                                {items.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-4">{t("messages.bagEmpty")}</p>
                                ) : (
                                    items.map(item => (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="size-20 rounded-lg bg-secondary/20 overflow-hidden flex-shrink-0 border border-border/20">
                                                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${item.image}')` }} />
                                            </div>
                                            <div className="flex flex-col justify-center gap-1 flex-1">
                                                <h4 className="font-bold text-sm tracking-wide">{item.name}</h4>
                                                <div className="flex items-center justify-between gap-3 pt-1">
                                                    <div className="inline-flex items-center rounded-full border border-border">
                                                        <button
                                                            type="button"
                                                            onClick={() => addToCart({ ...item, quantity: -1 })}
                                                            className="h-7 w-7 grid place-items-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                                                            disabled={item.quantity <= 1}
                                                            aria-label={t("actions.decreaseQuantityOf", { name: item.name })}
                                                        >
                                                            <Minus className="h-3.5 w-3.5" />
                                                        </button>
                                                        <span className="w-7 text-center text-xs font-semibold">{item.quantity}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => addToCart({ ...item, quantity: 1 })}
                                                            className="h-7 w-7 grid place-items-center text-muted-foreground hover:text-foreground"
                                                            aria-label={t("actions.increaseQuantityOf", { name: item.name })}
                                                        >
                                                            <Plus className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive"
                                                        aria-label={t("actions.removeProduct", { name: item.name })}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        {t("actions.remove")}
                                                    </button>
                                                </div>
                                                <p className="text-sm font-bold text-primary mt-1">
                                                    {formatDisplayAmount(item.price * item.quantity, item.currency || cartCurrency, displayCurrency, locale)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="flex flex-col gap-3 py-6 border-y border-border/30 text-sm">
                                <div className="space-y-2 rounded-lg border border-border p-3">
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("summary.discountRewardCode")}</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            list="available-reward-codes"
                                            value={rewardCodeInput}
                                            onChange={(event) => setRewardCodeInput(event.target.value.toUpperCase())}
                                            placeholder={availableCodes.length > 0 ? t("summary.enterCodeOrChoose") : t("summary.enterCode")}
                                            className="h-10 flex-1 rounded-md border border-border bg-transparent px-3 text-sm outline-none"
                                        />
                                        <Button type="button" className="h-10" onClick={handleApplyRewardCode}>
                                            {t("actions.apply")}
                                        </Button>
                                    </div>
                                    <datalist id="available-reward-codes">
                                        {availableCodes.map((code) => (
                                            <option key={code} value={code} />
                                        ))}
                                    </datalist>
                                    {rewardCodeMessage && (
                                        <p className={`text-xs ${isRewardCodeMessageSuccess ? "text-emerald-700" : "text-muted-foreground"}`}>
                                            {rewardCodeMessage}{" "}
                                            {rewardCodeHighlight && (
                                                <span className="font-bold text-sm">
                                                    {rewardCodeHighlight}
                                                </span>
                                            )}
                                        </p>
                                    )}
                                    {appliedRewards.length > 0 && (
                                        <p className="text-base text-emerald-700 font-bold">
                                            {t("summary.claimedRewards")}: {appliedRewards.join(", ")}
                                        </p>
                                    )}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("summary.subtotal")}</span>
                                    <span className="font-bold">{displayMoney(subtotal)}</span>
                                </div>
                                {appliedDiscount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t("summary.voucherDiscount")}</span>
                                        <span className="font-bold text-emerald-700">-{displayMoney(appliedDiscount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("summary.delivery")}</span>
                                    <span className="font-bold uppercase tracking-tighter">
                                        {displayMoney(baseShippingCost)}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground -mt-1">
                                    {t("summary.shippingPolicy")}
                                </p>
                                <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2">
                                    <p className="text-xs font-semibold text-primary">
                                        {t("summary.gemsEstimate", { count: estimatedGems })}
                                    </p>
                                </div>
                                {shippingDiscount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t("summary.shippingReward")}</span>
                                        <span className="font-bold text-emerald-700">-{displayMoney(shippingDiscount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("summary.subtotalAfterDiscounts")}</span>
                                    <span className="font-bold">{displayMoney(discountedSubtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("summary.vat")}</span>
                                    <span className="font-bold">{displayMoney(vat)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center py-2">
                                <span className="text-lg font-bold">{t("summary.total")}</span>
                                <span className="text-2xl font-black text-primary">{displayMoney(finalTotal)}</span>
                            </div>
                            {totalSavings > 0 && (
                                <p className="text-sm font-semibold text-emerald-700">
                                    {t("summary.youSaved", { amount: displayMoney(totalSavings) })}
                                </p>
                            )}

                            {checkoutError && (
                                <p className="text-sm text-red-600">{checkoutError}</p>
                            )}
                            {successOrderNumber && (
                                <p className="text-sm text-emerald-700">
                                    {t("messages.orderPlaced", { orderNumber: successOrderNumber })}
                                </p>
                            )}

                            <Button
                                type="button"
                                className="w-full py-6 text-sm"
                                onClick={handleCompletePurchase}
                                disabled={placingOrder || items.length === 0}
                            >
                                {placingOrder ? t("actions.placingOrder") : t("actions.completePurchase")}
                            </Button>

                            <div className="flex justify-center gap-6 mt-2 opacity-50 grayscale hover:grayscale-0 transition-all text-muted-foreground">
                                <CreditCard className="w-6 h-6" />
                                <Lock className="w-6 h-6" />
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    )
}
