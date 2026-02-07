
"use client"

import { useState } from "react"
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/layout/Footer"
import { useUser } from "@/context/UserContext"
import { Link, useRouter } from "@/i18n/routing"

export default function LoginPage() {
    const t = useTranslations('Navigation'); // Using Navigation for now as placeholder or we can use a new namespace
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { login } = useUser()
    const router = useRouter()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Mock login
        setTimeout(() => {
            login({
                name: "Noor Beauty",
                email: email,
                phone: "+971 50 123 4567",
                address: "Downtown Dubai",
                city: "Dubai",
                membershipTier: "Gold Member",
                profileImage: "https://github.com/shadcn.png"
            })
            setIsLoading(false)
            router.push('/dashboard')
        }, 1000)
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
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest">Email</label>
                                <input
                                    required
                                    type="email"
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-12 rounded-lg border border-border bg-transparent px-4 outline-none focus:border-primary"
                                />
                            </div>

                            <Button type="submit" size="lg" className="w-full h-12" disabled={isLoading}>
                                {isLoading ? "Signing In..." : "Sign In"}
                            </Button>
                        </form>

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
