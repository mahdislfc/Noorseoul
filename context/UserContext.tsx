"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import type { Session } from "@supabase/supabase-js"
import { useRouter } from "@/i18n/routing"

export interface User {
    name: string
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    building: string
    city: string
    postcode: string
    membershipTier: string
    profileImage?: string
}

export interface Order {
    id: string
    date: string
    status: "Processing" | "Shipped" | "Delivered"
    total: number
    items: {
        id: string
        name: string
        price: number
        quantity: number
        image: string
    }[]
}

interface UserContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    orders: Order[]
    login: (userData: User) => void
    logout: () => void
    updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>
}

interface ProfileRow {
    firstName?: string | null
    lastName?: string | null
    phone?: string | null
    address?: string | null
    building?: string | null
    city?: string | null
    postcode?: string | null
    membershipTier?: string | null
}

interface IncomingOrder {
    id?: string
    date?: string
    status?: "Processing" | "Shipped" | "Delivered"
    total?: number
    items?: {
        id: string
        name: string
        price: number
        quantity: number
        image: string
    }[]
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)


    useEffect(() => {
        const supabase = createClient()
        let isMounted = true
        const REMEMBER_AUTH_KEY = "ns_auth_remember"
        const ALLOW_SESSION_ONCE_KEY = "ns_auth_session_once"

        const shouldAllowCurrentBrowserSession = () => {
            try {
                const rememberAuth = localStorage.getItem(REMEMBER_AUTH_KEY) === "1"
                const allowSessionOnce = sessionStorage.getItem(ALLOW_SESSION_ONCE_KEY) === "1"
                const isResetPasswordRoute =
                    /^\/(en|ar)\/reset-password(?:\/|$)/.test(window.location.pathname) ||
                    /^\/reset-password(?:\/|$)/.test(window.location.pathname)

                return rememberAuth || allowSessionOnce || isResetPasswordRoute
            } catch {
                return false
            }
        }

        const fetchProfile = async () => {
            try {
                const response = await fetch("/api/profile", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                })

                if (!response.ok) {
                    return null
                }

                const result = await response.json()
                return (result?.profile ?? null) as ProfileRow | null
            } catch (err) {
                console.error("Error fetching profile:", err)
                return null
            }
        }

        const fetchOrders = async () => {
            try {
                const response = await fetch("/api/orders", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                })

                if (!response.ok) {
                    return []
                }

                const result = await response.json()
                const incoming = Array.isArray(result?.orders) ? result.orders : []
                return incoming.map((order: IncomingOrder) => ({
                    ...order,
                    date: order?.date
                        ? new Date(order.date).toLocaleDateString()
                        : "",
                })) as Order[]
            } catch (err) {
                console.error("Error fetching orders:", err)
                return []
            }
        }

        const buildUser = (session: Session, profile?: ProfileRow | null): User => {
            const firstName = profile?.firstName || session.user.user_metadata.first_name || ""
            const lastName = profile?.lastName || session.user.user_metadata.last_name || ""
            const email = session.user.email || ""

            return {
                firstName,
                lastName,
                name: (firstName && lastName) ? `${firstName} ${lastName}` : (email || "Member"),
                email,
                phone: profile?.phone || session.user.user_metadata.phone || "",
                address: profile?.address || "",
                building: profile?.building || "",
                city: profile?.city || "",
                postcode: profile?.postcode || "",
                membershipTier: profile?.membershipTier || "Member",
                profileImage: "https://github.com/shadcn.png"
            }
        }

        const loadingFallbackTimer = setTimeout(() => {
            if (isMounted) setIsLoading(false)
        }, 3000)

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            try {
                console.log("Auth state change event:", event)
                if (!isMounted) return

                if (session?.user) {
                    if (!shouldAllowCurrentBrowserSession()) {
                        await supabase.auth.signOut({ scope: "local" })
                        setUser(null)
                        setOrders([])
                        return
                    }

                    console.log("Session/User identified:", session.user.email)
                    const initialUser = buildUser(session)
                    setUser(initialUser)

                    const [profile, userOrders] = await Promise.all([
                        fetchProfile(),
                        fetchOrders()
                    ])
                    if (!isMounted) return

                    const fullUser = buildUser(session, profile)
                    setUser(fullUser)
                    setOrders(userOrders)
                } else {
                    console.log("No session - user logged out")
                    setUser(null)
                    setOrders([])
                }
            } catch (error: unknown) {
                if (!(error instanceof DOMException && error.name === "AbortError")) {
                    console.error("Error in onAuthStateChange handler:", error)
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                    clearTimeout(loadingFallbackTimer)
                }
            }
        })

        return () => {
            isMounted = false
            clearTimeout(loadingFallbackTimer)
            subscription.unsubscribe()
        }
    }, [])


    const login = (userData: User) => {
        // Legacy support - now handled by Supabase Auth
        setUser(userData)
    }

    const router = useRouter()

    const logout = async () => {
        const supabase = createClient()
        setIsLoading(true)
        try {
            localStorage.removeItem("ns_auth_remember")
            sessionStorage.removeItem("ns_auth_session_once")
        } catch { /* ignore */ }

        // Optimistic UI update: clear user state first
        setUser(null)
        try {
            localStorage.removeItem("cart")
        } catch { /* ignore */ }

        // Start background cleanup
        const performCleanup = async () => {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort("Logout cleanup timeout"), 2000)

            try {
                // Fire and forget server-side signout
                fetch('/auth/signout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal
                }).catch(() => { })

                // Clear client-side session
                await supabase.auth.signOut({ scope: "local" })
            } catch (err: unknown) {
                if (!(err instanceof DOMException && err.name === "AbortError")) {
                    console.warn("Background logout cleanup error:", err)
                }
            } finally {
                clearTimeout(timeoutId)
            }
        }

        // Fire background cleanup but don't await it to avoid blocking the redirect
        performCleanup()

        // Give the state a tiny bit of time to settle then redirect
        setTimeout(() => {
            setIsLoading(false)
            router.replace('/login')
        }, 100)
    }

    const updateProfile = async (data: Partial<User>) => {
        if (!user) return { success: false, error: "No user authenticated" }

        try {
            const payload: ProfileRow = {
                firstName: data.firstName ?? user.firstName,
                lastName: data.lastName ?? user.lastName,
                phone: data.phone ?? user.phone,
                address: data.address ?? user.address,
                building: data.building ?? user.building,
                city: data.city ?? user.city,
                postcode: data.postcode ?? user.postcode
            }
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort("Profile update timed out"), 30000)

            let response: Response
            try {
                response = await fetch('/api/profile', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                })
            } finally {
                clearTimeout(timeoutId)
            }

            if (!response.ok) {
                const result = await response.json().catch(() => ({ error: "Failed to update profile" }))
                throw new Error(result.error || "Failed to update profile")
            }

            // Update local state
            const updatedUser = { ...user, ...data }
            // Re-calculate derived full name if needed
            if (data.firstName || data.lastName) {
                const fn = data.firstName ?? user.firstName
                const ln = data.lastName ?? user.lastName
                updatedUser.name = `${fn} ${ln}`
            }
            setUser(updatedUser)

            return { success: true }
        } catch (error) {
            console.error("Error updating profile:", error)
            const message = error instanceof Error ? error.message : "Failed to update profile"
            return { success: false, error: message }
        }
    }

    return (
        <UserContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, updateProfile, orders }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider")
    }
    return context
}
