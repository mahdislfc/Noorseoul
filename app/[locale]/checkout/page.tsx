"use client"


import { useEffect, useState } from "react"
import { Footer } from "@/components/layout/Footer"
import { useCart } from "@/context/CartContext"
import { useUser } from "@/context/UserContext"
import { ChevronRight, CreditCard, Lock, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { clearRewardPointsCacheOnce } from "@/lib/reward-points"

import { useLocale } from 'next-intl';

export default function CheckoutPage() {
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const { items, totalPrice, clearCart } = useCart()
    const { user } = useUser()
    const [activeStep, setActiveStep] = useState(1)
    const [email, setEmail] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [city, setCity] = useState("Seoul")
    const [placingOrder, setPlacingOrder] = useState(false)
    const [checkoutError, setCheckoutError] = useState("")
    const [successOrderNumber, setSuccessOrderNumber] = useState("")
    const [rewardCodeInput, setRewardCodeInput] = useState("")
    const [activeFreeShippingCode, setActiveFreeShippingCode] = useState("")
    const [shippingRewardApplied, setShippingRewardApplied] = useState(false)
    const [activeVoucher15Code, setActiveVoucher15Code] = useState("")
    const [activeVoucher30Code, setActiveVoucher30Code] = useState("")
    const [appliedRewards, setAppliedRewards] = useState<string[]>([])
    const [appliedCodeValues, setAppliedCodeValues] = useState<string[]>([])
    const [voucherDiscountAmount, setVoucherDiscountAmount] = useState(0)
    const [appliedVoucherCode, setAppliedVoucherCode] = useState("")
    const [rewardCodeMessage, setRewardCodeMessage] = useState("")
    const [rewardCodeHighlight, setRewardCodeHighlight] = useState("")
    const [isRewardCodeMessageSuccess, setIsRewardCodeMessageSuccess] = useState(false)

    const FREE_SHIPPING_CODE_KEY = "reward_free_shipping_code"
    const FREE_SHIPPING_CLAIMED_KEY = "reward_free_shipping_claimed"
    const VOUCHER_15_CODE_KEY = "reward_voucher_15_code"
    const VOUCHER_15_CLAIMED_KEY = "reward_voucher_15_claimed"
    const VOUCHER_30_CODE_KEY = "reward_voucher_30_code"
    const VOUCHER_30_CLAIMED_KEY = "reward_voucher_30_claimed"
    const CLAIMED_REWARDS_KEY = "reward_claimed_rewards"
    const BASE_SHIPPING_COST = 20
    const userKey = user?.email?.toLowerCase() || "guest"
    const storageKey = (baseKey: string) => `${baseKey}:${userKey}`
    const cartCurrencies = Array.from(new Set(items.map((item) => (item.currency || "AED").toUpperCase())))
    const cartCurrency = cartCurrencies.length === 1 ? cartCurrencies[0] : "AED"

    const shippingCost = shippingRewardApplied ? 0 : BASE_SHIPPING_COST
    const subtotal = totalPrice
    const appliedDiscount = Math.min(voucherDiscountAmount, subtotal)
    const discountedSubtotal = Math.max(0, subtotal - appliedDiscount)
    const shippingDiscount = shippingRewardApplied ? BASE_SHIPPING_COST : 0
    const totalSavings = appliedDiscount + shippingDiscount
    const vat = discountedSubtotal * 0.05
    const finalTotal = discountedSubtotal + shippingCost + vat

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

            const shippingCode = localStorage.getItem(key(FREE_SHIPPING_CODE_KEY))
            const shippingClaimed = localStorage.getItem(key(FREE_SHIPPING_CLAIMED_KEY)) === "true"
            if (shippingCode && shippingClaimed) {
                setActiveFreeShippingCode(shippingCode)
            } else {
                setActiveFreeShippingCode("")
            }

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
        } catch {
            // ignore storage issues
        }
    }, [userKey])

    const handleApplyRewardCode = (codeToApply?: string | unknown) => {
        const rawInput = typeof codeToApply === "string" ? codeToApply : rewardCodeInput
        const normalizedInput = rawInput.trim().toUpperCase()
        let latestShippingCode = activeFreeShippingCode
        let latestVoucher15Code = activeVoucher15Code
        let latestVoucher30Code = activeVoucher30Code

        try {
            const shippingCode = localStorage.getItem(storageKey(FREE_SHIPPING_CODE_KEY))
            const shippingClaimed = localStorage.getItem(storageKey(FREE_SHIPPING_CLAIMED_KEY)) === "true"
            latestShippingCode = shippingCode && shippingClaimed ? shippingCode : ""

            const voucher15Code = localStorage.getItem(storageKey(VOUCHER_15_CODE_KEY))
            const voucher15Claimed = localStorage.getItem(storageKey(VOUCHER_15_CLAIMED_KEY)) === "true"
            latestVoucher15Code = voucher15Code && voucher15Claimed ? voucher15Code : ""

            const voucher30Code = localStorage.getItem(storageKey(VOUCHER_30_CODE_KEY))
            const voucher30Claimed = localStorage.getItem(storageKey(VOUCHER_30_CLAIMED_KEY)) === "true"
            latestVoucher30Code = voucher30Code && voucher30Claimed ? voucher30Code : ""

            setActiveFreeShippingCode(latestShippingCode)
            setActiveVoucher15Code(latestVoucher15Code)
            setActiveVoucher30Code(latestVoucher30Code)
        } catch {
            // ignore storage issues
        }

        const normalizedShippingCode = latestShippingCode.trim().toUpperCase()
        const normalizedVoucher15Code = latestVoucher15Code.trim().toUpperCase()
        const normalizedVoucher30Code = latestVoucher30Code.trim().toUpperCase()

        if (!normalizedInput) {
            setRewardCodeMessage("Please enter a reward code.")
            setRewardCodeHighlight("")
            setIsRewardCodeMessageSuccess(false)
            return
        }

        if (
            !normalizedShippingCode &&
            !normalizedVoucher15Code &&
            !normalizedVoucher30Code
        ) {
            setRewardCodeMessage("No active reward code found.")
            setRewardCodeHighlight("")
            setIsRewardCodeMessageSuccess(false)
            return
        }

        if (normalizedInput === normalizedShippingCode) {
            setShippingRewardApplied(true)
            setAppliedRewards((current) => (current.includes("Free Shipping") ? current : [...current, "Free Shipping"]))
            setAppliedCodeValues((current) => (current.includes(normalizedInput) ? current : [...current, normalizedInput]))
            setRewardCodeMessage(`Code ${normalizedInput} applied:`)
            setRewardCodeHighlight("Free shipping activated")
            setIsRewardCodeMessageSuccess(true)
            setRewardCodeInput("")
            return
        }

        if (normalizedInput === normalizedVoucher15Code) {
            setVoucherDiscountAmount(15)
            setAppliedVoucherCode(normalizedVoucher15Code)
            setAppliedRewards((current) => {
                const withoutVoucher = current.filter(
                    (reward) => reward !== "$15 Discount" && reward !== "$30 Discount"
                )
                return [...withoutVoucher, "$15 Discount"]
            })
            setAppliedCodeValues((current) => (current.includes(normalizedInput) ? current : [...current, normalizedInput]))
            setRewardCodeMessage(`Code ${normalizedInput} applied:`)
            setRewardCodeHighlight("$15 discount activated")
            setIsRewardCodeMessageSuccess(true)
            setRewardCodeInput("")
            return
        }

        if (normalizedInput === normalizedVoucher30Code) {
            setVoucherDiscountAmount(30)
            setAppliedVoucherCode(normalizedVoucher30Code)
            setAppliedRewards((current) => {
                const withoutVoucher = current.filter(
                    (reward) => reward !== "$15 Discount" && reward !== "$30 Discount"
                )
                return [...withoutVoucher, "$30 Discount"]
            })
            setAppliedCodeValues((current) => (current.includes(normalizedInput) ? current : [...current, normalizedInput]))
            setRewardCodeMessage(`Code ${normalizedInput} applied:`)
            setRewardCodeHighlight("$30 discount activated")
            setIsRewardCodeMessageSuccess(true)
            setRewardCodeInput("")
            return
        }

        setRewardCodeMessage("Invalid code. Please check and try again.")
        setRewardCodeHighlight("")
        setIsRewardCodeMessageSuccess(false)
    }

    const availableCodes = [activeFreeShippingCode, activeVoucher15Code, activeVoucher30Code]
        .map((code) => code.trim().toUpperCase())
        .filter((code) => Boolean(code) && !appliedCodeValues.includes(code))

    const clearClaimedReward = (rewardId: "shipping" | "voucher15" | "voucher30") => {
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
            setCheckoutError("Please complete your contact and shipping details.")
            return
        }

        if (items.length === 0) {
            setCheckoutError("Your bag is empty.")
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
                    city,
                    currency: cartCurrency,
                    items,
                }),
            })

            const data = await res.json().catch(() => null)
            if (!res.ok) {
                throw new Error(data?.error || "Failed to place order")
            }

            setSuccessOrderNumber(data?.order?.orderNumber || "")
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
            setCheckoutError(error instanceof Error ? error.message : "Failed to place order")
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
                        <h1 className="text-3xl font-serif font-bold tracking-tight">Checkout</h1>
                        <nav className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            <span>Bag</span>
                            <ChevronRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
                            <span className="text-foreground">Details</span>
                            <ChevronRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
                            <span>Confirmation</span>
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
                                        <h3 className="text-lg font-semibold">Information</h3>
                                    </div>
                                </button>
                                {activeStep === 1 && (
                                    <div className="p-6 border-t border-border animate-in fade-in slide-in-from-top-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-foreground">Email Address</label>
                                                <input
                                                    type="email"
                                                    placeholder="email@example.com"
                                                    value={email}
                                                    onChange={(event) => setEmail(event.target.value)}
                                                    className="h-12 w-full rounded-lg border border-border bg-transparent px-4 focus:ring-1 focus:ring-primary outline-none"
                                                />
                                            </div>
                                            <Button type="button" className="h-12 mt-auto" onClick={() => setActiveStep(2)}>Continue to Shipping</Button>
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
                                        <h3 className="text-lg font-semibold">Shipping</h3>
                                    </div>
                                </button>
                                {activeStep === 2 && (
                                    <div className="p-6 border-t border-border animate-in fade-in slide-in-from-top-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-bold uppercase tracking-widest">First Name</label>
                                                <input
                                                    type="text"
                                                    value={firstName}
                                                    onChange={(event) => setFirstName(event.target.value)}
                                                    className="h-12 rounded-lg border border-border bg-transparent px-4 outline-none"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-bold uppercase tracking-widest">Last Name</label>
                                                <input
                                                    type="text"
                                                    value={lastName}
                                                    onChange={(event) => setLastName(event.target.value)}
                                                    className="h-12 rounded-lg border border-border bg-transparent px-4 outline-none"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2 md:col-span-2">
                                                <label className="text-xs font-bold uppercase tracking-widest">City</label>
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
                                            <Button type="button" className="md:col-span-2 h-12" onClick={() => setActiveStep(3)}>Continue to Payment</Button>
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
                                        <h3 className="text-lg font-semibold">Payment</h3>
                                    </div>
                                </button>
                                {activeStep === 3 && (
                                    <div className="p-6 border-t border-border animate-in fade-in slide-in-from-top-2">
                                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6 flex items-start gap-4">
                                            <ShieldCheck className="text-primary w-6 h-6" />
                                            <div>
                                                <p className="text-sm font-bold uppercase tracking-wider">Encrypted & Secure</p>
                                                <p className="text-xs text-muted-foreground">Your payment details are protected by 256-bit SSL encryption.</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-bold uppercase tracking-widest">Card Number</label>
                                                <input type="text" placeholder="0000 0000 0000 0000" className="h-12 w-full rounded-lg border border-border bg-transparent px-4 outline-none" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-xs font-bold uppercase tracking-widest">Expiry</label>
                                                    <input type="text" placeholder="MM / YY" className="h-12 rounded-lg border border-border bg-transparent px-4 outline-none" />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-xs font-bold uppercase tracking-widest">CVC</label>
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
                            <h2 className="text-xl font-bold border-b border-border pb-4 tracking-tight">Order Summary</h2>

                            <div className="flex flex-col gap-6 max-h-80 overflow-y-auto">
                                {items.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-4">Your bag is empty.</p>
                                ) : (
                                    items.map(item => (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="size-20 rounded-lg bg-secondary/20 overflow-hidden flex-shrink-0 border border-border/20">
                                                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${item.image}')` }} />
                                            </div>
                                            <div className="flex flex-col justify-center gap-1">
                                                <h4 className="font-bold text-sm tracking-wide">{item.name}</h4>
                                                <p className="text-xs text-muted-foreground uppercase tracking-widest">Quantity: {item.quantity}</p>
                                                <p className="text-sm font-bold text-primary mt-1">{(item.price * item.quantity).toFixed(2)} {cartCurrency}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="flex flex-col gap-3 py-6 border-y border-border/30 text-sm">
                                <div className="space-y-2 rounded-lg border border-border p-3">
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Discount / Reward Code</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            list="available-reward-codes"
                                            value={rewardCodeInput}
                                            onChange={(event) => setRewardCodeInput(event.target.value.toUpperCase())}
                                            placeholder={availableCodes.length > 0 ? "Enter code or choose from list" : "Enter code"}
                                            className="h-10 flex-1 rounded-md border border-border bg-transparent px-3 text-sm outline-none"
                                        />
                                        <Button type="button" className="h-10" onClick={handleApplyRewardCode}>
                                            Apply
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
                                            Claimed rewards: {appliedRewards.join(", ")}
                                        </p>
                                    )}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-bold">{subtotal.toFixed(2)} {cartCurrency}</span>
                                </div>
                                {appliedDiscount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Voucher Discount</span>
                                        <span className="font-bold text-emerald-700">-{appliedDiscount.toFixed(2)} {cartCurrency}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">White-Glove Delivery</span>
                                    <span className="font-bold uppercase tracking-tighter">
                                        {BASE_SHIPPING_COST.toFixed(2)} {cartCurrency}
                                    </span>
                                </div>
                                {shippingDiscount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipping Reward</span>
                                        <span className="font-bold text-emerald-700">-{shippingDiscount.toFixed(2)} {cartCurrency}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal After Discounts</span>
                                    <span className="font-bold">{discountedSubtotal.toFixed(2)} {cartCurrency}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">VAT (5%)</span>
                                    <span className="font-bold">{vat.toFixed(2)} {cartCurrency}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center py-2">
                                <span className="text-lg font-bold">Total</span>
                                <span className="text-2xl font-black text-primary">{finalTotal.toFixed(2)} {cartCurrency}</span>
                            </div>
                            {totalSavings > 0 && (
                                <p className="text-sm font-semibold text-emerald-700">
                                    You saved {totalSavings.toFixed(2)} {cartCurrency}
                                </p>
                            )}

                            {checkoutError && (
                                <p className="text-sm text-red-600">{checkoutError}</p>
                            )}
                            {successOrderNumber && (
                                <p className="text-sm text-emerald-700">
                                    Order placed successfully. Order number: {successOrderNumber}
                                </p>
                            )}

                            <Button
                                type="button"
                                className="w-full py-6 text-sm"
                                onClick={handleCompletePurchase}
                                disabled={placingOrder || items.length === 0}
                            >
                                {placingOrder ? "Placing Order..." : "Complete Purchase"}
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
