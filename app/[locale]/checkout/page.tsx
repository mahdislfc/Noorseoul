"use client"


import { useState } from "react"
import { Footer } from "@/components/layout/Footer"
import { CheckoutForm } from "@/components/checkout/CheckoutForm"
import { useTranslations } from 'next-intl';
import { useCart } from "@/context/CartContext"
import { ChevronRight, CreditCard, Lock, ShieldCheck, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { useLocale } from 'next-intl';

export default function CheckoutPage() {
    const t = useTranslations('Checkout');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const { items, totalPrice } = useCart()
    const [activeStep, setActiveStep] = useState(1)

    const shippingCost = 0 // Complimentary
    const vat = totalPrice * 0.05
    const finalTotal = totalPrice + shippingCost + vat

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
                                                <input type="email" placeholder="email@example.com" className="h-12 w-full rounded-lg border border-border bg-transparent px-4 focus:ring-1 focus:ring-primary outline-none" />
                                            </div>
                                            <Button className="h-12 mt-auto" onClick={() => setActiveStep(2)}>Continue to Shipping</Button>
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
                                                <input type="text" className="h-12 rounded-lg border border-border bg-transparent px-4 outline-none" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-bold uppercase tracking-widest">Last Name</label>
                                                <input type="text" className="h-12 rounded-lg border border-border bg-transparent px-4 outline-none" />
                                            </div>
                                            <div className="flex flex-col gap-2 md:col-span-2">
                                                <label className="text-xs font-bold uppercase tracking-widest">City</label>
                                                <select className="h-12 rounded-lg border border-border bg-transparent px-4 outline-none bg-background">
                                                    <option>Seoul</option>
                                                    <option>Busan</option>
                                                    <option>Incheon</option>
                                                </select>
                                            </div>
                                            <Button className="md:col-span-2 h-12" onClick={() => setActiveStep(3)}>Continue to Payment</Button>
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
                                                <p className="text-sm font-bold text-primary mt-1">{(item.price * item.quantity).toFixed(2)} AED</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="flex flex-col gap-3 py-6 border-y border-border/30 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-bold">{totalPrice.toFixed(2)} AED</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">White-Glove Delivery</span>
                                    <span className="text-primary font-bold uppercase tracking-tighter">Complimentary</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">VAT (5%)</span>
                                    <span className="font-bold">{vat.toFixed(2)} AED</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center py-2">
                                <span className="text-lg font-bold">Total</span>
                                <span className="text-2xl font-black text-primary">{finalTotal.toFixed(2)} AED</span>
                            </div>

                            <Button className="w-full py-6 text-sm">Complete Purchase</Button>

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
