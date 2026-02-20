import fs from "node:fs/promises"
import path from "node:path"
import { prisma } from "@/lib/prisma"

type BackupRow = {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  address: string
  building?: string
  postcode?: string
  city: string
  membershipTier: string
  createdAt: string
  updatedAt: string
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function toCsv(rows: BackupRow[]) {
  const headers = [
    "id",
    "email",
    "firstName",
    "lastName",
    "phone",
    "address",
    "building",
    "postcode",
    "city",
    "membershipTier",
    "createdAt",
    "updatedAt"
  ]

  const lines = [headers.join(",")]
  for (const row of rows) {
    const values = headers.map((header) => csvEscape((row as Record<string, string>)[header] || ""))
    lines.push(values.join(","))
  }
  return lines.join("\n")
}

export async function refreshCustomerBackupFiles() {
  let rows: BackupRow[] = []

  try {
    const full = await prisma.profile.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        building: true,
        postcode: true,
        city: true,
        membershipTier: true,
        createdAt: true,
        updatedAt: true
      }
    })

    rows = full.map((row) => ({
      id: row.id,
      email: row.email || "",
      firstName: row.firstName || "",
      lastName: row.lastName || "",
      phone: row.phone || "",
      address: row.address || "",
      building: row.building || "",
      postcode: row.postcode || "",
      city: row.city || "",
      membershipTier: row.membershipTier || "Member",
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString()
    }))
  } catch {
    // Fallback for environments where new DB columns are not migrated yet.
    const base = await prisma.profile.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        city: true,
        membershipTier: true,
        createdAt: true,
        updatedAt: true
      }
    })

    rows = base.map((row) => ({
      id: row.id,
      email: row.email || "",
      firstName: row.firstName || "",
      lastName: row.lastName || "",
      phone: row.phone || "",
      address: row.address || "",
      building: "",
      postcode: "",
      city: row.city || "",
      membershipTier: row.membershipTier || "Member",
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString()
    }))
  }

  const backupsDir = path.join(process.cwd(), "backups")
  await fs.mkdir(backupsDir, { recursive: true })

  const latestJsonPath = path.join(backupsDir, "customers-latest.json")
  const latestCsvPath = path.join(backupsDir, "customers-latest.csv")

  await fs.writeFile(latestJsonPath, JSON.stringify(rows, null, 2), "utf8")
  await fs.writeFile(latestCsvPath, toCsv(rows), "utf8")

  return {
    count: rows.length,
    jsonPath: latestJsonPath,
    csvPath: latestCsvPath
  }
}
