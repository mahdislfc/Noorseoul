"use client"

import { useState } from "react"
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/layout/Footer"
import { CheckCircle } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

export default function RegisterPage() {
    const t = useTranslations('Register');
    const [isLoading, setIsLoading] = useState(false)
    const [pendingVerificationEmail, setPendingVerificationEmail] = useState("")

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [phone, setPhone] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        if (!email.trim() || !password || !firstName.trim() || !lastName.trim() || !phone.trim()) {
            toast.error("Please fill in all required fields.")
            setIsLoading(false)
            return
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters.")
            setIsLoading(false)
            return
        }

        const supabase = createClient()
        const normalizedEmail = email.trim()
        const { data, error } = await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
                data: {
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                    phone: phone.trim(),
                }
            }
        })

        if (error) {
            toast.error(error.message)
            setIsLoading(false)
        } else {
            if (data.session) {
                toast.success("Registration successful. You are signed in.")
                setPendingVerificationEmail("")
            } else {
                setPendingVerificationEmail(normalizedEmail)
                toast.success("Registration successful! Please check your email for verification.")
            }
            setIsLoading(false)
            // Optional: redirect to a confirmation page or login
        }
    }

    const handleResendVerification = async () => {
        if (!pendingVerificationEmail) return
        setIsLoading(true)
        const supabase = createClient()
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: pendingVerificationEmail,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (error) {
            toast.error(error.message)
        } else {
            toast.success("Verification email sent again.")
        }
        setIsLoading(false)
    }


    const handleGoogleLogin = async () => {
        setIsLoading(true)
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

    return (
        <div className="min-h-screen bg-background font-sans flex flex-col">
            <main className="flex-grow pt-32 pb-20">
                <div className="container mx-auto px-6 lg:px-20 max-w-4xl">
                    <div className="text-center mb-12">
                        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">{t('title')}</h1>
                        <p className="text-muted-foreground text-lg">{t('subtitle')}</p>
                        <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold">
                            <CheckCircle className="w-4 h-4" />
                            <span>10% OFF Your First Order</span>
                        </div>
                    </div>

                    <div className="bg-surface border border-border rounded-2xl p-8 md:p-12 shadow-sm">
                        <Button
                            variant="outline"
                            className="w-full h-14 mb-8 gap-2 text-lg font-normal"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                        >
                            <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                            Sign up with Google
                        </Button>

                        <div className="relative mb-8">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-surface px-2 text-muted-foreground">Or register with email</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Personal Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest">{t('firstName')}</label>
                                    <input
                                        required
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full h-12 rounded-lg border border-border bg-transparent px-4 outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest">{t('lastName')}</label>
                                    <input
                                        required
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full h-12 rounded-lg border border-border bg-transparent px-4 outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest">{t('email')}</label>
                                    <input
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-12 rounded-lg border border-border bg-transparent px-4 outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest">{t('phone')}</label>
                                    <input
                                        required
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full h-12 rounded-lg border border-border bg-transparent px-4 outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-widest">{t('password')}</label>
                                    <input
                                        required
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-12 rounded-lg border border-border bg-transparent px-4 outline-none focus:border-primary"
                                    />
                                </div>
                            </div>



                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="opt-in" className="w-5 h-5 accent-primary" defaultChecked />
                                <label htmlFor="opt-in" className="text-sm">{t('optIn')}</label>
                            </div>

                            <Button type="submit" size="lg" className="w-full h-14 text-lg" disabled={isLoading}>
                                {isLoading ? "Creating Profile..." : t('submit')}
                            </Button>

                            {pendingVerificationEmail && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    className="w-full h-12"
                                    onClick={handleResendVerification}
                                    disabled={isLoading}
                                >
                                    Resend verification email
                                </Button>
                            )}
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
