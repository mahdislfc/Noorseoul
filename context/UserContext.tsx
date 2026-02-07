"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export interface User {
    name: string
    email: string
    phone: string
    address: string
    city: string
    membershipTier: "Gold Member" | "Platinum Member" | "Skincare Enthusiast"
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
    orders: Order[]
    login: (userData: User) => void
    logout: () => void
    updateProfile: (data: Partial<User>) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)

    // Mock Orders
    const orders: Order[] = [
        {
            id: "ORD-2024-8832",
            date: "Feb 15, 2026",
            status: "Processing",
            total: 220.00,
            items: [
                { id: "101", name: "Golden Glow Serum", price: 125.00, quantity: 1, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3R2ud4Nj_1LxdIJtcOd1aJsWtwdJns-JV0Msc2_NpPmzaeAY_c24WYNL4JkLAqsLyUq_k8bWyVQNR2gz7P2bYVuqNZMJ63ba6mj9ImRnyc73_84c4gOtNu4zDFKQbflTYgfmzTvaeOtXbNEyrSzGzLkPFBjzXHHCyqxrz3OhqWGr02xH7fj0WYZa5RbnMhSzbb1dUi6ZeabGBWHYDstT5jwh72crpAyXxpygr45CEidkYHcvuewgbmpedoDGFmNsmNzP_byhmONj2" },
                { id: "102", name: "Desert Rose Night Cream", price: 95.00, quantity: 1, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAqGUIo14DcvxBQFtGlrY3dyFH2lmS4pRAcLXVRg6azH5Zbj2qzMgVr1iduzHltOasg3hu4E0VFNBy4d__kWiIwhwUr7jkOAq0F8dofJ9BnqfG-gmYgLryi52A32Os3EAphnyE6dxGe0HBzqjIGGi4-uLWYkLGWfXjB9FpMydTkiBlUBO6-QvQp0zur8Lg0WmXRyDAwqHgfARD6TRi030fRMkv_fKYsvbXs1qfqRT9Wdk67M2IC78B028qgb72NFArKExozNH87j-zK" }
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

    useEffect(() => {
        const storedUser = localStorage.getItem('noor_user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
    }, [])

    const login = (userData: User) => {
        setUser(userData)
        localStorage.setItem('noor_user', JSON.stringify(userData))
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('noor_user')
        window.location.href = '/'
    }

    const updateProfile = (data: Partial<User>) => {
        if (!user) return
        const updatedUser = { ...user, ...data }
        setUser(updatedUser)
        localStorage.setItem('noor_user', JSON.stringify(updatedUser))
    }

    return (
        <UserContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateProfile, orders }}>
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
