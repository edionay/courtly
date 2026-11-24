import type { Meta, StoryObj } from "@storybook/react-vite";
import { AccessDeniedView } from "./AccessDeniedView";

const meta = {
  title: "Auth/Access denied",
  component: AccessDeniedView,
  parameters: { layout: "fullscreen" },
  args: {
    onReturn: () => undefined,
  },
} satisfies Meta<typeof AccessDeniedView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomMessage: Story = {
  args: {
    message: "Administrator privileges are required to view this report.",
  },
};
