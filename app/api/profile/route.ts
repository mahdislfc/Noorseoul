import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { refreshCustomerBackupFiles } from "@/lib/customer-backup"

interface ProfileUpdateBody {
    firstName?: string
    lastName?: string
    phone?: string
    address?: string
    building?: string
    city?: string
    postcode?: string
}

const profileModel = Prisma.dmmf.datamodel.models.find((model) => model.name === "Profile")
const profileFields = new Set((profileModel?.fields || []).map((field) => field.name))
const supportsBuilding = profileFields.has("building")
const supportsPostcode = profileFields.has("postcode")

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
                building: true,
                city: true,
                postcode: true,
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
        const building = body.building ?? ""
        const city = body.city ?? ""
        const postcode = body.postcode ?? ""
        const email = user.email ?? `${user.id}@placeholder.local`

        const createData: {
            id: string
            email: string
            firstName: string
            lastName: string
            phone: string
            address: string
            city: string
            membershipTier: string
            building?: string
            postcode?: string
        } = {
            id: user.id,
            email,
            firstName,
            lastName,
            phone,
            address,
            city,
            membershipTier: "Member"
        }

        const updateData: {
            firstName: string
            lastName: string
            phone: string
            address: string
            city: string
            building?: string
            postcode?: string
        } = {
            firstName,
            lastName,
            phone,
            address,
            city
        }

        if (supportsBuilding) {
            createData.building = building
            updateData.building = building
        }

        if (supportsPostcode) {
            createData.postcode = postcode
            updateData.postcode = postcode
        }

        await prisma.profile.upsert({
            where: { id: user.id },
            create: createData,
            update: updateData
        })

        try {
            await refreshCustomerBackupFiles()
        } catch (backupError) {
            console.warn("Customer backup refresh failed after profile update:", backupError)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update profile"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
