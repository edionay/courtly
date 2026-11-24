import type { Meta, StoryObj } from "@storybook/react-vite";
import { AuthenticationErrorView } from "./AuthenticationErrorView";

const meta = {
  title: "Auth/Authentication error",
  component: AuthenticationErrorView,
  parameters: { layout: "fullscreen" },
  args: {
    onGoToLogin: () => undefined,
  },
} satisfies Meta<typeof AuthenticationErrorView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomMessage: Story = {
  args: {
    message: "Your session has expired. Please sign in again.",
  },
};
