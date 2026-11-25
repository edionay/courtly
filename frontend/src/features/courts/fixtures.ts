import type { CourtCardData } from "./CourtCard";

export const courtFixtures: CourtCardData[] = [
  {
    id: "court-tennis",
    name: "Court 1",
    sportType: "Tennis",
    opensAt: "08:00",
    closesAt: "22:00",
    isActive: true,
    display: { hourlyPrice: "$50.00" },
  },
  {
    id: "court-basketball",
    name: "Court 2",
    sportType: "Basketball",
    opensAt: "08:00",
    closesAt: "22:00",
    isActive: true,
    display: { hourlyPrice: "$40.00" },
  },
  {
    id: "court-padel",
    name: "Court 3",
    sportType: "Padel",
    opensAt: "08:00",
    closesAt: "22:00",
    isActive: true,
    display: { hourlyPrice: "$60.00" },
  },
  {
    id: "court-futsal",
    name: "Court 4",
    sportType: "Futsal",
    opensAt: "08:00",
    closesAt: "22:00",
    isActive: false,
    display: { hourlyPrice: "$40.00" },
  },
];
