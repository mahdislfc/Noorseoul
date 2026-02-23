export type DisplayCurrency = "USD" | "AED" | "T"

export const DISPLAY_CURRENCY_STORAGE_KEY = "display_currency"

const USD_TO_AED = 3.67
const USD_TO_TOMAN = 160000

function normalizeCurrency(value?: string | null): DisplayCurrency | "UNKNOWN" {
    const normalized = String(value || "USD").trim().toUpperCase()
    if (normalized === "USD") return "USD"
    if (normalized === "AED") return "AED"
    if (normalized === "T" || normalized === "TOMAN") return "T"
    return "UNKNOWN"
}

function toUsd(amount: number, fromCurrency?: string | null) {
    const from = normalizeCurrency(fromCurrency)
    if (from === "AED") return amount / USD_TO_AED
    if (from === "T") return amount / USD_TO_TOMAN
    return amount
}

function fromUsd(amountUsd: number, toCurrency: DisplayCurrency) {
    if (toCurrency === "AED") return amountUsd * USD_TO_AED
    if (toCurrency === "T") return amountUsd * USD_TO_TOMAN
    return amountUsd
}

export function convertAmount(amount: number, fromCurrency: string | undefined, toCurrency: DisplayCurrency) {
    const amountUsd = toUsd(amount, fromCurrency)
    return fromUsd(amountUsd, toCurrency)
}

export function formatDisplayAmount(
    amount: number,
    fromCurrency: string | undefined,
    toCurrency: DisplayCurrency,
    locale: string
) {
    const converted = convertAmount(amount, fromCurrency, toCurrency)
    const formatterLocale = locale === "ar" ? "ar-AE" : locale === "fa" ? "fa-IR" : "en-US"

    if (toCurrency === "T") {
        const value = new Intl.NumberFormat(formatterLocale, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(converted)
        return `${value} T`
    }

    return new Intl.NumberFormat(formatterLocale, {
        style: "currency",
        currency: toCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(converted)
}

