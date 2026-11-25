import type { FormEvent } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CourtEditView } from "./CourtEditView";

const meta: Meta<typeof CourtEditView> = {
  title: "Features/Courts/CourtEditView",
  component: CourtEditView,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof CourtEditView>;

const activeFormData = {
  name: "Court 1",
  sportType: "Tennis",
  hourlyPrice: "50.00",
  opensAt: "08:00",
  closesAt: "22:00",
  isActive: true,
};

const inactiveFormData = {
  name: "Court 3",
  sportType: "Padel",
  hourlyPrice: "60.00",
  opensAt: "08:00",
  closesAt: "22:00",
  isActive: false,
};

export const Default: Story = {
  args: {
    formData: activeFormData,
    fieldErrors: {},
    isLoading: false,
    isNotFound: false,
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

export const InactiveCourt: Story = {
  args: {
    ...Default.args,
    formData: inactiveFormData,
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    isLoading: true,
  },
};

export const NotFound: Story = {
  args: {
    ...Default.args,
    isNotFound: true,
  },
};

export const ValidationErrors: Story = {
  args: {
    ...Default.args,
    formData: {
      ...activeFormData,
      name: "",
      hourlyPrice: "abc",
      opensAt: "22:00",
      closesAt: "08:00",
    },
    fieldErrors: {
      name: "Enter a court name.",
      hourlyPrice: "Enter a positive whole number of cents.",
      closesAt: "Closing time must be later than opening time.",
    },
  },
};

export const GeneralError: Story = {
  args: {
    ...Default.args,
    generalError: "Failed to update court. Please try again.",
  },
};

export const Submitting: Story = {
  args: {
    ...Default.args,
    isSubmitting: true,
  },
};

export const SuccessModal: Story = {
  args: {
    ...Default.args,
    isSuccessDialogOpen: true,
  },
};
