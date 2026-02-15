"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/context/UserContext"
import { useCart } from "@/context/CartContext"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/layout/Footer"
import { Package, User as UserIcon, Bell, LogOut, RefreshCw, Star, ReceiptText } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading, logout, updateProfile, orders } = useUser()
    const { addToCart } = useCart()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

    // Form states
    const [address, setAddress] = useState(user?.address || "")
    const [phone, setPhone] = useState(user?.phone || "")
    const totalPoints = Math.floor(orders.reduce((sum, order) => sum + order.total, 0))
    const pointsToNextReward = Math.max(0, 500 - (totalPoints % 500))
    const tab = searchParams.get("tab")
    const activeTab: 'overview' | 'orders' | 'profile' | 'points' =
        tab === "overview" || tab === "orders" || tab === "profile" || tab === "points"
            ? tab
            : "overview"
    const queryOrderId = activeTab === "orders" ? searchParams.get("order") : null
    const effectiveSelectedOrderId = selectedOrderId ?? queryOrderId
    const selectedOrder = effectiveSelectedOrderId ? orders.find((order) => order.id === effectiveSelectedOrderId) ?? null : null

    const switchTab = (nextTab: 'overview' | 'orders' | 'profile' | 'points') => {
        router.push(`${pathname}?tab=${nextTab}`)
    }

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/register')
        }
    }, [isLoading, isAuthenticated, router])

    if (isLoading) {
        return null
    }

    if (!isAuthenticated) {
        return null
    }

    const handleReorder = (orderId: string) => {
        const order = orders.find(o => o.id === orderId)
        if (order) {
            order.items.forEach(item => {
                addToCart({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    quantity: item.quantity
                })
            })
            toast.success("Order items added to your bag!")
            document.dispatchEvent(new CustomEvent('open-cart'))
        }
    }

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault()
        updateProfile({ address, phone })
        toast.success("Profile updated successfully")
    }

    return (
        <div className="min-h-screen bg-background font-sans flex flex-col">
            <main className="flex-grow pt-32 pb-20">
                <div className="container mx-auto px-6 lg:px-20 max-w-6xl">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <h1 className="font-serif text-4xl font-bold mb-2">Hello, {user?.name.split(' ')[0]}</h1>
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-primary" />
                                {user?.membershipTier}
                            </div>
                        </div>
                        <Button variant="outline" onClick={logout} className="gap-2">
                            <LogOut className="w-4 h-4" />
                            Log Out
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar Navigation */}
                        <div className="lg:col-span-1 space-y-2">
                            <button
                                onClick={() => switchTab('overview')}
                                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-left", activeTab === 'overview' ? "bg-primary text-primary-foreground" : "hover:bg-secondary/50")}
                            >
                                <Package className="w-4 h-4" /> Overview
                            </button>
                            <button
                                onClick={() => switchTab('orders')}
                                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-left", activeTab === 'orders' ? "bg-primary text-primary-foreground" : "hover:bg-secondary/50")}
                            >
                                <ReceiptText className="w-4 h-4" /> Order History
                            </button>
                            <button
                                onClick={() => switchTab('profile')}
                                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-left", activeTab === 'profile' ? "bg-primary text-primary-foreground" : "hover:bg-secondary/50")}
                            >
                                <UserIcon className="w-4 h-4" /> My Profile
                            </button>
                            <button
                                onClick={() => switchTab('points')}
                                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-left", activeTab === 'points' ? "bg-primary text-primary-foreground" : "hover:bg-secondary/50")}
                            >
                                <Star className="w-4 h-4" /> Points
                            </button>
                            <div className="pt-4 mt-4 border-t border-border">
                                <div className="flex items-center justify-between px-4 py-3">
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Bell className="w-4 h-4" />
                                        <span className="text-sm">Notifications</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setNotificationsEnabled(!notificationsEnabled)
                                            toast.success(notificationsEnabled ? "Notifications disabled" : "Notifications enabled")
                                        }}
                                        className={cn("w-10 h-6 rounded-full p-1 transition-colors duration-300", notificationsEnabled ? "bg-primary" : "bg-gray-300")}
                                    >
                                        <div className={cn("w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300", notificationsEnabled ? "translate-x-4" : "translate-x-0")} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">

                            {/* OVERVIEW TAB */}
                            {activeTab === 'overview' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                    <h2 className="font-serif text-2xl font-bold mb-6">Orders & Points</h2>
                                    <div className="bg-surface border border-border rounded-xl overflow-hidden">
                                        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-border text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                            <p className="col-span-8">Order</p>
                                            <p className="col-span-4 text-right">Points Received</p>
                                        </div>
                                        {orders.map((order) => (
                                            <button
                                                key={order.id}
                                                type="button"
                                                onClick={() => router.push(`${pathname}?tab=orders&order=${encodeURIComponent(order.id)}`)}
                                                className="group w-full grid grid-cols-12 gap-4 px-5 py-4 border-b border-border last:border-0 text-left cursor-pointer transition-all duration-200 hover:bg-secondary/30 hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                            >
                                                <div className="col-span-8">
                                                    <p className="font-semibold group-hover:text-foreground">
                                                        {order.total.toFixed(2)} AED
                                                        <span className="text-muted-foreground font-normal"> • {order.date}</span>
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {order.items.length > 0
                                                            ? `${order.items[0].name}${order.items.length > 1 ? ` +${order.items.length - 1}` : ""}`
                                                            : "No items"}
                                                    </p>
                                                </div>
                                                <p className="col-span-4 text-right font-bold text-pink-500 group-hover:text-pink-600">
                                                    +{Math.floor(order.total)}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ORDERS TAB */}
                            {activeTab === 'orders' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                    <h2 className="font-serif text-2xl font-bold mb-6">Recent Orders</h2>
                                    {orders.map(order => (
                                        <div
                                            id={`order-card-${order.id}`}
                                            key={order.id}
                                            className="group bg-surface border border-border rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/20 transition-all duration-200 cursor-pointer"
                                            onClick={() => setSelectedOrderId(order.id)}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter" || event.key === " ") {
                                                    event.preventDefault()
                                                    setSelectedOrderId(order.id)
                                                }
                                            }}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-border pb-4">
                                                <div>
                                                    <p className="text-sm font-bold opacity-50 uppercase tracking-wider">Order #{order.id}</p>
                                                    <p className="text-sm text-muted-foreground">{order.date}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs font-semibold uppercase tracking-wider text-primary/70 opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
                                                        View details
                                                    </span>
                                                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                                        order.status === 'Delivered' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                                    )}>
                                                        {order.status}
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        onClick={(event) => {
                                                            event.stopPropagation()
                                                            handleReorder(order.id)
                                                        }}
                                                        className="gap-2"
                                                    >
                                                        <RefreshCw className="w-3 h-3" /> Reorder
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                {order.items.map(item => (
                                                    <div key={item.id} className="flex items-center gap-4">
                                                        <div className="w-12 h-16 bg-secondary/20 rounded overflow-hidden flex-shrink-0">
                                                            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${item.image}')` }} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-sm">{item.name}</p>
                                                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                                        </div>
                                                        <p className="font-bold text-sm">{item.price.toFixed(2)} AED</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
                                        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
                                            {selectedOrder && (
                                                <>
                                                    <DialogHeader className="p-6 border-b border-border">
                                                        <DialogTitle className="font-serif text-2xl">Order #{selectedOrder.id}</DialogTitle>
                                                        <DialogDescription className="text-sm">
                                                            {selectedOrder.date}
                                                        </DialogDescription>
                                                        <div className="pt-2">
                                                            <span className={cn(
                                                                "inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                                                selectedOrder.status === 'Delivered' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                                            )}>
                                                                {selectedOrder.status}
                                                            </span>
                                                        </div>
                                                    </DialogHeader>

                                                    <div className="p-6 space-y-4 max-h-[55vh] overflow-y-auto">
                                                        {selectedOrder.items.map((item) => (
                                                            <div key={item.id} className="flex items-center gap-4">
                                                                <div className="w-14 h-18 bg-secondary/20 rounded overflow-hidden flex-shrink-0">
                                                                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${item.image}')` }} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="font-semibold">{item.name}</p>
                                                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                                </div>
                                                                <p className="font-bold text-sm">{item.price.toFixed(2)} AED</p>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="p-6 border-t border-border flex items-center justify-between gap-4">
                                                        <div>
                                                            <p className="text-xs uppercase tracking-widest text-muted-foreground">Total</p>
                                                            <p className="text-xl font-bold">{selectedOrder.total.toFixed(2)} AED</p>
                                                        </div>
                                                        <Button onClick={() => handleReorder(selectedOrder.id)} className="gap-2">
                                                            <RefreshCw className="w-4 h-4" />
                                                            Reorder
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            )}

                            {/* PROFILE TAB */}
                            {activeTab === 'profile' && (
                                <div className="bg-surface border border-border rounded-xl p-8 shadow-sm animate-in fade-in slide-in-from-right-4">
                                    <h2 className="font-serif text-2xl font-bold mb-6">Edit Profile</h2>
                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest opacity-70">Full Name</label>
                                                <input disabled value={user?.name} className="w-full h-12 rounded-lg border border-border bg-secondary/10 px-4 text-muted-foreground cursor-not-allowed" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest opacity-70">Email Address</label>
                                                <input disabled value={user?.email} className="w-full h-12 rounded-lg border border-border bg-secondary/10 px-4 text-muted-foreground cursor-not-allowed" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest">Phone Number</label>
                                                <input
                                                    value={phone}
                                                    onChange={e => setPhone(e.target.value)}
                                                    className="w-full h-12 rounded-lg border border-border bg-transparent px-4 focus:ring-1 focus:ring-primary outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest">Default City</label>
                                                <input disabled value={user?.city} className="w-full h-12 rounded-lg border border-border bg-secondary/10 px-4 text-muted-foreground cursor-not-allowed" />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest">Shipping Address</label>
                                                <textarea
                                                    value={address}
                                                    onChange={e => setAddress(e.target.value)}
                                                    className="w-full h-32 rounded-lg border border-border bg-transparent p-4 focus:ring-1 focus:ring-primary outline-none resize-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <Button type="submit" size="lg">Save Changes</Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* POINTS TAB */}
                            {activeTab === 'points' && (
                                <div className="bg-surface border border-border rounded-xl p-8 shadow-sm animate-in fade-in slide-in-from-right-4">
                                    <h2 className="font-serif text-2xl font-bold mb-6">Your Points</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="rounded-xl border border-border p-6 bg-secondary/10">
                                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Available Points</p>
                                            <p className="text-4xl font-bold">{totalPoints}</p>
                                        </div>
                                        <div className="rounded-xl border border-border p-6 bg-secondary/10">
                                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Next Reward In</p>
                                            <p className="text-4xl font-bold">{pointsToNextReward}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-6">
                                        You currently earn points based on completed orders.
                                    </p>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
