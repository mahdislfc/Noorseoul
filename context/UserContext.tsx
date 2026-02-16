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
    city: string
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
    city?: string | null
    membershipTier?: string | null
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Mock Orders (keep for now until we have real orders)
    const mockOrders: Order[] = [
        {
            id: "ORD-2024-8832",
            date: "Feb 15, 2026",
            status: "Processing",
            total: 220.00,
            items: [
                { id: "101", name: "Golden Glow Serum", price: 125.00, quantity: 1, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3R2ud4Nj_1LxdIJtcOd1aJsWtwdJns-JV0Msc2_NpPmzaeAY_c24WYNL4JkLAqsLyUq_k8bWyVQNR2gz7P2bYVuqNZMJ63ba6mj9ImRnyc73_84c4gOtNu4zDFKQbflTYgfmzTvaeOtXbNEyrSzGzLkPFBjzXHHCyqxrz3OhqWGr02xH7fj0WYZa5RbnMhSzbb1dUi6ZeabGBWHYDstT5jwh72crpAyXxpygr45CEidkYHcvuewgbmpedoDGFmNsmNzP_byhmONj2" },
                { id: "102", name: "Desert Rose Night Cream", price: 95.00, quantity: 1, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAqGUIo14DcvxBQFtGlrY3dyFH2lmS4pRAcLXVRg6azH5Zbj2qzMgVr1iduzHltOasg3hu4E0VFNBy4d__kWiIwhvUr7jkOAq0F8dofJ9BnqfG-gmYgLryi52A32Os3EAphnyE6dxGe0HBzqjIGGi4-uLWYkLGWfXjB9FpMydTkiBlUBO6-QvQp0zur8Lg0WmXRyDAwqHgfARD6TRi030fRMkv_fKYsvbXs1qfqRT9Wdk67M2IC78B028qgb72NFArKExozNH87j-zK" }
            ]
        },
        {
            id: "ORD-2023-1029",
            date: "Dec 10, 2025",
            status: "Delivered",
            total: 148.00,
            items: [
                { id: "103", name: "Saffron Infused Elixir", price: 148.00, quantity: 1, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCs58z3qMdhg5XkQdC30LCflMoZAhqSPkCeZcjpBtM0HsSJjaz38I2Xd5HiJQoQiP_OCgwFdDqK2uK9kEvDpcY-9zs9lCClwWAAZB8TmXlRbsLd4sBRNdKyw9eKGg_MHONSrhvWUsH0vmxuufaKGns08qe3doYS3oYKhLrlNjH5EknBx38RPhZhIitgqIgiR21GVRFOLK0v9QsZqDWLR3UAdC8btulF94s_4KIMy1TCDqTUjpnjBUib1Ivmhix7ek7bNDOH48RZiiuu" }
            ]
        }
    ]
    const orders = user ? mockOrders : []


    useEffect(() => {
        const supabase = createClient()
        let isMounted = true

        const fetchProfile = async (userId: string) => {
            try {
                const { data: profile } = await supabase
                    .from('Profile')
                    .select('*')
                    .eq('id', userId)
                    .maybeSingle()
                return profile as ProfileRow
            } catch (err) {
                console.error("Error fetching profile:", err)
                return null
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
                city: profile?.city || "",
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
                    console.log("Session/User identified:", session.user.email)
                    const initialUser = buildUser(session)
                    setUser(initialUser)

                    const profile = await fetchProfile(session.user.id)
                    if (!isMounted) return

                    const fullUser = buildUser(session, profile)
                    setUser(fullUser)
                } else {
                    console.log("No session - user logged out")
                    setUser(null)
                }
            } catch (error: any) {
                if (error?.name !== 'AbortError') {
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
            } catch (err: any) {
                if (err.name !== 'AbortError') {
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
            router.refresh()
        }, 100)
    }

    const updateProfile = async (data: Partial<User>) => {
        if (!user) return { success: false, error: "No user authenticated" }

        try {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            if (!session?.user) return { success: false, error: "Session expired" }

            const updates: ProfileRow = {
                firstName: data.firstName ?? user.firstName,
                lastName: data.lastName ?? user.lastName,
                phone: data.phone ?? user.phone,
                address: data.address ?? user.address,
                city: data.city ?? user.city,
            }

            const { error } = await supabase
                .from('Profile')
                .update(updates)
                .eq('id', session.user.id)

            if (error) throw error

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
        } catch (error: any) {
            console.error("Error updating profile:", error)
            return { success: false, error: error.message }
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
