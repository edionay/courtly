import { PrismaPg } from "@prisma/adapter-pg";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { DateTime } from "luxon";
import { PrismaClient } from "../generated/prisma/client";

const EXPECTED_DATABASE = "courtly_performance";
const FACILITY_ID = "10000000-0000-4000-8000-000000000001";
const FACILITY_TIMEZONE = "America/Sao_Paulo";
const ANCHOR_DATE = process.env.PERFORMANCE_ANCHOR_DATE ?? "2026-11-29";
const BOOKING_COUNT = Number(process.env.PERFORMANCE_BOOKING_COUNT ?? "12000");
const CHUNK_SIZE = 500;
const COURT_COUNT = 20;
const BOOKINGS_PER_COURT_PER_DAY = 7;
const EXPECTED_BUSY_DAY_COUNT = COURT_COUNT * BOOKINGS_PER_COURT_PER_DAY;
const USER_EMAILS = ["alex@courtly.test", "jordan@courtly.test", "admin@courtly.test"];

interface DatasetConfiguration {
  databaseUrl: string;
  anchorDate: string;
  bookingCount: number;
}

interface BookingSchedule {
  startsAt: Date;
  endsAt: Date;
}

function getConfiguration(): DatasetConfiguration {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");
  if (new URL(databaseUrl).pathname !== `/${EXPECTED_DATABASE}`) {
    throw new Error(`Performance data generation is restricted to ${EXPECTED_DATABASE}`);
  }
  if (![1000, 12000].includes(BOOKING_COUNT)) {
    throw new Error("PERFORMANCE_BOOKING_COUNT must be 1000 or 12000");
  }
  const anchor = new Date(`${ANCHOR_DATE}T00:00:00Z`);
  const validSunday = /^\d{4}-\d{2}-\d{2}$/.test(ANCHOR_DATE) &&
    !Number.isNaN(anchor.getTime()) &&
    anchor.toISOString().slice(0, 10) === ANCHOR_DATE &&
    anchor.getUTCDay() === 0;
  if (!validSunday) throw new Error("PERFORMANCE_ANCHOR_DATE must be a valid Sunday in YYYY-MM-DD format");
  return { databaseUrl, anchorDate: ANCHOR_DATE, bookingCount: BOOKING_COUNT };
}

function idFor(kind: string, index: number): string {
  const hash = createHash("sha256").update(`courtly-performance-v1:${kind}:${index}`).digest("hex").slice(0, 32);
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20)}`;
}

function courtName(index: number): string {
  return `Performance Court ${String(index + 1).padStart(2, "0")}`;
}

function addDays(date: string, days: number): string {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

async function getFacility(prisma: PrismaClient) {
  return prisma.facility.upsert({
    where: { id: FACILITY_ID },
    update: { timezone: FACILITY_TIMEZONE },
    create: { id: FACILITY_ID, name: "Performance Test Facility", timezone: FACILITY_TIMEZONE },
  });
}

async function getSeededUsers(prisma: PrismaClient) {
  return Promise.all(USER_EMAILS.map(async (email) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error(`Required seeded performance account is missing: ${email}`);
    return user;
  }));
}

async function getPerformanceCourts(prisma: PrismaClient, facilityId: string) {
  return Promise.all(Array.from({ length: COURT_COUNT }, (_, index) => prisma.court.upsert({
    where: { facilityId_name: { facilityId, name: courtName(index) } },
    update: {},
    create: {
      id: idFor("court", index),
      facilityId,
      name: courtName(index),
      sportType: "Tennis",
      hourlyPriceCents: 5000 + index * 100,
      opensAt: new Date("1970-01-01T07:00:00Z"),
      closesAt: new Date("1970-01-01T22:00:00Z"),
    },
  })));
}

function createBookings(configuration: DatasetConfiguration, courts: Awaited<ReturnType<typeof getPerformanceCourts>>, users: Awaited<ReturnType<typeof getSeededUsers>>) {
  const base = Date.parse(`${configuration.anchorDate}T00:00:00Z`);
  const middleDay = Math.floor(Math.ceil(configuration.bookingCount / (courts.length * BOOKINGS_PER_COURT_PER_DAY)) / 2);
  return Array.from({ length: configuration.bookingCount }, (_, index) => {
    const offset = Math.floor(index / courts.length);
    const court = courts[index % courts.length];
    const day = Math.floor(offset / BOOKINGS_PER_COURT_PER_DAY) - middleDay;
    const localHour = 7 + (offset % BOOKINGS_PER_COURT_PER_DAY) * 2;
    const startsAt = new Date(base + day * 86400000 + (localHour + 3) * 3600000);
    const durationHours = index % 3 === 0 ? 2 : 1;
    return {
      id: idFor("booking", index),
      courtId: court.id,
      userId: users[index % 2].id,
      startsAt,
      endsAt: new Date(startsAt.getTime() + durationHours * 3600000),
      status: index % 10 === 0 ? "cancelled" as const : "confirmed" as const,
      totalPriceCents: court.hourlyPriceCents * durationHours,
    };
  });
}

async function saveBookings(prisma: PrismaClient, bookings: ReturnType<typeof createBookings>): Promise<void> {
  for (let offset = 0; offset < bookings.length; offset += CHUNK_SIZE) {
    await prisma.booking.createMany({ data: bookings.slice(offset, offset + CHUNK_SIZE) });
  }
}

async function getStatusCounts(prisma: PrismaClient, facilityId: string) {
  const grouped = await prisma.booking.groupBy({
    where: { court: { facilityId } },
    by: ["status"],
    _count: { _all: true },
  });
  return Object.fromEntries(grouped.map(({ status, _count }) => [status, _count._all]));
}

async function getBookingsByCourt(prisma: PrismaClient, facilityId: string) {
  const grouped = await prisma.booking.groupBy({
    where: { court: { facilityId } },
    by: ["courtId"],
    _count: { _all: true },
  });
  return Object.fromEntries(grouped.map(({ courtId, _count }) => [courtId, _count._all]));
}

async function countBookingsOnDate(prisma: PrismaClient, facilityId: string, date: string): Promise<number> {
  const start = new Date(`${date}T03:00:00Z`);
  const end = new Date(start.getTime() + 86400000);
  return prisma.booking.count({ where: { court: { facilityId }, startsAt: { gte: start, lt: end } } });
}

function createManifest(configuration: DatasetConfiguration, timezone: string, courts: Awaited<ReturnType<typeof getPerformanceCourts>>, statusCounts: Record<string, number>, bookingsByCourt: Record<string, number>, busyBookings: number, emptyBookings: number, total: number) {
  return {
    totalDatabaseBookingCount: total,
    seed: "courtly-performance-v1",
    anchorDate: configuration.anchorDate,
    timezone,
    bookingCount: configuration.bookingCount,
    courtCount: courts.length,
    userCount: USER_EMAILS.length,
    statusCounts,
    bookingsByCourt,
    busyDayBookingCount: busyBookings,
    emptyDayBookingCount: emptyBookings,
    busyAvailability: { courtId: courts[1].id, weekStart: configuration.anchorDate },
    busyReportDate: configuration.anchorDate,
    emptyReportDate: addDays(configuration.anchorDate, Math.ceil(configuration.bookingCount / 140) + 2),
    deterministicIds: true,
  };
}

function validateSchedules(bookings: BookingSchedule[], timezone: string): void {
  for (const booking of bookings) {
    const startsAt = DateTime.fromJSDate(booking.startsAt, { zone: "utc" }).setZone(timezone);
    const endsAt = DateTime.fromJSDate(booking.endsAt, { zone: "utc" }).setZone(timezone);
    const durationHours = endsAt.diff(startsAt, "hours").hours;
    if (!startsAt.isValid || !endsAt.isValid || startsAt.minute !== 0 || endsAt.minute !== 0 || startsAt.second !== 0 || endsAt.second !== 0 || durationHours < 1 || durationHours > 2 || !Number.isInteger(durationHours) || startsAt.hour < 7 || endsAt.hour > 22 || startsAt.toISODate() !== endsAt.toISODate()) {
      throw new Error(`Generated booking is outside opening hours or has an invalid duration: ${booking.startsAt.toISOString()}`);
    }
  }
}

async function writeManifest(bookingCount: number, manifest: ReturnType<typeof createManifest>): Promise<void> {
  const manifestDirectory = path.resolve(process.cwd(), "../docs/performance/manifests");
  await mkdir(manifestDirectory, { recursive: true });
  await writeFile(path.join(manifestDirectory, `${bookingCount}.json`), `${JSON.stringify(manifest, null, 2)}\n`);
}

async function generate(): Promise<void> {
  const configuration = getConfiguration();
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: configuration.databaseUrl }) });
  try {
    const facility = await getFacility(prisma);
    const users = await getSeededUsers(prisma);
    const courts = await getPerformanceCourts(prisma, facility.id);
    await prisma.booking.deleteMany();
    await prisma.court.updateMany({ where: { facilityId: { not: facility.id } }, data: { isActive: false } });
    const bookings = createBookings(configuration, courts, users);
    await saveBookings(prisma, bookings);
    const generatedBookings = await prisma.booking.findMany({ where: { court: { facilityId: facility.id } }, select: { startsAt: true, endsAt: true } });
    validateSchedules(generatedBookings, facility.timezone);
    const statusCounts = await getStatusCounts(prisma, facility.id);
    const bookingsByCourt = await getBookingsByCourt(prisma, facility.id);
    const busyBookings = await countBookingsOnDate(prisma, facility.id, configuration.anchorDate);
    const emptyReportDate = addDays(configuration.anchorDate, Math.ceil(configuration.bookingCount / 140) + 2);
    const emptyBookings = await countBookingsOnDate(prisma, facility.id, emptyReportDate);
    const total = await prisma.booking.count();
    if (total !== configuration.bookingCount || busyBookings !== EXPECTED_BUSY_DAY_COUNT || emptyBookings !== 0 || courts.length !== COURT_COUNT) {
      throw new Error(`Dataset acceptance failed: total=${total}, busyDay=${busyBookings}, emptyDay=${emptyBookings}, courts=${courts.length}`);
    }
    const manifest = createManifest(configuration, facility.timezone, courts, statusCounts, bookingsByCourt, busyBookings, emptyBookings, total);
    await writeManifest(configuration.bookingCount, manifest);
    console.log(JSON.stringify(manifest, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

generate().catch((error: unknown) => {
  console.error("Performance dataset generation failed", error);
  process.exitCode = 1;
});
