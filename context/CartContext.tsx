"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from "react"
import { useUser } from "@/context/UserContext"

export interface CartItem {
    id: string
    productId?: string
    name: string
    price: number
    quantity: number
    image: string
    currency: string
    shade?: string
}

interface CartContextType {
    items: CartItem[]
    addToCart: (item: CartItem) => void
    removeFromCart: (id: string) => void
    clearCart: () => void
    totalItems: number
    totalPrice: number
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useUser()
    const [items, setItems] = useState<CartItem[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const hasHydratedRef = useRef(false)

    // Hydrate cart from localStorage after mount to avoid SSR/client mismatch.
    useEffect(() => {
        try {
            const saved = localStorage.getItem("cart")
            if (saved) {
                const parsedItems = JSON.parse(saved) as CartItem[]
                const normalizedItems = parsedItems.map((item) => ({
                    ...item,
                    currency: (item.currency || "AED").toUpperCase(),
                }))
                queueMicrotask(() => {
                    setItems(normalizedItems)
                    hasHydratedRef.current = true
                })
                return
            }
        } catch (error) {
            console.error("Failed to parse cart from localStorage:", error)
        }
        hasHydratedRef.current = true
    }, [])

    // Persist to local storage
    useEffect(() => {
        if (!hasHydratedRef.current) return
        try {
            localStorage.setItem("cart", JSON.stringify(items))
        } catch (error) {
            console.error("Failed to save cart to localStorage:", error)
        }
    }, [items])

    // Cart is only available for authenticated users.
    // When signed out, clear persisted cart data.
    useEffect(() => {
        if (isLoading || isAuthenticated) return

        try {
            localStorage.removeItem("cart")
        } catch (error) {
            console.error("Failed to clear cart from localStorage:", error)
        }
    }, [isAuthenticated, isLoading])

    const addToCart = (newItem: CartItem) => {
        if (!isAuthenticated) return
        const normalizedCurrency = (newItem.currency || "AED").toUpperCase()
        setItems((prev) => {
            const existing = prev.find((item) => item.id === newItem.id)
            if (existing) {
                return prev.map((item) => {
                    if (item.id === newItem.id) {
                        const newQuantity = item.quantity + newItem.quantity;
                        return {
                            ...item,
                            quantity: newQuantity > 0 ? newQuantity : 1,
                            currency: normalizedCurrency,
                        }; // Prevent going below 1
                    }
                    return item;
                })
            }
            return [...prev, { ...newItem, currency: normalizedCurrency }]
        })
        // setIsOpen(true) // Removed auto-open as per user request for silent add
    }

    const removeFromCart = (id: string) => {
        if (!isAuthenticated) return
        setItems((prev) => prev.filter((item) => item.id !== id))
    }

    const clearCart = () => {
        setItems([])
    }

    const visibleItems = isAuthenticated ? items : []
    const totalItems = visibleItems.reduce((acc, item) => acc + item.quantity, 0)
    const totalPrice = visibleItems.reduce((acc, item) => acc + item.price * item.quantity, 0)

    return (
        <CartContext.Provider
            value={{
                items: visibleItems,
                addToCart,
                removeFromCart,
                clearCart,
                totalItems,
                totalPrice,
                isOpen,
                setIsOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}
