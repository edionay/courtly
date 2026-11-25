import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { createHash } from "node:crypto";

const expectedDatabase = "courtly_performance";
const facilityId = "10000000-0000-4000-8000-000000000001";
const anchorDate = process.env.PERFORMANCE_ANCHOR_DATE ?? "2026-11-29";
const requestedCount = Number(process.env.PERFORMANCE_BOOKING_COUNT ?? "12000");
const validCounts = new Set([1000, 12000]);

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");
  const parsed = new URL(databaseUrl);
  if (parsed.pathname !== `/${expectedDatabase}`) {
    throw new Error(`Performance data generation is restricted to ${expectedDatabase}`);
  }
  if (!validCounts.has(requestedCount)) throw new Error("PERFORMANCE_BOOKING_COUNT must be 1000 or 12000");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(anchorDate) || Number.isNaN(Date.parse(`${anchorDate}T00:00:00Z`))) {
    throw new Error("PERFORMANCE_ANCHOR_DATE must be a valid YYYY-MM-DD date");
  }
  return databaseUrl;
}

function idFor(kind: string, index: number): string {
  const hash = createHash("sha256").update(`courtly-performance-v1:${kind}:${index}`).digest("hex").slice(0, 32);
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20)}`;
}

async function generate(): Promise<void> {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: getDatabaseUrl() }) });
  try {
    const facility = await prisma.facility.upsert({
      where: { id: facilityId },
      update: { timezone: "America/Sao_Paulo" },
      create: { id: facilityId, name: "Performance Test Facility", timezone: "America/Sao_Paulo" },
    });
    const users = await Promise.all([0, 1, 2].map((index) => prisma.user.upsert({
      where: { email: `performance-${index}@courtly.test` },
      update: {},
      create: { id: idFor("user", index), name: `Performance User ${index}`, email: `performance-${index}@courtly.test`, passwordHash: "not-for-login", role: index === 2 ? "admin" : "user" },
    })));
    const courts = await Promise.all(Array.from({ length: 20 }, (_, index) => prisma.court.upsert({
      where: { facilityId_name: { facilityId: facility.id, name: `Performance Court ${String(index + 1).padStart(2, "0")}` } },
      update: {},
      create: { id: idFor("court", index), facilityId: facility.id, name: `Performance Court ${String(index + 1).padStart(2, "0")}`, sportType: "Tennis", hourlyPriceCents: 5000 + index * 100, opensAt: new Date("1970-01-01T07:00:00Z"), closesAt: new Date("1970-01-01T22:00:00Z") },
    })));
    await prisma.booking.deleteMany({ where: { court: { facilityId: facility.id } } });
    const base = Date.parse(`${anchorDate}T12:00:00Z`);
    const rows = Array.from({ length: requestedCount }, (_, index) => {
      const bookingsPerCourtPerDay = 7;
      const bookingOffset = Math.floor(index / courts.length);
      const day = Math.floor(bookingOffset / bookingsPerCourtPerDay);
      const court = courts[index % courts.length];
      const hour = 7 + (bookingOffset % bookingsPerCourtPerDay) * 2;
      const start = new Date(base + day * 86400000 + hour * 3600000);
      const durationHours = index % 3 === 0 ? 2 : 1;
      const user = users[index % 2];
      return { id: idFor("booking", index), courtId: court.id, userId: user.id, startsAt: start, endsAt: new Date(start.getTime() + durationHours * 3600000), status: index % 10 === 0 ? "cancelled" as const : "confirmed" as const, totalPriceCents: court.hourlyPriceCents * durationHours };
    });
    const chunkSize = 500;
    for (let offset = 0; offset < rows.length; offset += chunkSize) {
      await prisma.booking.createMany({ data: rows.slice(offset, offset + chunkSize) });
    }
    const counts = await prisma.booking.groupBy({ by: ["status"], _count: { _all: true } });
    console.log(JSON.stringify({ seed: "courtly-performance-v1", anchorDate, facilityTimezone: facility.timezone, bookings: requestedCount, courts: courts.length, users: users.length, statusCounts: counts.map(({ status, _count }) => ({ status, count: _count._all })) }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

await generate();
