
"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/layout/Footer"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { Link, useRouter } from "@/i18n/routing"

export default function LoginPage() {
    const REMEMBER_AUTH_KEY = "ns_auth_remember"
    const ALLOW_SESSION_ONCE_KEY = "ns_auth_session_once"
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [rememberMe, setRememberMe] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isEmailActionLoading, setIsEmailActionLoading] = useState(false)
    const router = useRouter()
    const params = useParams()
    const locale = params.locale as string
    const hasRedirectedRef = useRef(false)

    useEffect(() => {
        const supabase = createClient()
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event) => {
            if (event === "SIGNED_IN" && !hasRedirectedRef.current) {
                hasRedirectedRef.current = true
                router.replace('/')
            }
        })

        return () => subscription.unsubscribe()
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const supabase = createClient()
            const normalizedEmail = email.trim().toLowerCase()
            setError(null)

            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: normalizedEmail,
                password,
            })

            if (signInError) {
                console.error("Sign-in error:", signInError)
                toast.error(signInError.message)
                setError(signInError.message)
                setIsLoading(false)
                return
            }

            if (!data.session) {
                toast.error("Sign-in was not completed. Please verify your email or try again.")
                setIsLoading(false)
                return
            }

            try {
                if (rememberMe) {
                    localStorage.setItem(REMEMBER_AUTH_KEY, "1")
                    sessionStorage.removeItem(ALLOW_SESSION_ONCE_KEY)
                } else {
                    localStorage.removeItem(REMEMBER_AUTH_KEY)
                    sessionStorage.setItem(ALLOW_SESSION_ONCE_KEY, "1")
                }
            } catch {
                // Ignore storage errors; auth will still proceed for current request cycle.
            }

            toast.success("Welcome back!")
            hasRedirectedRef.current = true
            router.replace('/')
            // Fallback in case client routing is blocked by stale state.
            setTimeout(() => {
                window.location.assign(`/${locale}/`)
            }, 350)
        } catch (err) {
            console.error("Unexpected sign-in error:", err)
            setError("Something went wrong while signing in. Please try again.")
            toast.error("Something went wrong while signing in. Please try again.")
            setIsLoading(false)
        }
    }


    const handleGoogleLogin = async () => {
        setIsLoading(true)
        try {
            if (rememberMe) {
                localStorage.setItem(REMEMBER_AUTH_KEY, "1")
                sessionStorage.removeItem(ALLOW_SESSION_ONCE_KEY)
            } else {
                localStorage.removeItem(REMEMBER_AUTH_KEY)
                sessionStorage.setItem(ALLOW_SESSION_ONCE_KEY, "1")
            }
        } catch {
            // Ignore storage errors; OAuth redirect can still continue.
        }

        const supabase = createClient()
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (error) {
            toast.error(error.message)
            setIsLoading(false)
        }
    }

    const handleResendVerification = async () => {
        const normalizedEmail = email.trim().toLowerCase()
        if (!normalizedEmail) {
            toast.error("Enter your email first.")
            return
        }

        setIsEmailActionLoading(true)
        const supabase = createClient()
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: normalizedEmail,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (error) {
            toast.error(error.message)
        } else {
            toast.success("Verification email sent.")
        }
        setIsEmailActionLoading(false)
    }

    const handleForgotPassword = async () => {
        const normalizedEmail = email.trim().toLowerCase()
        if (!normalizedEmail) {
            toast.error("Enter your email first.")
            return
        }

        setIsEmailActionLoading(true)
        const supabase = createClient()
        const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
            redirectTo: `${window.location.origin}/auth/callback?next=/${locale}/reset-password`,
        })

        if (error) {
            toast.error(error.message)
        } else {
            toast.success("Password reset email sent.")
        }
        setIsEmailActionLoading(false)
    }

    return (
        <div className="min-h-screen bg-background font-sans flex flex-col">
            <main className="flex-grow pt-32 pb-20">
                <div className="container mx-auto px-6 lg:px-20 max-w-md">
                    <div className="text-center mb-12">
                        <h1 className="font-serif text-4xl font-bold mb-4">Welcome Back</h1>
                        <p className="text-muted-foreground">Sign in to access your membership benefits.</p>
                    </div>

                    <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm">
                        <Button
                            variant="outline"
                            className="w-full h-12 mb-6 gap-2 text-base font-normal"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                            Sign in with Google
                        </Button>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-surface px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest">Email</label>
                                <input
                                    required
                                    type="email"
                                    name="ns_login_email"
                                    autoComplete="off"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-12 rounded-lg border border-border bg-transparent px-4 outline-none focus:border-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest">Password</label>
                                <input
                                    required
                                    type="password"
                                    name="ns_login_password"
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-12 rounded-lg border border-border bg-transparent px-4 outline-none focus:border-primary"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 accent-primary"
                                />
                                <label htmlFor="remember-me" className="text-sm text-muted-foreground">
                                    Remember me on this device
                                </label>
                            </div>

                            <Button type="submit" size="lg" className="w-full h-12" disabled={isLoading}>
                                {isLoading ? "Signing In..." : "Sign In"}
                            </Button>
                        </form>

                        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                disabled={isEmailActionLoading || isLoading}
                                className="text-primary font-semibold hover:underline disabled:opacity-60"
                            >
                                Forgot password?
                            </button>
                            <button
                                type="button"
                                onClick={handleResendVerification}
                                disabled={isEmailActionLoading || isLoading}
                                className="text-primary font-semibold hover:underline disabled:opacity-60 text-right"
                            >
                                {isEmailActionLoading ? "Sending..." : "Resend verification email"}
                            </button>
                        </div>

                        <div className="mt-6 text-center text-sm">
                            <p className="text-muted-foreground">
                                Not a member yet?{" "}
                                <Link href="/register" className="text-primary font-bold hover:underline">
                                    Become a Member
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
