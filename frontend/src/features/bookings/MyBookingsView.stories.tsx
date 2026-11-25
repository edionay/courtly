import type { Meta, StoryObj } from "@storybook/react-vite";
import { MyBookingsView } from "./MyBookingsView";
import { mockBookings } from "./fixtures";

const meta = {
  title: "Bookings/My bookings list",
  component: MyBookingsView,
  parameters: { layout: "fullscreen" },
  args: {
    bookings: mockBookings,
    onCancelBooking: () => undefined,
    onCloseCancelDialog: () => undefined,
    onConfirmCancel: () => undefined,
    onSignOut: () => undefined,
    onRetry: () => undefined,
  },
} satisfies Meta<typeof MyBookingsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CancelModalOpen: Story = {
  args: {
    cancellingBooking: mockBookings[0],
  },
};

export const Cancelling: Story = {
  args: {
    cancellingBooking: mockBookings[0],
    isCancelling: true,
  },
};

export const CancelledNotice: Story = {
  args: {
    cancellationNotice:
      "Booking for Court 1 on Tuesday, December 1, 2026 has been cancelled.",
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
    errorMessage: "Could not load bookings.",
  },
};

export const Empty: Story = {
  args: {
    bookings: [],
  },
};
