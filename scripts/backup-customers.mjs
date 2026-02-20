#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function pad(value) {
  return String(value).padStart(2, "0");
}

function buildTimestamp(now = new Date()) {
  return [
    now.getUTCFullYear(),
    pad(now.getUTCMonth() + 1),
    pad(now.getUTCDate()),
    "-",
    pad(now.getUTCHours()),
    pad(now.getUTCMinutes()),
    pad(now.getUTCSeconds()),
    "Z",
  ].join("");
}

function csvEscape(value) {
  const normalized = value == null ? "" : String(value);
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

function toCsv(rows) {
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
    "updatedAt",
  ];

  const lines = [headers.join(",")];
  for (const row of rows) {
    const values = headers.map((header) => csvEscape(row[header]));
    lines.push(values.join(","));
  }
  return lines.join("\n");
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log("Usage: node scripts/backup-customers.mjs");
    console.log("Exports customer profile backup files to backups/.");
    return;
  }

  const rows = await prisma.profile.findMany({
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
      updatedAt: true,
    },
  });

  const normalizedRows = rows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));

  const stamp = buildTimestamp();
  const backupsDir = path.join(process.cwd(), "backups");
  const jsonPath = path.join(backupsDir, `customers-${stamp}.json`);
  const csvPath = path.join(backupsDir, `customers-${stamp}.csv`);
  const latestJsonPath = path.join(backupsDir, "customers-latest.json");
  const latestCsvPath = path.join(backupsDir, "customers-latest.csv");

  await fs.mkdir(backupsDir, { recursive: true });
  await fs.writeFile(jsonPath, JSON.stringify(normalizedRows, null, 2), "utf8");
  await fs.writeFile(csvPath, toCsv(normalizedRows), "utf8");
  await fs.writeFile(latestJsonPath, JSON.stringify(normalizedRows, null, 2), "utf8");
  await fs.writeFile(latestCsvPath, toCsv(normalizedRows), "utf8");

  console.log(`Backup completed (${normalizedRows.length} customers).`);
  console.log(`JSON:         ${jsonPath}`);
  console.log(`CSV:          ${csvPath}`);
  console.log(`Latest JSON:  ${latestJsonPath}`);
  console.log(`Latest CSV:   ${latestCsvPath}`);
}

main()
  .catch((error) => {
    console.error("Customer backup failed.");
    console.error(error?.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
