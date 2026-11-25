import { PrismaPg } from "@prisma/adapter-pg";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "../generated/prisma/client";

const expectedDatabase = "courtly_performance";
const facilityId = "10000000-0000-4000-8000-000000000001";
const anchorDate = process.env.PERFORMANCE_ANCHOR_DATE ?? "2026-11-29";
const requestedCount = Number(process.env.PERFORMANCE_BOOKING_COUNT ?? "12000");
const chunkSize = 500;

function validateConfiguration(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");
  if (new URL(databaseUrl).pathname !== `/${expectedDatabase}`) {
    throw new Error(`Performance data generation is restricted to ${expectedDatabase}`);
  }
  if (![1000, 12000].includes(requestedCount)) throw new Error("PERFORMANCE_BOOKING_COUNT must be 1000 or 12000");
  const anchor = new Date(`${anchorDate}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(anchorDate) || Number.isNaN(anchor.getTime()) || anchor.toISOString().slice(0, 10) !== anchorDate || anchor.getUTCDay() !== 0) {
    throw new Error("PERFORMANCE_ANCHOR_DATE must be a valid Sunday in YYYY-MM-DD format");
  }
  return databaseUrl;
}

function idFor(kind: string, index: number): string {
  const hash = createHash("sha256").update(`courtly-performance-v1:${kind}:${index}`).digest("hex").slice(0, 32);
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20)}`;
}

async function generate(): Promise<void> {
  const databaseUrl = validateConfiguration();
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
  try {
    const facility = await prisma.facility.upsert({ where: { id: facilityId }, update: { timezone: "America/Sao_Paulo" }, create: { id: facilityId, name: "Performance Test Facility", timezone: "America/Sao_Paulo" } });
    const users = await Promise.all([0, 1, 2].map((index) => prisma.user.upsert({
      where: { email: `performance-${index}@courtly.test` }, update: {},
      create: { id: idFor("user", index), name: `Performance User ${index}`, email: `performance-${index}@courtly.test`, passwordHash: "not-for-login", role: index === 2 ? "admin" : "user" },
    })));
    const courts = await Promise.all(Array.from({ length: 20 }, (_, index) => prisma.court.upsert({
      where: { facilityId_name: { facilityId: facility.id, name: courtName(index) } }, update: {},
      create: { id: idFor("court", index), facilityId: facility.id, name: courtName(index), sportType: "Tennis", hourlyPriceCents: 5000 + index * 100, opensAt: new Date("1970-01-01T07:00:00Z"), closesAt: new Date("1970-01-01T22:00:00Z") },
    })));
    await prisma.booking.deleteMany({ where: { court: { facilityId: facility.id } } });
    const base = Date.parse(`${anchorDate}T10:00:00Z`);
    const rows = Array.from({ length: requestedCount }, (_, index) => {
      const offset = Math.floor(index / courts.length);
      const court = courts[index % courts.length];
      const day = Math.floor(offset / 7);
      const localHour = 7 + (offset % 7) * 2;
      const startsAt = new Date(base + day * 86400000 + (localHour + 3) * 3600000);
      const durationHours = index % 3 === 0 ? 2 : 1;
      return { id: idFor("booking", index), courtId: court.id, userId: users[index % 2].id, startsAt, endsAt: new Date(startsAt.getTime() + durationHours * 3600000), status: index % 10 === 0 ? "cancelled" as const : "confirmed" as const, totalPriceCents: court.hourlyPriceCents * durationHours };
    });
    for (let offset = 0; offset < rows.length; offset += chunkSize) await prisma.booking.createMany({ data: rows.slice(offset, offset + chunkSize) });
    const grouped = await prisma.booking.groupBy({ by: ["status"], _count: { _all: true } });
    const statusCounts = Object.fromEntries(grouped.map(({ status, _count }) => [status, _count._all]));
    const manifest = {
      seed: "courtly-performance-v1", anchorDate, timezone: facility.timezone, bookingCount: requestedCount,
      courtCount: courts.length, userCount: users.length,
      statusCounts, busyAvailability: { courtId: courts[0].id, weekStart: anchorDate },
      busyReportDate: anchorDate, emptyReportDate: addDays(anchorDate, Math.ceil(requestedCount / 140) + 1),
      deterministicIds: true,
    };
    await mkdir(path.resolve("docs/performance/manifests"), { recursive: true });
    await writeFile(path.resolve(`docs/performance/manifests/${requestedCount}.json`), `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(JSON.stringify(manifest, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

function courtName(index: number): string { return `Performance Court ${String(index + 1).padStart(2, "0")}`; }
function addDays(date: string, days: number): string { const result = new Date(`${date}T00:00:00Z`); result.setUTCDate(result.getUTCDate() + days); return result.toISOString().slice(0, 10); }

await generate();
