import type { FormEvent } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CourtCreateView } from "./CourtCreateView";

const meta: Meta<typeof CourtCreateView> = {
  title: "Features/Courts/CourtCreateView",
  component: CourtCreateView,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof CourtCreateView>;

const initialFormData = {
  name: "",
  sportType: "",
  hourlyPrice: "",
  opensAt: "08:00",
  closesAt: "22:00",
};

const populatedFormData = {
  name: "Court 4",
  sportType: "Tennis",
  hourlyPrice: "50.00",
  opensAt: "08:00",
  closesAt: "22:00",
};

export const Default: Story = {
  args: {
    formData: initialFormData,
    fieldErrors: {},
    isSubmitting: false,
    isSuccessDialogOpen: false,
    onFieldChange: () => undefined,
    onSubmit: (event: FormEvent) => event.preventDefault(),
    onCancel: () => undefined,
    onCloseSuccessDialog: () => undefined,
    onGoToCourts: () => undefined,
    onSignOut: () => undefined,
  },
};

export const Filled: Story = {
  args: {
    ...Default.args,
    formData: populatedFormData,
  },
};

export const ValidationErrors: Story = {
  args: {
    ...Default.args,
    formData: {
      name: "",
      sportType: "",
      hourlyPrice: "invalid",
      opensAt: "08:30",
      closesAt: "08:00",
    },
    fieldErrors: {
      name: "Name is required.",
      sportType: "Sport type is required.",
      hourlyPrice: "Hourly price in cents must be a positive integer.",
      opensAt: "Opening time must be on the hour (HH:00).",
      closesAt: "Closing time must be on the hour (HH:00).",
    },
  },
};

export const GeneralError: Story = {
  args: {
    ...Default.args,
    formData: populatedFormData,
    generalError: "Unable to reach the server. Please try again.",
  },
};

export const Submitting: Story = {
  args: {
    ...Default.args,
    formData: populatedFormData,
    isSubmitting: true,
  },
};

export const SuccessModal: Story = {
  args: {
    ...Default.args,
    formData: populatedFormData,
    isSuccessDialogOpen: true,
  },
};
