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

export const Submitting: Story = {
  args: {
    isSubmitting: true,
  },
};

export const SuccessModal: Story = {
  args: {
    isSuccessDialogOpen: true,
    isConfirmed: true,
  },
};

export const ConflictModal: Story = {
  args: {
    isConflictDialogOpen: true,
    conflictMessage:
      "This time slot is no longer available. Please choose another time.",
  },
};

export const ConflictDismissed: Story = {
  args: {
    isConflictDialogOpen: false,
    conflictMessage:
      "This time slot is no longer available. Please choose another time.",
  },
};

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
