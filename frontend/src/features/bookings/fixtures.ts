import type {
  AvailabilityDay,
  AvailabilityResponse,
  BookingPreviewResponse,
} from "./bookingApi";

export const mockCourtSummary = {
  id: "court-1",
  name: "Court 1",
  sportType: "tennis",
  opensAt: "08:00",
  closesAt: "22:00",
  hourlyPrice: "$50.00",
};

export const mockAvailabilityDays: AvailabilityDay[] = [
  {
    date: "2026-11-22",
    isSelectable: false,
    display: {
      dayOfMonth: "22",
      weekday: "Sun",
    },
    slots: [
      {
        startsAt: "2026-11-22T11:00:00Z",
        status: "past",
        display: { startsAt: "08:00", endsAt: "09:00" },
      },
    ],
  },
  {
    date: "2026-11-23",
    isSelectable: false,
    display: {
      dayOfMonth: "23",
      weekday: "Mon",
    },
    slots: [
      {
        startsAt: "2026-11-23T11:00:00Z",
        status: "past",
        display: { startsAt: "08:00", endsAt: "09:00" },
      },
    ],
  },
  {
    date: "2026-11-24",
    isSelectable: true,
    display: {
      dayOfMonth: "24",
      weekday: "Tue",
    },
    slots: [
      {
        startsAt: "2026-11-24T11:00:00Z",
        status: "past",
        display: { startsAt: "08:00", endsAt: "09:00" },
      },
      {
        startsAt: "2026-11-24T12:00:00Z",
        status: "past",
        display: { startsAt: "09:00", endsAt: "10:00" },
      },
      {
        startsAt: "2026-11-24T13:00:00Z",
        status: "booked",
        display: { startsAt: "10:00", endsAt: "11:00" },
      },
      {
        startsAt: "2026-11-24T14:00:00Z",
        status: "available",
        display: { startsAt: "11:00", endsAt: "12:00" },
      },
      {
        startsAt: "2026-11-24T15:00:00Z",
        status: "available",
        display: { startsAt: "12:00", endsAt: "13:00" },
      },
      {
        startsAt: "2026-11-24T16:00:00Z",
        status: "available",
        display: { startsAt: "13:00", endsAt: "14:00" },
      },
      {
        startsAt: "2026-11-24T17:00:00Z",
        status: "available",
        display: { startsAt: "14:00", endsAt: "15:00" },
      },
      {
        startsAt: "2026-11-24T18:00:00Z",
        status: "available",
        display: { startsAt: "15:00", endsAt: "16:00" },
      },
      {
        startsAt: "2026-11-24T19:00:00Z",
        status: "available",
        display: { startsAt: "16:00", endsAt: "17:00" },
      },
      {
        startsAt: "2026-11-24T20:00:00Z",
        status: "available",
        display: { startsAt: "17:00", endsAt: "18:00" },
      },
      {
        startsAt: "2026-11-24T21:00:00Z",
        status: "booked",
        display: { startsAt: "18:00", endsAt: "19:00" },
      },
      {
        startsAt: "2026-11-24T22:00:00Z",
        status: "available",
        display: { startsAt: "19:00", endsAt: "20:00" },
      },
      {
        startsAt: "2026-11-24T23:00:00Z",
        status: "available",
        display: { startsAt: "20:00", endsAt: "21:00" },
      },
      {
        startsAt: "2026-11-25T00:00:00Z",
        status: "available",
        display: { startsAt: "21:00", endsAt: "22:00" },
      },
    ],
  },
  {
    date: "2026-11-25",
    isSelectable: true,
    display: {
      dayOfMonth: "25",
      weekday: "Wed",
    },
    slots: [
      {
        startsAt: "2026-11-25T11:00:00Z",
        status: "available",
        display: { startsAt: "08:00", endsAt: "09:00" },
      },
      {
        startsAt: "2026-11-25T12:00:00Z",
        status: "available",
        display: { startsAt: "09:00", endsAt: "10:00" },
      },
    ],
  },
  {
    date: "2026-11-26",
    isSelectable: true,
    display: {
      dayOfMonth: "26",
      weekday: "Thu",
    },
    slots: [
      {
        startsAt: "2026-11-26T11:00:00Z",
        status: "available",
        display: { startsAt: "08:00", endsAt: "09:00" },
      },
    ],
  },
  {
    date: "2026-11-27",
    isSelectable: true,
    display: {
      dayOfMonth: "27",
      weekday: "Fri",
    },
    slots: [
      {
        startsAt: "2026-11-27T11:00:00Z",
        status: "available",
        display: { startsAt: "08:00", endsAt: "09:00" },
      },
    ],
  },
  {
    date: "2026-11-28",
    isSelectable: true,
    display: {
      dayOfMonth: "28",
      weekday: "Sat",
    },
    slots: [
      {
        startsAt: "2026-11-28T11:00:00Z",
        status: "available",
        display: { startsAt: "08:00", endsAt: "09:00" },
      },
    ],
  },
];

export const mockAvailabilityResponse: AvailabilityResponse = {
  courtId: "court-1",
  weekStart: "2026-11-22",
  weekEnd: "2026-11-28",
  display: {
    weekStart: "Nov 22, 2026",
    weekEnd: "Nov 28, 2026",
  },
  navigation: {
    previous: null,
    next: "/api/courts/court-1/availability?weekStart=2026-11-29",
  },
  days: mockAvailabilityDays,
};

export const mockPreviewResponse: BookingPreviewResponse = {
  court: {
    id: "court-1",
    name: "Court 1",
    sportType: "tennis",
  },
  durationHours: 2,
  display: {
    date: "Nov 24, 2026",
    startsAt: "14:00",
    endsAt: "16:00",
    totalPrice: "$100.00",
  },
};
