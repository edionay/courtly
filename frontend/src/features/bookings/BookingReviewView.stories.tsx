import type { Meta, StoryObj } from "@storybook/react-vite";
import { BookingReviewView } from "./BookingReviewView";
import { mockReviewData } from "./fixtures";

const meta = {
  title: "Bookings/Booking review",
  component: BookingReviewView,
  parameters: { layout: "fullscreen" },
  args: {
    review: mockReviewData,
    onConfirm: () => undefined,
    onChange: () => undefined,
    onBackToCourts: () => undefined,
    onBackToCourtSlots: () => undefined,
    onSignOut: () => undefined,
    onRetry: () => undefined,
  },
} satisfies Meta<typeof BookingReviewView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Administrator: Story = {
  args: {
    isAdmin: true,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const ErrorState: Story = {
  args: {
    errorMessage: "Could not load booking details.",
  },
};
