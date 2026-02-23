"use client"

import { createContext, useContext, useState } from "react"
import { DISPLAY_CURRENCY_STORAGE_KEY, type DisplayCurrency } from "@/lib/display-currency"

interface DisplayCurrencyContextType {
    currency: DisplayCurrency
    setCurrency: (currency: DisplayCurrency) => void
    allowedCurrencies: DisplayCurrency[]
}

const DisplayCurrencyContext = createContext<DisplayCurrencyContextType | undefined>(undefined)

export function DisplayCurrencyProvider({
    children,
    locale
}: {
    children: React.ReactNode
    locale: string
}) {
    const isFa = locale === "fa"
    const allowedCurrencies: DisplayCurrency[] = ["USD", "AED", "T"]
    const defaultCurrency: DisplayCurrency = isFa ? "T" : "USD"
    const [currency, setCurrencyState] = useState<DisplayCurrency>(() => {
        if (typeof window === "undefined") return defaultCurrency
        const stored = localStorage.getItem(DISPLAY_CURRENCY_STORAGE_KEY) as DisplayCurrency | null
        if (stored && allowedCurrencies.includes(stored)) return stored
        return defaultCurrency
    })

    const setCurrency = (nextCurrency: DisplayCurrency) => {
        if (!allowedCurrencies.includes(nextCurrency)) return
        setCurrencyState(nextCurrency)
        localStorage.setItem(DISPLAY_CURRENCY_STORAGE_KEY, nextCurrency)
    }

    return (
        <DisplayCurrencyContext.Provider value={{ currency, setCurrency, allowedCurrencies }}>
            {children}
        </DisplayCurrencyContext.Provider>
    )
}

export function useDisplayCurrency() {
    const context = useContext(DisplayCurrencyContext)
    if (!context) {
        throw new Error("useDisplayCurrency must be used within DisplayCurrencyProvider")
    }
    return context
}
