"use client"

import React, { useState, useEffect } from "react"
import { Link, usePathname } from "@/i18n/routing"
import { Search, User, ShoppingBag, Menu, X, Gem } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslations } from 'next-intl';
import { useCart } from "@/context/CartContext"
import { CartSidebar } from "@/components/cart/CartSidebar"
import { useUser } from "@/context/UserContext"

export function Header() {
    const t = useTranslations('Navigation');
    const tCommon = useTranslations('Common');
    const pathname = usePathname();
    const { totalItems, setIsOpen } = useCart()
    const { isAuthenticated } = useUser()
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
                    <Link
                        href={isAuthenticated ? "/dashboard" : "/login"}
                        className="hover:text-primary transition-colors"
                        title={isAuthenticated ? "Dashboard" : "Sign In / Register"}
                    >
                        <User className="w-6 h-6" />
                    </Link>
                    <button
                        className="relative hover:text-primary transition-colors"
                        onClick={() => setIsOpen(true)}
                    >
                        <ShoppingBag className="w-6 h-6" />
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 bg-primary text-[10px] text-white font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                {totalItems}
                            </span>
                        )}
                    </button>

                    {/* Language Switcher */}
                    <div className="hidden md:flex items-center gap-2 text-sm font-semibold">
                        <Link href="/" locale="en" className="hover:text-primary transition-colors">EN</Link>
                        <span className="text-muted-foreground/50">|</span>
                        <Link href="/" locale="ar" className="hover:text-primary transition-colors">AR</Link>
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
                    <Link href="/best-sellers" onClick={() => setIsMobileMenuOpen(false)}>{t('bestSellers')}</Link>
                </div>
            )}
            <CartSidebar />
        </header>
    )
}
