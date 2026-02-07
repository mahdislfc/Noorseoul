import { Link } from "@/i18n/routing"
import { Gem } from "lucide-react"

export function Footer() {
    return (
        <footer className="bg-secondary/10 border-t border-secondary/20 pt-20 pb-10 px-6 lg:px-20 mt-auto">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 lg:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <Gem className="w-6 h-6 text-primary" />
                            <span className="text-xl font-bold tracking-tight font-serif">Noor Seoul</span>
                        </div>
                        <p className="text-muted-foreground font-light leading-relaxed mb-6">
                            Experience the best of Seoul’s luxury beauty in the Middle East.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-primary">Discover</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="/skincare-tips" className="hover:text-primary transition-colors">Skincare Miracles</Link></li>
                            <li><Link href="/makeup-tips" className="hover:text-primary transition-colors">Makeup Trends</Link></li>
                            <li><Link href="/gift-sets" className="hover:text-primary transition-colors">Gift Sets</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-primary">The House</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="/our-story" className="hover:text-primary transition-colors">Our Story</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-primary">Support</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="/shipping-returns" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
                            <li><Link href="/order-tracking" className="hover:text-primary transition-colors">Order Tracking</Link></li>
                            <li><Link href="/request-product" className="hover:text-primary transition-colors">Request a Product</Link></li>
                            <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-secondary/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    <p>© 2026 Noor Seoul . All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy-policy" className="hover:text-primary">Privacy Policy</Link>
                        <Link href="/terms-of-service" className="hover:text-primary">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
