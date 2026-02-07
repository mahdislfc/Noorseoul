"use client"

import { useState } from "react"
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ShieldCheck, CheckCircle } from "lucide-react"

export default function RegisterPage() {
    const t = useTranslations('Register');
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        // Mock registration logic
        setTimeout(() => {
            setIsLoading(false)
            alert("Welcome to Noor Seoul! Your member profile is ready.")
            window.location.href = '/'
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-background font-sans flex flex-col">
            <main className="flex-grow pt-32 pb-20">
                <div className="container mx-auto px-6 lg:px-20 max-w-4xl">
                    <div className="text-center mb-12">
                        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">{t('title')}</h1>
                        <p className="text-muted-foreground text-lg">{t('subtitle')}</p>
                        <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold">
                            <CheckCircle className="w-4 h-4" />
                            <span>10% OFF Your First Order</span>
                        </div>
                    </div>

                    <div className="bg-surface border border-border rounded-2xl p-8 md:p-12 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Personal Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest">{t('firstName')}</label>
                                    <input required type="text" className="w-full h-12 rounded-lg border border-border bg-transparent px-4 outline-none focus:border-primary" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest">{t('lastName')}</label>
                                    <input required type="text" className="w-full h-12 rounded-lg border border-border bg-transparent px-4 outline-none focus:border-primary" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest">{t('email')}</label>
                                    <input required type="email" className="w-full h-12 rounded-lg border border-border bg-transparent px-4 outline-none focus:border-primary" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest">{t('phone')}</label>
                                    <input required type="tel" className="w-full h-12 rounded-lg border border-border bg-transparent px-4 outline-none focus:border-primary" />
                                </div>
                            </div>

                            {/* Address */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest">{t('shippingAddress')}</label>
                                    <input required type="text" className="w-full h-12 rounded-lg border border-border bg-transparent px-4 outline-none focus:border-primary" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest">{t('city')}</label>
                                    <select className="w-full h-12 rounded-lg border border-border bg-transparent px-4 outline-none focus:border-primary">
                                        <option>Seoul</option>
                                        <option>Dubai</option>
                                        <option>Riyadh</option>
                                        <option>Abu Dhabi</option>
                                    </select>
                                </div>
                            </div>

                            {/* Payment Profile Mock */}
                            <div className="border-t border-border pt-8">
                                <h3 className="font-serif text-xl font-bold mb-6 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-primary" />
                                    {t('paymentInfo')}
                                </h3>
                                <div className="bg-secondary/10 p-6 rounded-xl border border-secondary/20">
                                    <p className="text-sm text-muted-foreground mb-4">{t('memberBenefit')}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75 pointer-events-none">
                                        {/* Visual only for mock */}
                                        <input type="text" placeholder={t('cardNumber')} className="w-full h-12 rounded-lg border border-border bg-background px-4" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="text" placeholder={t('expiry')} className="w-full h-12 rounded-lg border border-border bg-background px-4" />
                                            <input type="text" placeholder={t('cvc')} className="w-full h-12 rounded-lg border border-border bg-background px-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="opt-in" className="w-5 h-5 accent-primary" defaultChecked />
                                <label htmlFor="opt-in" className="text-sm">{t('optIn')}</label>
                            </div>

                            <Button type="submit" size="lg" className="w-full h-14 text-lg" disabled={isLoading}>
                                {isLoading ? "Creating Profile..." : t('submit')}
                            </Button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
