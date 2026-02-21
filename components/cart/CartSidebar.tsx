"use client"

import { useCart } from "@/context/CartContext"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area" // Assuming ScrollArea is available or will default to div overflow
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { useTranslations } from 'next-intl';
import { Link } from "@/i18n/routing"
import Image from "next/image"

export function CartSidebar() {
    const { items, removeFromCart, addToCart, totalPrice, totalItems, isOpen, setIsOpen } = useCart()
    const t = useTranslations('Cart');
    const currencies = Array.from(new Set(items.map((item) => (item.currency || "AED").toUpperCase())))
    const cartCurrency = currencies.length === 1 ? currencies[0] : "AED"

    // Handle quantity updates by adding/removing single items
    const updateQuantity = (id: string, currentQuantity: number, change: number) => {
        const item = items.find(i => i.id === id)
        if (!item) return

        if (change > 0) {
            addToCart({ ...item, quantity: 1 })
        } else if (change < 0 && currentQuantity > 1) {
            // Logic for decreasing quantity would need a more specific update function in Context, 
            // but for now we can rely on how addToCart merges. 
            // Wait, standard addToCart adds. We need a way to decrease.
            // Let's implement a decrement or direct update in Context later.
            // For MVP: Remove and re-add adjusted quantity? No, that's messy.
            // Let's assume we'll update Context next.
            addToCart({ ...item, quantity: -1 }) // Context needs to handle negative add or separate update
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
                <SheetHeader className="px-6 py-4 border-b">
                    <SheetTitle className="flex items-center gap-2 font-serif text-2xl">
                        <ShoppingBag className="w-5 h-5" />
                        {t('title')} <span className="text-base font-sans text-muted-foreground font-normal">({totalItems} {t('items')})</span>
                    </SheetTitle>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                        <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-lg">{t('empty')}</p>
                        <SheetClose asChild>
                            <Button variant="link" className="mt-4">{t('continueShopping')}</Button>
                        </SheetClose>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 p-6 h-full">
                            <ul className="space-y-6">
                                {items.map((item) => (
                                    <li key={item.id} className="flex gap-4">
                                        <div className="relative w-20 h-24 bg-secondary/20 rounded-md overflow-hidden flex-shrink-0">
                                            {/* Fallback image logic similar to ProductCard */}
                                            <div
                                                className="w-full h-full bg-cover bg-center"
                                                style={{ backgroundImage: `url('${item.image.startsWith('http') || item.image.startsWith('/') ? item.image : '/placeholder.jpg'}')` }}
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-serif font-medium line-clamp-2">{item.name}</h4>
                                                <p className="text-sm text-muted-foreground">{item.price.toFixed(2)} {item.currency || cartCurrency}</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center border rounded-md">
                                                    <button
                                                        onClick={() => addToCart({ ...item, quantity: -1 })}
                                                        className="p-1 hover:bg-secondary/50 transition-colors disabled:opacity-50"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                    <button
                                                        onClick={() => addToCart({ ...item, quantity: 1 })}
                                                        className="p-1 hover:bg-secondary/50 transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-muted-foreground hover:text-destructive transition-colors text-xs flex items-center gap-1"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    {t('remove')}
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </ScrollArea>
                        <SheetFooter className="p-6 border-t bg-accent/5 flex-col gap-4 sm:space-x-0">
                            <div className="space-y-2">
                                <div className="flex justify-between text-base font-medium">
                                    <span>{t('subtotal')}</span>
                                    <span>{totalPrice.toFixed(2)} {cartCurrency}</span>
                                </div>
                                <p className="text-xs text-muted-foreground text-center">Shipping & taxes calculated at checkout</p>
                            </div>
                            <div className="grid gap-3">
                                <SheetClose asChild>
                                    <Link href="/checkout">
                                        <Button className="w-full" size="lg">
                                            {t('checkout')}
                                        </Button>
                                    </Link>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Button variant="outline" className="w-full">
                                        {t('continueShopping')}
                                    </Button>
                                </SheetClose>
                            </div>
                        </SheetFooter>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}
