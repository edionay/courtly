import type { Meta, StoryObj } from "@storybook/react-vite";
import { BookingSlotsView } from "./BookingSlotsView";
import {
  mockAvailabilityDays,
  mockCourtSummary,
} from "./fixtures";

const meta = {
  title: "Bookings/Weekly slot selection",
  component: BookingSlotsView,
  parameters: { layout: "fullscreen" },
  args: {
    court: mockCourtSummary,
    weekStartLabel: "Nov 22, 2026",
    weekEndLabel: "Nov 28, 2026",
    hasPreviousWeek: false,
    hasNextWeek: true,
    days: mockAvailabilityDays,
    selectedDate: "2026-11-24",
    selectedStartsAtList: [],
    onSelectDate: () => undefined,
    onToggleSlot: () => undefined,
    onPreviousWeek: () => undefined,
    onNextWeek: () => undefined,
    onContinue: () => undefined,
    onBackToCourts: () => undefined,
    onSignOut: () => undefined,
    onRetry: () => undefined,
  },
} satisfies Meta<typeof BookingSlotsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleSlotSelected: Story = {
  args: {
    selectedStartsAtList: ["2026-11-24T17:00:00Z"],
    previewDateLabel: "Nov 24, 2026",
    previewPrice: "$50.00",
  },
};

export const TwoSlotsSelected: Story = {
  args: {
    selectedStartsAtList: ["2026-11-24T17:00:00Z", "2026-11-24T18:00:00Z"],
    previewDateLabel: "Nov 24, 2026",
    previewPrice: "$100.00",
  },
};

export const LoadingPreview: Story = {
  args: {
    selectedStartsAtList: ["2026-11-24T17:00:00Z", "2026-11-24T18:00:00Z"],
    previewDateLabel: "Nov 24, 2026",
    isPreviewLoading: true,
  },
};

export const NoSlotsAvailable: Story = {
  args: {
    selectedDate: "2026-11-22",
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const ConnectionError: Story = {
  args: {
    errorMessage: "Could not connect to the server. Please check your connection.",
  },
};
