import type { FormEvent } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DailyBookingsReportView } from "./DailyBookingsReportView";
import type { DailyBookingReportResponse } from "./reportApi";

const meta: Meta<typeof DailyBookingsReportView> = {
  title: "Features/Reports/DailyBookingsReportView",
  component: DailyBookingsReportView,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof DailyBookingsReportView>;

const populatedReport: DailyBookingReportResponse = {
  date: "2026-11-24",
  display: {
    date: "Tuesday, November 24, 2026",
    expectedRevenue: "$180.00",
  },
  bookings: [
    {
      id: "b-1",
      court: { id: "c-1", name: "Court 1" },
      user: { name: "Alex Morgan" },
      status: "confirmed",
      display: {
        startsAt: "08:00",
        endsAt: "10:00",
        totalPrice: "$100.00",
      },
    },
    {
      id: "b-2",
      court: { id: "c-2", name: "Court 2" },
      user: { name: "Jordan Lee" },
      status: "confirmed",
      display: {
        startsAt: "10:00",
        endsAt: "12:00",
        totalPrice: "$80.00",
      },
    },
    {
      id: "b-3",
      court: { id: "c-3", name: "Court 3" },
      user: { name: "Taylor Reed" },
      status: "cancelled",
      display: {
        startsAt: "13:00",
        endsAt: "14:00",
        totalPrice: "$60.00",
      },
    },
  ],
};

const emptyReport: DailyBookingReportResponse = {
  date: "2026-11-24",
  display: {
    date: "Tuesday, November 24, 2026",
    expectedRevenue: "$0.00",
  },
  bookings: [],
};

export const Default: Story = {
  args: {
    dateInput: "2026-11-24",
    onDateInputChange: () => undefined,
    onSubmitDate: (event: FormEvent) => event.preventDefault(),
    report: populatedReport,
    isLoading: false,
    onRetry: () => undefined,
    onSignOut: () => undefined,
  },
};

export const Empty: Story = {
  args: {
    ...Default.args,
    report: emptyReport,
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    isLoading: true,
  },
};

export const ErrorState: Story = {
  args: {
    ...Default.args,
    report: null,
    errorMessage: "Could not load report. Please try again.",
  },
};
