import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed the database");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

async function seed(): Promise<void> {
  const facility = await prisma.facility.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Courtly Sports Center",
      timezone: "America/Sao_Paulo",
    },
  });

  const demoUsers = [
    { id: "00000000-0000-4000-8000-000000000010", name: "Courtly Administrator", email: "admin@courtly.test", password: "CourtlyAdmin2026!", role: "admin" as const },
    { id: "00000000-0000-4000-8000-000000000011", name: "Alex Morgan", email: "alex@courtly.test", password: "CourtlyUser2026!", role: "user" as const },
    { id: "00000000-0000-4000-8000-000000000012", name: "Jordan Lee", email: "jordan@courtly.test", password: "CourtlyUser2026!", role: "user" as const },
  ];

  for (const user of demoUsers) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: { id: user.id, name: user.name, email: user.email, passwordHash, role: user.role },
    });
  }

  const courts = [
    { id: "00000000-0000-4000-8000-000000000020", name: "Court 1", sportType: "Tennis", hourlyPriceCents: 4500 },
    { id: "00000000-0000-4000-8000-000000000021", name: "Court 2", sportType: "Futsal", hourlyPriceCents: 6000 },
    { id: "00000000-0000-4000-8000-000000000022", name: "Court 3", sportType: "Basketball", hourlyPriceCents: 5500 },
  ];

  for (const court of courts) {
    await prisma.court.upsert({
      where: { id: court.id },
      update: {},
      create: {
        ...court,
        facilityId: facility.id,
        opensAt: new Date("1970-01-01T07:00:00.000Z"),
        closesAt: new Date("1970-01-01T22:00:00.000Z"),
      },
    });
  }

  const firstCourt = await prisma.court.findUniqueOrThrow({ where: { id: "00000000-0000-4000-8000-000000000020" } });
  const secondCourt = await prisma.court.findUniqueOrThrow({ where: { id: "00000000-0000-4000-8000-000000000021" } });
  const alex = await prisma.user.findUniqueOrThrow({ where: { id: "00000000-0000-4000-8000-000000000011" } });
  const jordan = await prisma.user.findUniqueOrThrow({ where: { id: "00000000-0000-4000-8000-000000000012" } });
  const bookings = [
    { id: "00000000-0000-4000-8000-000000000030", courtId: firstCourt.id, userId: alex.id, startsAt: new Date("2026-12-02T15:00:00.000Z"), endsAt: new Date("2026-12-02T16:00:00.000Z"), totalPriceCents: firstCourt.hourlyPriceCents },
    { id: "00000000-0000-4000-8000-000000000031", courtId: secondCourt.id, userId: jordan.id, startsAt: new Date("2026-12-03T17:00:00.000Z"), endsAt: new Date("2026-12-03T19:00:00.000Z"), totalPriceCents: secondCourt.hourlyPriceCents * 2 },
    { id: "00000000-0000-4000-8000-000000000032", courtId: firstCourt.id, userId: jordan.id, startsAt: new Date("2026-11-18T14:00:00.000Z"), endsAt: new Date("2026-11-18T15:00:00.000Z"), totalPriceCents: firstCourt.hourlyPriceCents },
  ];

  for (const booking of bookings) {
    await prisma.booking.upsert({ where: { id: booking.id }, update: {}, create: booking });
  }
}

seed()
  .catch((error: unknown) => {
    console.error("Database seeding failed", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
