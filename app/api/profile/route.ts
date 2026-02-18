import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { prisma } from "@/lib/prisma"

interface ProfileUpdateBody {
    firstName?: string
    lastName?: string
    phone?: string
    address?: string
    city?: string
}

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const profile = await prisma.profile.findUnique({
            where: { id: user.id },
            select: {
                firstName: true,
                lastName: true,
                phone: true,
                address: true,
                city: true,
                membershipTier: true
            }
        })

        return NextResponse.json({ profile })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch profile"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = (await request.json()) as ProfileUpdateBody

        const firstName = body.firstName ?? ""
        const lastName = body.lastName ?? ""
        const phone = body.phone ?? ""
        const address = body.address ?? ""
        const city = body.city ?? ""
        const email = user.email ?? `${user.id}@placeholder.local`

        await prisma.profile.upsert({
            where: { id: user.id },
            create: {
                id: user.id,
                email,
                firstName,
                lastName,
                phone,
                address,
                city,
                membershipTier: "Member"
            },
            update: {
                firstName,
                lastName,
                phone,
                address,
                city
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update profile"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
