"use client"

import { useState } from "react"
import { useUser } from "@/context/UserContext"
import { useCart } from "@/context/CartContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/layout/Footer"
import { Package, User as UserIcon, MapPin, Bell, LogOut, RefreshCw, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
    const { user, isAuthenticated, logout, updateProfile, orders } = useUser()
    const { addToCart } = useCart()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'profile'>('overview')
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)

    // Form states
    const [address, setAddress] = useState(user?.address || "")
    const [phone, setPhone] = useState(user?.phone || "")

    if (!isAuthenticated) {
        // Simple protection
        if (typeof window !== 'undefined') router.push('/register')
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
                                onClick={() => setActiveTab('overview')}
                                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-left", activeTab === 'overview' ? "bg-primary text-primary-foreground" : "hover:bg-secondary/50")}
                            >
                                <Package className="w-4 h-4" /> Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-left", activeTab === 'orders' ? "bg-primary text-primary-foreground" : "hover:bg-secondary/50")}
                            >
                                <RefreshCw className="w-4 h-4" /> Order History
                            </button>
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-left", activeTab === 'profile' ? "bg-primary text-primary-foreground" : "hover:bg-secondary/50")}
                            >
                                <UserIcon className="w-4 h-4" /> My Profile
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

                            {/* OVERVIEW / ORDERS TAB */}
                            {(activeTab === 'overview' || activeTab === 'orders') && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                    <h2 className="font-serif text-2xl font-bold mb-6">Recent Orders</h2>
                                    {orders.map(order => (
                                        <div key={order.id} className="bg-surface border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-border pb-4">
                                                <div>
                                                    <p className="text-sm font-bold opacity-50 uppercase tracking-wider">Order #{order.id}</p>
                                                    <p className="text-sm text-muted-foreground">{order.date}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                                        order.status === 'Delivered' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                                    )}>
                                                        {order.status}
                                                    </span>
                                                    <Button size="sm" onClick={() => handleReorder(order.id)} className="gap-2">
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

                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
