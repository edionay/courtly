import type { CourtCardData } from "./CourtCard";

export const courtFixtures: CourtCardData[] = [
  {
    id: "court-tennis",
    name: "Court 1",
    sportType: "Tennis",
    opensAt: "08:00",
    closesAt: "22:00",
    display: { hourlyPrice: "$50.00" },
    availabilityHref: "/courts/court-tennis/availability",
  },
  {
    id: "court-basketball",
    name: "Court 2",
    sportType: "Basketball",
    opensAt: "08:00",
    closesAt: "22:00",
    display: { hourlyPrice: "$40.00" },
    availabilityHref: "/courts/court-basketball/availability",
  },
  {
    id: "court-padel",
    name: "Court 3",
    sportType: "Padel",
    opensAt: "08:00",
    closesAt: "22:00",
    display: { hourlyPrice: "$60.00" },
    availabilityHref: "/courts/court-padel/availability",
  },
  {
    id: "court-futsal",
    name: "Court 4",
    sportType: "Futsal",
    opensAt: "08:00",
    closesAt: "22:00",
    display: { hourlyPrice: "$40.00" },
    availabilityHref: "/courts/court-futsal/availability",
  },
];
