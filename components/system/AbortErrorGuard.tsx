"use client"

import { useEffect } from "react"

function isKnownAbortSignalError(value: unknown) {
    if (value instanceof DOMException && value.name === "AbortError") {
        return true
    }

    if (
        typeof value === "object" &&
        value &&
        "name" in value &&
        String((value as { name?: unknown }).name || "").toLowerCase() === "aborterror"
    ) {
        return true
    }

    const message =
        value instanceof Error
            ? value.message
            : typeof value === "object" && value && "message" in value
                ? String((value as { message?: unknown }).message || "")
                : typeof value === "string"
                    ? value
                    : ""

    const normalized = message.toLowerCase()
    return (
        normalized.includes("signal is aborted without reason") ||
        normalized.includes("signal is aborted")
    )
}

export function AbortErrorGuard() {
    useEffect(() => {
        const onUnhandledRejection = (event: PromiseRejectionEvent) => {
            if (isKnownAbortSignalError(event.reason)) {
                event.preventDefault()
            }
        }

        const onError = (event: ErrorEvent) => {
            if (isKnownAbortSignalError(event.error) || isKnownAbortSignalError(event.message)) {
                event.preventDefault()
            }
        }

        window.addEventListener("unhandledrejection", onUnhandledRejection)
        window.addEventListener("error", onError)

        return () => {
            window.removeEventListener("unhandledrejection", onUnhandledRejection)
            window.removeEventListener("error", onError)
        }
    }, [])

    return null
}
