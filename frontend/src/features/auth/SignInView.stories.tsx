import type { Meta, StoryObj } from "@storybook/react-vite";
import { SignInView } from "./SignInView";

const meta = {
  title: "Auth/Sign in",
  component: SignInView,
  parameters: { layout: "fullscreen" },
  args: {
    onSubmit: () => undefined,
  },
} satisfies Meta<typeof SignInView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCredentials: Story = {
  args: {
    defaultEmail: "alex@courtly.test",
  },
};

export const InvalidCredentials: Story = {
  args: {
    defaultEmail: "alex@courtly.test",
    errorMessage: "Email or password is incorrect.",
  },
};

export const Submitting: Story = {
  args: {
    defaultEmail: "alex@courtly.test",
    isSubmitting: true,
  },
};

export const WithFieldErrors: Story = {
  args: {
    fieldErrors: {
      email: "Enter a valid email address.",
      password: "Password is required.",
    },
  },
};
