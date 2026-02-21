"use client"

import { useEffect } from "react"

export default function LocaleError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        const message = (error?.message || "").toLowerCase()
        if (message.includes("signal is aborted without reason") || message.includes("signal is aborted")) {
            reset()
        }
    }, [error, reset])

    const message = (error?.message || "").toLowerCase()
    if (message.includes("signal is aborted without reason") || message.includes("signal is aborted")) {
        return null
    }

    return (
        <div className="min-h-[40vh] flex items-center justify-center px-6 text-center">
            <div>
                <h2 className="text-2xl font-semibold">Something went wrong</h2>
                <p className="mt-2 text-muted-foreground">Please try again.</p>
                <button
                    type="button"
                    onClick={reset}
                    className="mt-4 inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium hover:bg-secondary/40"
                >
                    Retry
                </button>
            </div>
        </div>
    )
}
