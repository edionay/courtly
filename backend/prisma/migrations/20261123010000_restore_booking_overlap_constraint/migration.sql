ALTER TABLE "bookings" ADD CONSTRAINT "bookings_no_confirmed_overlap"
    EXCLUDE USING GIST (
        "court_id" WITH =,
        tstzrange("starts_at", "ends_at", '[)') WITH &&
    ) WHERE ("status" = 'confirmed');
