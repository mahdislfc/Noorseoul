"use client"

import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useUser } from "@/context/UserContext"
import { useRouter } from "@/i18n/routing"
import { clearRewardPointsCacheOnce, TEST_BONUS_POINTS } from "@/lib/reward-points"
import { Truck } from "lucide-react"
import { useEffect, useState } from "react"

const pointsFromOrderTotal = (amount: number) => {
    if (amount <= 0) return 0
    if (amount <= 10) return 1
    if (amount <= 19) return 2
    return Math.floor(amount / 10) + 1
}

const REWARD_OPTIONS = [
    { id: "sample-kit", points: 50, title: "Mini Sample Skincare Kit", description: "Redeem a mini skincare sample kit." },
    {
        id: "choose-product",
        points: 75,
        title: "Choose a Product",
        description: "Pick one: Lipstick, Blush, Highlighter, Eye Shadow, Lip Gloss, or Lip Tint."
    },
    { id: "shipping", points: 100, title: "Free Shipping", description: "Free shipping on your next order." },
    { id: "voucher15", points: 150, title: "$15 Voucher", description: "Voucher for your next checkout." },
    { id: "voucher30", points: 300, title: "$30 Voucher", description: "Voucher for your next checkout." }
]

const FREE_SHIPPING_CODE_KEY = "reward_free_shipping_code"
const FREE_SHIPPING_CLAIMED_KEY = "reward_free_shipping_claimed"
const VOUCHER_15_CODE_KEY = "reward_voucher_15_code"
const VOUCHER_15_CLAIMED_KEY = "reward_voucher_15_claimed"
const VOUCHER_30_CODE_KEY = "reward_voucher_30_code"
const VOUCHER_30_CLAIMED_KEY = "reward_voucher_30_claimed"
const SPENT_POINTS_KEY = "reward_spent_points"
const CLAIMED_REWARDS_KEY = "reward_claimed_rewards"
const CHOOSE_PRODUCT_SELECTED_KEY = "reward_choose_product_selected"
const REWARD_COST: Record<string, number> = {
    "choose-product": 75,
    shipping: 100,
    voucher15: 150,
    voucher30: 300,
}

export default function RewardsPage() {
    const { user, orders } = useUser()
    const router = useRouter()
    const completedOrders = orders.filter((order) => order.status === "Delivered")
    const earnedPoints = completedOrders.reduce(
        (sum, order) => sum + pointsFromOrderTotal(order.total),
        0
    )
    const [spentPoints, setSpentPoints] = useState(0)
    const totalPoints = Math.max(0, earnedPoints + TEST_BONUS_POINTS - spentPoints)
    const [isMiniKitOpen, setIsMiniKitOpen] = useState(false)
    const [isChooseProductOpen, setIsChooseProductOpen] = useState(false)
    const [isConfirmChoiceOpen, setIsConfirmChoiceOpen] = useState(false)
    const [isConfirmFreeShippingOpen, setIsConfirmFreeShippingOpen] = useState(false)
    const [isConfirmVoucherOpen, setIsConfirmVoucherOpen] = useState(false)
    const [isFreeShippingOpen, setIsFreeShippingOpen] = useState(false)
    const [isVoucherOpen, setIsVoucherOpen] = useState(false)
    const [selectedRewardProduct, setSelectedRewardProduct] = useState<string | null>(null)
    const [pendingRewardProduct, setPendingRewardProduct] = useState<string | null>(null)
    const [pendingVoucherId, setPendingVoucherId] = useState<"voucher15" | "voucher30" | null>(null)
    const [claimedVoucherId, setClaimedVoucherId] = useState<"voucher15" | "voucher30" | null>(null)
    const [freeShippingCode, setFreeShippingCode] = useState("")
    const [isFreeShippingClaimed, setIsFreeShippingClaimed] = useState(false)
    const [voucher15Code, setVoucher15Code] = useState("")
    const [voucher30Code, setVoucher30Code] = useState("")
    const [isVoucher15Claimed, setIsVoucher15Claimed] = useState(false)
    const [isVoucher30Claimed, setIsVoucher30Claimed] = useState(false)
    const [claimedRewards, setClaimedRewards] = useState<Record<string, boolean>>({})
    const [copiedCode, setCopiedCode] = useState("")
    const userKey = user?.email?.toLowerCase() || "guest"
    const storageKey = (baseKey: string) => `${baseKey}:${userKey}`
    const chooseProductReward = REWARD_OPTIONS.find((reward) => reward.id === "choose-product")
    const hasClaimedChooseProduct = Boolean(claimedRewards["choose-product"])
    const canSelectChooseProduct = hasClaimedChooseProduct || totalPoints >= (chooseProductReward?.points ?? 75)
    const effectiveSelectedRewardProduct = selectedRewardProduct
    const requestProductSelection = (productName: string) => {
        if (!canSelectChooseProduct) return
        if (hasClaimedChooseProduct) return
        if (effectiveSelectedRewardProduct === productName) return
        setPendingRewardProduct(productName)
        setIsConfirmChoiceOpen(true)
    }

    useEffect(() => {
        clearRewardPointsCacheOnce()
    }, [])

    useEffect(() => {
        try {
            const keyPrefix = `:${userKey}`
            const key = (baseKey: string) => `${baseKey}${keyPrefix}`

            const stored = localStorage.getItem(key(FREE_SHIPPING_CODE_KEY))
            const claimed = localStorage.getItem(key(FREE_SHIPPING_CLAIMED_KEY)) === "true"
            const voucher15Stored = localStorage.getItem(key(VOUCHER_15_CODE_KEY))
            const voucher15Claimed = localStorage.getItem(key(VOUCHER_15_CLAIMED_KEY)) === "true"
            const voucher30Stored = localStorage.getItem(key(VOUCHER_30_CODE_KEY))
            const voucher30Claimed = localStorage.getItem(key(VOUCHER_30_CLAIMED_KEY)) === "true"
            const selectedProduct = localStorage.getItem(key(CHOOSE_PRODUCT_SELECTED_KEY))
            const storedSpentPoints = Number(localStorage.getItem(key(SPENT_POINTS_KEY)) || "0")
            let nextSpentPoints = Number.isFinite(storedSpentPoints) ? Math.max(0, storedSpentPoints) : 0

            const storedClaimedRewards = localStorage.getItem(key(CLAIMED_REWARDS_KEY))
            let claimedMap: Record<string, boolean> = {}
            if (storedClaimedRewards) {
                const parsed = JSON.parse(storedClaimedRewards) as Record<string, boolean>
                claimedMap = parsed
            }

            if (selectedProduct) claimedMap["choose-product"] = true

            if (claimed) claimedMap.shipping = true
            if (voucher15Claimed) claimedMap.voucher15 = true
            if (voucher30Claimed) claimedMap.voucher30 = true

            const minimumSpentFromClaims = Object.entries(claimedMap).reduce((sum, [rewardId, isClaimed]) => {
                if (!isClaimed) return sum
                return sum + (REWARD_COST[rewardId] || 0)
            }, 0)

            if (nextSpentPoints < minimumSpentFromClaims) {
                nextSpentPoints = minimumSpentFromClaims
                localStorage.setItem(key(SPENT_POINTS_KEY), String(nextSpentPoints))
            }

            localStorage.setItem(key(CLAIMED_REWARDS_KEY), JSON.stringify(claimedMap))

            queueMicrotask(() => {
                setFreeShippingCode(stored && claimed ? stored : "")
                setIsFreeShippingClaimed(claimed)
                setVoucher15Code(voucher15Stored && voucher15Claimed ? voucher15Stored : "")
                setIsVoucher15Claimed(voucher15Claimed)
                setVoucher30Code(voucher30Stored && voucher30Claimed ? voucher30Stored : "")
                setIsVoucher30Claimed(voucher30Claimed)
                setSelectedRewardProduct(selectedProduct || null)
                setSpentPoints(nextSpentPoints)
                setClaimedRewards(claimedMap)
            })
        } catch {
            // ignore storage issues
        }
    }, [userKey])

    const hasClaimedReward = (rewardId: string) => Boolean(claimedRewards[rewardId])

    const persistClaimedReward = (rewardId: string) => {
        try {
            const next = { ...claimedRewards, [rewardId]: true }
            setClaimedRewards(next)
            localStorage.setItem(storageKey(CLAIMED_REWARDS_KEY), JSON.stringify(next))
        } catch {
            // ignore storage issues
        }
    }

    const spendPoints = (requiredPoints: number) => {
        if (totalPoints < requiredPoints) return false
        const nextSpentPoints = spentPoints + requiredPoints
        setSpentPoints(nextSpentPoints)
        try {
            localStorage.setItem(storageKey(SPENT_POINTS_KEY), String(nextSpentPoints))
        } catch {
            // ignore storage issues
        }
        return true
    }

    const generateFreeShippingCode = () => {
        const suffix = Math.random().toString(36).slice(2, 8).toUpperCase()
        return `SHIP-${suffix}`
    }
    const generateVoucherCode = (amount: 15 | 30) => {
        const suffix = Math.random().toString(36).slice(2, 8).toUpperCase()
        return `V${amount}-${suffix}`
    }

    const handleClaimFreeShipping = (canClaim: boolean) => {
        if (!canClaim) return
        const wasClaimed = hasClaimedReward("shipping")
        if (!wasClaimed && !spendPoints(100)) return
        setIsConfirmFreeShippingOpen(false)
        let code = freeShippingCode
        if (!code) {
            code = generateFreeShippingCode()
            setFreeShippingCode(code)
            try {
                localStorage.setItem(storageKey(FREE_SHIPPING_CODE_KEY), code)
            } catch {
                // ignore storage issues
            }
        }
        setIsFreeShippingClaimed(true)
        try {
            localStorage.setItem(storageKey(FREE_SHIPPING_CLAIMED_KEY), "true")
            if (!wasClaimed) {
                persistClaimedReward("shipping")
            }
        } catch {
            // ignore storage issues
        }
        setIsFreeShippingOpen(true)
    }

    const handleClaimVoucher = (voucherId: "voucher15" | "voucher30", canClaim: boolean) => {
        if (!canClaim) return
        const voucherCost = voucherId === "voucher30" ? 300 : 150
        const wasClaimed = hasClaimedReward(voucherId)
        if (!wasClaimed && !spendPoints(voucherCost)) return
        setIsConfirmVoucherOpen(false)
        setClaimedVoucherId(voucherId)

        if (voucherId === "voucher15") {
            let code = voucher15Code
            if (!code) {
                code = generateVoucherCode(15)
                setVoucher15Code(code)
                try {
                    localStorage.setItem(storageKey(VOUCHER_15_CODE_KEY), code)
                } catch {
                    // ignore storage issues
                }
            }
            setIsVoucher15Claimed(true)
            try {
                localStorage.setItem(storageKey(VOUCHER_15_CLAIMED_KEY), "true")
                if (!wasClaimed) {
                    persistClaimedReward("voucher15")
                }
            } catch {
                // ignore storage issues
            }
        }

        if (voucherId === "voucher30") {
            let code = voucher30Code
            if (!code) {
                code = generateVoucherCode(30)
                setVoucher30Code(code)
                try {
                    localStorage.setItem(storageKey(VOUCHER_30_CODE_KEY), code)
                } catch {
                    // ignore storage issues
                }
            }
            setIsVoucher30Claimed(true)
            try {
                localStorage.setItem(storageKey(VOUCHER_30_CLAIMED_KEY), "true")
                if (!wasClaimed) {
                    persistClaimedReward("voucher30")
                }
            } catch {
                // ignore storage issues
            }
        }

        setIsVoucherOpen(true)
    }

    const handleCopyCode = async (code: string) => {
        if (!code) return
        try {
            await navigator.clipboard.writeText(code)
            setCopiedCode(code)
            setTimeout(() => setCopiedCode(""), 1500)
        } catch {
            // ignore copy errors
        }
    }

    return (
        <div className="min-h-screen bg-background font-sans flex flex-col">
            <main className="flex-grow pt-32 pb-20">
                <div className="container mx-auto px-6 lg:px-20 max-w-5xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="font-serif text-3xl font-bold">Claim Reward</h1>
                            <p className="text-muted-foreground mt-2">Available points: <span className="font-bold text-foreground">{totalPoints}</span></p>
                        </div>
                        <Button type="button" variant="outline" onClick={() => router.push('/dashboard?tab=points')}>
                            Back to Points
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {REWARD_OPTIONS.map((reward) => {
                            const rewardClaimed = hasClaimedReward(reward.id)
                            const canClaim = rewardClaimed || totalPoints >= reward.points
                            return (
                                <div
                                    key={reward.id}
                                    className="rounded-xl border border-border p-6 bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
                                >
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Requires {reward.points} points</p>
                                    <h2 className="font-serif text-2xl font-bold mt-2">{reward.title}</h2>
                                    <p className="text-sm text-muted-foreground mt-2">{reward.description}</p>
                                    {reward.id === "sample-kit" && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="mt-5 mr-3"
                                            onClick={() => setIsMiniKitOpen(true)}
                                        >
                                            View Kit Details
                                        </Button>
                                    )}
                                    {reward.id === "choose-product" && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="mt-5 mr-3"
                                            onClick={() => setIsChooseProductOpen(true)}
                                        >
                                            View Product Choices
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        disabled={!canClaim}
                                        className={`mt-5 transition-all duration-300 hover:scale-[1.02] disabled:opacity-100 ${canClaim
                                            ? "bg-[#D4AF37] text-black hover:bg-[#c39f2f]"
                                            : "bg-black text-white hover:bg-black"
                                            }`}
                                        onClick={() => {
                                            if (reward.id === "shipping") {
                                                if (rewardClaimed) {
                                                    setIsFreeShippingOpen(true)
                                                } else if (canClaim) {
                                                    setIsConfirmFreeShippingOpen(true)
                                                }
                                            }
                                            if (reward.id === "voucher15" || reward.id === "voucher30") {
                                                if (rewardClaimed) {
                                                    setClaimedVoucherId(reward.id)
                                                    setIsVoucherOpen(true)
                                                } else if (canClaim) {
                                                    setPendingVoucherId(reward.id)
                                                    setIsConfirmVoucherOpen(true)
                                                }
                                            }
                                        }}
                                    >
                                        {rewardClaimed ? "Already claimed" : canClaim ? "Claim Reward" : "Not enough points"}
                                    </Button>
                                    {reward.id === "shipping" && isFreeShippingClaimed && freeShippingCode && (
                                        <div className="mt-4 rounded-lg border border-[#D4AF37] bg-[#D4AF37]/20 p-3">
                                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your Free Shipping Code</p>
                                            <p className="text-base font-bold text-foreground mt-1">{freeShippingCode}</p>
                                        </div>
                                    )}
                                    {reward.id === "voucher15" && isVoucher15Claimed && voucher15Code && (
                                        <div className="mt-4 rounded-lg border border-[#D4AF37] bg-[#D4AF37]/20 p-3">
                                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your $15 Voucher Code</p>
                                            <p className="text-base font-bold text-foreground mt-1">{voucher15Code}</p>
                                        </div>
                                    )}
                                    {reward.id === "voucher30" && isVoucher30Claimed && voucher30Code && (
                                        <div className="mt-4 rounded-lg border border-[#D4AF37] bg-[#D4AF37]/20 p-3">
                                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your $30 Voucher Code</p>
                                            <p className="text-base font-bold text-foreground mt-1">{voucher30Code}</p>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </main>
            <Dialog open={isMiniKitOpen} onOpenChange={setIsMiniKitOpen}>
                <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
                    <div className="p-6 border-b border-border">
                        <DialogHeader>
                            <DialogTitle className="font-serif text-2xl">Mini Sample Skincare Kit</DialogTitle>
                            <DialogDescription>
                                A curated starter set to test Noor Seoul bestsellers before buying full size.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="h-36 rounded-md border-2 border-dashed border-border/80" />
                            <div className="h-36 rounded-md border-2 border-dashed border-border/80" />
                            <div className="h-36 rounded-md border-2 border-dashed border-border/80" />
                        </div>

                        <div className="rounded-lg border border-border bg-secondary/10 p-5">
                            <p className="text-sm text-muted-foreground">
                                Kit images and product details will be added here.
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={isChooseProductOpen} onOpenChange={setIsChooseProductOpen}>
                <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
                    <div className="p-6 border-b border-border">
                        <DialogHeader>
                            <DialogTitle className="font-serif text-2xl">Choose a Product</DialogTitle>
                            <DialogDescription>
                                Customers can choose one item from these reward options.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {["Lipstick", "Blush", "Highlighter", "Eye Shadow", "Lip Gloss", "Lip Tint"].map((productName) => (
                                <div
                                    key={productName}
                                    className={`rounded-lg border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${canSelectChooseProduct ? "cursor-pointer" : "cursor-not-allowed"} ${effectiveSelectedRewardProduct === productName
                                        ? "border-[#D4AF37] shadow-md"
                                        : "border-border bg-secondary/10 hover:border-primary/30"
                                        }`}
                                    onClick={() => {
                                        requestProductSelection(productName)
                                    }}
                                >
                                    <div
                                        className={`h-36 rounded-md border-2 border-dashed transition-colors duration-300 ${effectiveSelectedRewardProduct === productName
                                            ? "border-[#D4AF37]"
                                            : "border-border/80 hover:border-primary/50"
                                            }`}
                                    />
                                    <p className="mt-3 font-semibold">{productName}</p>
                                    <Button
                                        type="button"
                                        className={`mt-3 w-full ${effectiveSelectedRewardProduct === productName
                                            ? "bg-[#D4AF37] text-black hover:bg-[#c39f2f]"
                                            : "bg-black text-white hover:bg-zinc-800"
                                            }`}
                                        disabled={!canSelectChooseProduct}
                                        onClick={() => requestProductSelection(productName)}
                                    >
                                        {canSelectChooseProduct
                                            ? (effectiveSelectedRewardProduct === productName ? "Selected" : "Select")
                                            : `Need ${chooseProductReward?.points ?? 75} points`}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={isConfirmChoiceOpen} onOpenChange={setIsConfirmChoiceOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                            {pendingRewardProduct
                                ? `Do you want to select ${pendingRewardProduct}?`
                                : "Do you want to select this product?"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-12"
                            onClick={() => {
                                setIsConfirmChoiceOpen(false)
                                setPendingRewardProduct(null)
                            }}
                        >
                            No
                        </Button>
                        <Button
                            type="button"
                            className="h-12 bg-[#D4AF37] text-black hover:bg-[#c39f2f]"
                            onClick={() => {
                                if (pendingRewardProduct) {
                                    const wasClaimed = hasClaimedReward("choose-product")
                                    if (!wasClaimed && !spendPoints(chooseProductReward?.points ?? 75)) {
                                        setIsConfirmChoiceOpen(false)
                                        setPendingRewardProduct(null)
                                        return
                                    }
                                    setSelectedRewardProduct(pendingRewardProduct)
                                    try {
                                        localStorage.setItem(storageKey(CHOOSE_PRODUCT_SELECTED_KEY), pendingRewardProduct)
                                        if (!wasClaimed) {
                                            persistClaimedReward("choose-product")
                                        }
                                    } catch {
                                        // ignore storage issues
                                    }
                                }
                                setIsConfirmChoiceOpen(false)
                                setPendingRewardProduct(null)
                            }}
                        >
                            Yes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={isConfirmFreeShippingOpen} onOpenChange={setIsConfirmFreeShippingOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Activate Free Shipping</DialogTitle>
                        <DialogDescription>
                            Do you want to activate free shipping code for 100 points?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-12"
                            onClick={() => setIsConfirmFreeShippingOpen(false)}
                        >
                            No
                        </Button>
                        <Button
                            type="button"
                            className="h-12 bg-[#D4AF37] text-black hover:bg-[#c39f2f]"
                            onClick={() => handleClaimFreeShipping(true)}
                        >
                            Yes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={isConfirmVoucherOpen} onOpenChange={setIsConfirmVoucherOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Activate Voucher</DialogTitle>
                        <DialogDescription>
                            {pendingVoucherId === "voucher30"
                                ? "Do you want to activate $30 voucher code for 300 points?"
                                : "Do you want to activate $15 voucher code for 150 points?"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-12"
                            onClick={() => {
                                setIsConfirmVoucherOpen(false)
                                setPendingVoucherId(null)
                            }}
                        >
                            No
                        </Button>
                        <Button
                            type="button"
                            className="h-12 bg-[#D4AF37] text-black hover:bg-[#c39f2f]"
                            onClick={() => {
                                if (pendingVoucherId) {
                                    handleClaimVoucher(pendingVoucherId, true)
                                }
                                setPendingVoucherId(null)
                            }}
                        >
                            Yes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={isFreeShippingOpen} onOpenChange={setIsFreeShippingOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Truck className="w-5 h-5 text-[#D4AF37]" />
                            Free Shipping Claimed
                        </DialogTitle>
                        <DialogDescription>
                            Your next order will have free shipping. Please use this code at checkout.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-lg border border-[#D4AF37] bg-[#D4AF37]/20 p-4 text-center">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">Free Shipping Code</p>
                        <div className="mt-1 flex items-center justify-center gap-2">
                            <p className="text-xl font-bold">{freeShippingCode || "Generating..."}</p>
                            <Button type="button" variant="outline" className="h-8 px-3 text-xs" onClick={() => handleCopyCode(freeShippingCode)}>
                                Copy
                            </Button>
                        </div>
                        {copiedCode === freeShippingCode && (
                            <p className="text-xs text-emerald-700 mt-1">Code copied</p>
                        )}
                    </div>
                    <Button type="button" className="w-full bg-[#D4AF37] text-black hover:bg-[#c39f2f]" onClick={() => router.push('/checkout')}>
                        Go to Checkout
                    </Button>
                </DialogContent>
            </Dialog>
            <Dialog open={isVoucherOpen} onOpenChange={setIsVoucherOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Voucher Claimed</DialogTitle>
                        <DialogDescription>
                            Your next order will get a discount. Please use this code at checkout.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-lg border border-[#D4AF37] bg-[#D4AF37]/20 p-4 text-center">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">Voucher Code</p>
                        <div className="mt-1 flex items-center justify-center gap-2">
                            <p className="text-xl font-bold">
                                {claimedVoucherId === "voucher30" ? (voucher30Code || "Generating...") : (voucher15Code || "Generating...")}
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-8 px-3 text-xs"
                                onClick={() => handleCopyCode(claimedVoucherId === "voucher30" ? voucher30Code : voucher15Code)}
                            >
                                Copy
                            </Button>
                        </div>
                        {copiedCode && (copiedCode === voucher15Code || copiedCode === voucher30Code) && (
                            <p className="text-xs text-emerald-700 mt-1">Code copied</p>
                        )}
                    </div>
                    <Button type="button" className="w-full bg-[#D4AF37] text-black hover:bg-[#c39f2f]" onClick={() => router.push('/checkout')}>
                        Go to Checkout
                    </Button>
                </DialogContent>
            </Dialog>
            <Footer />
        </div>
    )
}
