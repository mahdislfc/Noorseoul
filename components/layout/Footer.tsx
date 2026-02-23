import { Link } from "@/i18n/routing"
import { Gem } from "lucide-react"
import { useTranslations } from "next-intl"

export function Footer() {
    const t = useTranslations("Footer")

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
                            {t("brandLine")}
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-primary">{t("discover")}</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="/gift-sets" className="hover:text-primary transition-colors">{t("giftSets")}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-primary">{t("theHouse")}</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="/our-story" className="hover:text-primary transition-colors">{t("ourStory")}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-primary">{t("support")}</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="/shipping-returns" className="hover:text-primary transition-colors">{t("shippingReturns")}</Link></li>
                            <li><Link href="/request-product" className="hover:text-primary transition-colors">{t("requestProduct")}</Link></li>
                            <li><Link href="/faq" className="hover:text-primary transition-colors">{t("faq")}</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">{t("contactUs")}</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-secondary/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    <p>© 2026 {t("rights")}</p>
                    <div className="flex gap-6">
                        <Link href="/privacy-policy" className="hover:text-primary">{t("privacyPolicy")}</Link>
                        <Link href="/terms-of-service" className="hover:text-primary">{t("termsOfService")}</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
