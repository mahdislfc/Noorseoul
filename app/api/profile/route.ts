import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { prisma } from "@/lib/prisma"
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

type ProfileColumnMeta = {
    column_name: string
    is_nullable: "YES" | "NO"
    column_default: string | null
}

const PROFILE_TABLE = `"Profile"`

const getExistingProfileColumns = async (): Promise<ProfileColumnMeta[]> => {
    return prisma.$queryRaw<Array<ProfileColumnMeta>>`
        SELECT column_name
             , is_nullable
             , column_default
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND lower(table_name) = lower('Profile')
    `
}

const toProfileResponse = (row: Record<string, unknown> | null) => {
    if (!row) return null
    return {
        firstName: typeof row.firstName === "string" ? row.firstName : "",
        lastName: typeof row.lastName === "string" ? row.lastName : "",
        phone: typeof row.phone === "string" ? row.phone : "",
        address: typeof row.address === "string" ? row.address : "",
        building: typeof row.building === "string" ? row.building : "",
        city: typeof row.city === "string" ? row.city : "",
        postcode: typeof row.postcode === "string" ? row.postcode : "",
        membershipTier: typeof row.membershipTier === "string" ? row.membershipTier : "Member"
    }
}

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const columns = await getExistingProfileColumns()
        const columnSet = new Set(columns.map((column) => column.column_name))
        const selectableColumns = [
            "firstName",
            "lastName",
            "phone",
            "address",
            "building",
            "city",
            "postcode",
            "membershipTier"
        ].filter((column) => columnSet.has(column))

        if (!columnSet.has("id")) {
            return NextResponse.json({ profile: null })
        }

        const selectList = selectableColumns.map((column) => `"${column}"`).join(", ")
        const sql = `
            SELECT ${selectList || "id"}
            FROM ${PROFILE_TABLE}
            WHERE "id" = $1
            LIMIT 1
        `
        const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(sql, user.id)
        const profile = toProfileResponse(rows[0] || null)

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
        const payload: Record<string, unknown> = {
            id: user.id,
            email: user.email ?? `${user.id}@placeholder.local`,
            firstName: body.firstName ?? "",
            lastName: body.lastName ?? "",
            phone: body.phone ?? "",
            address: body.address ?? "",
            building: body.building ?? "",
            city: body.city ?? "",
            postcode: body.postcode ?? "",
            membershipTier: "Member",
            createdAt: new Date(),
            updatedAt: new Date()
        }

        const columns = await getExistingProfileColumns()
        const columnSet = new Set(columns.map((column) => column.column_name))

        if (!columnSet.has("id")) {
            return NextResponse.json({ error: "Profile table is missing required `id` column" }, { status: 500 })
        }

        const updateColumns = Object.keys(payload).filter(
            (column) => column !== "id" && columnSet.has(column)
        )

        if (updateColumns.length > 0) {
            const assignments = updateColumns
                .map((column, index) => `"${column}" = $${index + 1}`)
                .join(", ")
            const values = updateColumns.map((column) => payload[column] ?? "")
            const updateSql = `
                UPDATE ${PROFILE_TABLE}
                SET ${assignments}
                WHERE "id" = $${updateColumns.length + 1}
            `
            const updatedRows = await prisma.$executeRawUnsafe(updateSql, ...values, user.id)
            if (updatedRows > 0) {
                try {
                    await refreshCustomerBackupFiles()
                } catch (backupError) {
                    console.warn("Customer backup refresh failed after profile update:", backupError)
                }
                return NextResponse.json({ success: true })
            }
        }

        const insertColumns = columns
            .filter((column) => {
                if (column.column_name in payload) return true
                if (column.is_nullable === "YES") return false
                return Boolean(column.column_default)
            })
            .map((column) => column.column_name)

        const missingRequiredColumns = columns
            .filter((column) => {
                if (column.column_name in payload) return false
                if (column.is_nullable === "YES") return false
                return !column.column_default
            })
            .map((column) => column.column_name)

        if (missingRequiredColumns.length > 0) {
            return NextResponse.json(
                { error: `Profile table has required columns without defaults: ${missingRequiredColumns.join(", ")}` },
                { status: 500 }
            )
        }

        const valueColumns = insertColumns.filter((column) => column in payload)
        const quotedColumns = valueColumns.map((column) => `"${column}"`).join(", ")
        const placeholders = valueColumns.map((_, index) => `$${index + 1}`).join(", ")
        const values = valueColumns.map((column) => payload[column] ?? "")

        const insertSql = `
            INSERT INTO ${PROFILE_TABLE} (${quotedColumns})
            VALUES (${placeholders})
        `
        await prisma.$executeRawUnsafe(insertSql, ...values)

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
