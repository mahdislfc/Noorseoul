"use client"

import React, { useState, useEffect, useRef } from "react"
import { Link, usePathname } from "@/i18n/routing"
import { Search, User, ShoppingBag, Menu, X, Gem, Package, Star, LogOut, LogIn, UserPlus, ChevronRight, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslations } from 'next-intl';
import { useCart } from "@/context/CartContext"
import { CartSidebar } from "@/components/cart/CartSidebar"
import { useUser } from "@/context/UserContext"
import { useDisplayCurrency } from "@/context/DisplayCurrencyContext"
import type { DisplayCurrency } from "@/lib/display-currency"
import {
    calculateAvailablePoints,
    calculateEarnedPoints,
    clearRewardPointsCacheOnce,
    readStoredSpentPoints
} from "@/lib/reward-points"

export function Header() {
    const t = useTranslations('Navigation');
    const tCommon = useTranslations('Common');
    const pathname = usePathname();
    const { currency, setCurrency, allowedCurrencies } = useDisplayCurrency()
    const { totalItems, setIsOpen, clearCart } = useCart()
    const { isAuthenticated, isLoading, logout, user, orders } = useUser()
    const visibleCartCount = isAuthenticated ? totalItems : 0
    const earnedPoints = calculateEarnedPoints(orders)
    const pointsBalance = calculateAvailablePoints(
        earnedPoints,
        isAuthenticated ? readStoredSpentPoints(user?.email, { reconcile: false }) : 0
    )
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
    const profileMenuRef = useRef<HTMLDivElement | null>(null)
    const formatCurrencyOptionLabel = (option: DisplayCurrency) => {
        if (option === "USD") return "$ USD"
        if (option === "AED") return "د.إ AED"
        return "T Toman"
    }

    useEffect(() => {
        clearRewardPointsCacheOnce()
    }, [])

    useEffect(() => {
        let ticking = false
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setIsScrolled(window.scrollY > 10)
                    ticking = false
                })
                ticking = true
            }
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!profileMenuRef.current) return
            if (!profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false)
            }
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsProfileMenuOpen(false)
        }

        document.addEventListener("mousedown", handleClickOutside)
        document.addEventListener("keydown", handleEscape)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.removeEventListener("keydown", handleEscape)
        }
    }, [])

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
                isScrolled
                    ? "bg-background/95 backdrop-blur-md border-border/50 shadow-sm py-4"
                    : "bg-background/60 backdrop-blur-md py-6"
            )}
        >
            <div className="container mx-auto px-6 lg:px-20 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2 z-50">
                    <Link href="/" className="flex items-center gap-2">
                        <Gem className="w-8 h-8 text-primary" />
                        <span className="text-2xl font-bold tracking-tight font-serif">Noor Seoul</span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-semibold uppercase tracking-wider">
                    <Link
                        href="/best-sellers"
                        className={cn(
                            "hover:text-primary transition-colors hover:underline underline-offset-4 decoration-2",
                            pathname === '/best-sellers' ? "text-primary underline" : ""
                        )}
                    >
                        {t('bestSellers')}
                    </Link>
                    <Link
                        href="/makeup"
                        className={cn(
                            "hover:text-primary transition-colors hover:underline underline-offset-4 decoration-2",
                            pathname === '/makeup' ? "text-primary underline" : ""
                        )}
                    >
                        {t('makeup')}
                    </Link>
                    <Link
                        href="/skincare"
                        className={cn(
                            "hover:text-primary transition-colors hover:underline underline-offset-4 decoration-2",
                            pathname === '/skincare' ? "text-primary underline" : ""
                        )}
                    >
                        {t('skincare')}
                    </Link>
                    <Link
                        href="/new-arrivals"
                        className={cn(
                            "hover:text-primary transition-colors hover:underline underline-offset-4 decoration-2",
                            pathname === '/new-arrivals' ? "text-primary underline" : ""
                        )}
                    >
                        {t('newArrivals')}
                    </Link>
                    <Link
                        href="/coming-soon"
                        className={cn(
                            "hover:text-primary transition-colors hover:underline underline-offset-4 decoration-2",
                            pathname === '/coming-soon' ? "text-primary underline" : ""
                        )}
                    >
                        {t('comingSoon')}
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-6 z-50">
                    <div className="hidden lg:flex items-center bg-secondary/20 rounded-full px-4 py-1.5 border border-secondary/30">
                        <Search className="text-primary/70 w-5 h-5" />
                        <input
                            type="text"
                            placeholder={tCommon('searchPlaceholder')}
                            className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm w-48 placeholder:text-muted-foreground ms-2"
                        />
                    </div>
                    <div className="relative" ref={profileMenuRef}>
                        <button
                            type="button"
                            className="hover:text-primary transition-colors"
                            title={isAuthenticated ? tCommon('account') : tCommon('signInOrRegister')}
                            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                            aria-haspopup="menu"
                            aria-expanded={isProfileMenuOpen}
                        >
                            <User className="w-6 h-6" />
                        </button>

                        {isProfileMenuOpen && (
                            <div
                                className={cn(
                                    "absolute right-0 mt-4 max-w-[calc(100vw-1rem)] rounded-2xl border border-white/60 bg-background/90 backdrop-blur-xl shadow-[0_20px_55px_rgba(15,23,42,0.2)] p-3 z-[80] pointer-events-auto animate-in fade-in zoom-in-95 duration-200",
                                    isAuthenticated ? "w-72" : "w-56"
                                )}
                                onMouseDown={(event) => event.stopPropagation()}
                            >
                                <div className="absolute -top-2 right-7 h-4 w-4 rotate-45 border-l border-t border-white/60 bg-background/90" />
                                {isAuthenticated ? (
                                    <>
                                        <div className="mb-2 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/20 p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold uppercase">
                                                    {user?.name?.charAt(0) || "M"}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold truncate">{user?.name || tCommon('account')}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            href="/dashboard?tab=profile"
                                            className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm hover:bg-secondary/40 transition-colors"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                        >
                                            <span className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-primary/80" />
                                                {tCommon('myProfile')}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                        </Link>
                                        <Link
                                            href="/dashboard?tab=orders"
                                            className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm hover:bg-secondary/40 transition-colors"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Package className="w-4 h-4 text-primary/80" />
                                                {tCommon('orders')}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                        </Link>
                                        <Link
                                            href="/dashboard?tab=points"
                                            className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm hover:bg-secondary/40 transition-colors"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Star className="w-4 h-4 text-primary/80" />
                                                <span className="text-pink-500 font-semibold">{pointsBalance}</span>
                                                <span>{tCommon('points')}</span>
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                        </Link>
                                        <div className="my-2 h-px bg-border" />
                                        <button
                                            type="button"
                                            className="w-full rounded-xl px-3 py-2.5 text-sm hover:bg-secondary/40 transition-colors cursor-pointer"
                                            onClick={() => {
                                                setIsProfileMenuOpen(false)
                                                clearCart()
                                                void logout()
                                            }}
                                        >
                                            <span className="flex items-center gap-2 text-red-600">
                                                <LogOut className="w-4 h-4" />
                                                {tCommon('logout')}
                                            </span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm hover:bg-secondary/40 transition-colors"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                        >
                                            <span className="flex items-center gap-2">
                                                <LogIn className="w-4 h-4 text-primary/80" />
                                                {tCommon('signIn')}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm hover:bg-secondary/40 transition-colors"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                        >
                                            <span className="flex items-center gap-2">
                                                <UserPlus className="w-4 h-4 text-primary/80" />
                                                {tCommon('register')}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    {!isLoading && isAuthenticated && (
                        <button
                            className="relative hover:text-primary transition-colors"
                            onClick={() => setIsOpen(true)}
                        >
                            <ShoppingBag className="w-6 h-6" />
                            {visibleCartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-[10px] text-white font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {visibleCartCount}
                                </span>
                            )}
                        </button>
                    )}

                    {/* Language Switcher */}
                    <div className="hidden md:flex items-center gap-2 text-sm font-semibold">
                        <div className="flex items-center gap-2 h-9 rounded-full border border-border/80 bg-secondary/20 px-3">
                            <Wallet className="w-4 h-4 text-primary/80" />
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Currency</span>
                            <select
                                value={currency}
                                onChange={(event) => setCurrency(event.target.value as DisplayCurrency)}
                                className="h-7 rounded-md bg-transparent px-1 text-xs font-semibold outline-none"
                                aria-label="Select currency"
                            >
                                {allowedCurrencies.map((option) => (
                                    <option key={option} value={option}>
                                        {formatCurrencyOptionLabel(option)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <span className="text-muted-foreground/50">|</span>
                        <Link href="/" locale="en" className="hover:text-primary transition-colors">EN</Link>
                        <span className="text-muted-foreground/50">|</span>
                        <Link href="/" locale="ar" className="hover:text-primary transition-colors">AR</Link>
                        <span className="text-muted-foreground/50">|</span>
                        <Link href="/" locale="fa" className="hover:text-primary transition-colors">FA</Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="absolute top-0 left-0 w-full h-screen bg-background flex flex-col items-center justify-center gap-8 text-2xl z-40 md:hidden">
                    <Link href="/makeup" onClick={() => setIsMobileMenuOpen(false)}>{t('makeup')}</Link>
                    <Link href="/skincare" onClick={() => setIsMobileMenuOpen(false)}>{t('skincare')}</Link>
                    <Link href="/new-arrivals" onClick={() => setIsMobileMenuOpen(false)}>{t('newArrivals')}</Link>
                    <Link href="/coming-soon" onClick={() => setIsMobileMenuOpen(false)}>{t('comingSoon')}</Link>
                    <Link href="/best-sellers" onClick={() => setIsMobileMenuOpen(false)}>{t('bestSellers')}</Link>
                    <div className="flex items-center gap-4 text-base font-semibold pt-2">
                        <div className="flex items-center gap-2 h-10 rounded-full border border-border/80 bg-secondary/20 px-3">
                            <Wallet className="w-4 h-4 text-primary/80" />
                            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Currency</span>
                            <select
                                value={currency}
                                onChange={(event) => setCurrency(event.target.value as DisplayCurrency)}
                                className="h-8 rounded-md bg-transparent px-1 text-sm outline-none"
                                aria-label="Select currency"
                            >
                                {allowedCurrencies.map((option) => (
                                    <option key={option} value={option}>
                                        {formatCurrencyOptionLabel(option)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Link href="/" locale="en" onClick={() => setIsMobileMenuOpen(false)}>EN</Link>
                        <span className="text-muted-foreground/50">|</span>
                        <Link href="/" locale="ar" onClick={() => setIsMobileMenuOpen(false)}>AR</Link>
                        <span className="text-muted-foreground/50">|</span>
                        <Link href="/" locale="fa" onClick={() => setIsMobileMenuOpen(false)}>FA</Link>
                    </div>
                </div>
            )}
            <CartSidebar />
        </header>
    )
}
