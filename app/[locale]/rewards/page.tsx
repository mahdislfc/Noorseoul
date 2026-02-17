"use client"

import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { useUser } from "@/context/UserContext"
import { useRouter } from "@/i18n/routing"

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

export default function RewardsPage() {
    const { orders } = useUser()
    const router = useRouter()
    const totalPoints = orders.reduce((sum, order) => sum + pointsFromOrderTotal(order.total), 0)

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
                            const canClaim = totalPoints >= reward.points
                            return (
                                <div
                                    key={reward.id}
                                    className="rounded-xl border border-border p-6 bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
                                >
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Requires {reward.points} points</p>
                                    <h2 className="font-serif text-2xl font-bold mt-2">{reward.title}</h2>
                                    <p className="text-sm text-muted-foreground mt-2">{reward.description}</p>
                                    <Button type="button" className="mt-5 transition-all duration-300 hover:scale-[1.02]" disabled={!canClaim}>
                                        {canClaim ? "Claim" : "Not enough points"}
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
