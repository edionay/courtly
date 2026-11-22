CREATE TYPE "user_role" AS ENUM ('user', 'admin');
CREATE TYPE "booking_status" AS ENUM ('confirmed', 'cancelled');

CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'user',
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "facilities" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "courts" (
    "id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sport_type" TEXT NOT NULL,
    "hourly_price_cents" INTEGER NOT NULL,
    "opens_at" TIME(0) NOT NULL,
    "closes_at" TIME(0) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "courts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "courts_hourly_price_cents_check" CHECK ("hourly_price_cents" > 0),
    CONSTRAINT "courts_opening_hours_check" CHECK ("opens_at" < "closes_at")
);

CREATE TABLE "bookings" (
    "id" UUID NOT NULL,
    "court_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "starts_at" TIMESTAMPTZ(3) NOT NULL,
    "ends_at" TIMESTAMPTZ(3) NOT NULL,
    "status" "booking_status" NOT NULL DEFAULT 'confirmed',
    "total_price_cents" INTEGER NOT NULL,
    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "bookings_interval_check" CHECK ("starts_at" < "ends_at"),
    CONSTRAINT "bookings_total_price_cents_check" CHECK ("total_price_cents" > 0)
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "courts_facility_id_name_key" ON "courts"("facility_id", "name");
CREATE INDEX "bookings_user_id_starts_at_idx" ON "bookings"("user_id", "starts_at");

ALTER TABLE "courts" ADD CONSTRAINT "courts_facility_id_fkey"
    FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_court_id_fkey"
    FOREIGN KEY ("court_id") REFERENCES "courts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_no_confirmed_overlap"
    EXCLUDE USING GIST (
        "court_id" WITH =,
        tstzrange("starts_at", "ends_at", '[)') WITH &&
    ) WHERE ("status" = 'confirmed');
