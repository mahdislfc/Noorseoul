"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/layout/Footer"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { useRouter } from "@/i18n/routing"

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSessionReady, setIsSessionReady] = useState(false)
    const [hasRecoverySession, setHasRecoverySession] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const supabase = createClient()

        const bootstrap = async () => {
            try {
                const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""))
                const searchParams = new URLSearchParams(window.location.search)
                const accessToken = hashParams.get("access_token")
                const refreshToken = hashParams.get("refresh_token")
                const code = searchParams.get("code")

                if (accessToken && refreshToken) {
                    const { error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    })
                    if (!error) {
                        window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
                    }
                } else if (code) {
                    await supabase.auth.exchangeCodeForSession(code)
                }

                const {
                    data: { session },
                } = await supabase.auth.getSession()
                setHasRecoverySession(Boolean(session?.user))
            } catch {
                setHasRecoverySession(false)
            } finally {
                setIsSessionReady(true)
            }
        }

        void bootstrap()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters.")
            return
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.")
            return
        }

        setIsLoading(true)
        try {
            const supabase = createClient()

            if (!isSessionReady || !hasRecoverySession) {
                toast.error("Recovery session expired. Please request a new reset email.")
                router.push("/login")
                return
            }

            let { error } = await supabase.auth.updateUser({ password })

            if (error?.message?.toLowerCase().includes("signal is aborted")) {
                await new Promise((resolve) => setTimeout(resolve, 300))
                const retry = await supabase.auth.updateUser({ password })
                error = retry.error
            }

            if (error) {
                toast.error(error.message)
                return
            }

            toast.success("Password updated. You can sign in now.")
            router.push("/login")
            router.refresh()
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to update password."
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background font-sans flex flex-col">
            <main className="flex-grow pt-32 pb-20">
                <div className="container mx-auto px-6 lg:px-20 max-w-md">
                    <div className="text-center mb-12">
                        <h1 className="font-serif text-4xl font-bold mb-4">Reset Password</h1>
                        <p className="text-muted-foreground">Set a new password for your account.</p>
                    </div>

                    <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest">New Password</label>
                                <input
                                    required
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-12 rounded-lg border border-border bg-transparent px-4 outline-none focus:border-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest">Confirm New Password</label>
                                <input
                                    required
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full h-12 rounded-lg border border-border bg-transparent px-4 outline-none focus:border-primary"
                                />
                            </div>

                            <Button type="submit" size="lg" className="w-full h-12" disabled={isLoading || !isSessionReady}>
                                {isLoading ? "Updating..." : "Update Password"}
                            </Button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
