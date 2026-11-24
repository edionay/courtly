import type { Meta, StoryObj } from "@storybook/react-vite";
import { AuthenticatedHandoffView } from "./AuthenticatedHandoffView";

const meta = {
  title: "Auth/Authenticated handoff",
  component: AuthenticatedHandoffView,
  parameters: { layout: "fullscreen" },
  args: {
    user: {
      id: "usr_alex_123",
      name: "Alex Morgan",
      role: "user",
    },
    onSignOut: () => undefined,
  },
} satisfies Meta<typeof AuthenticatedHandoffView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UserRole: Story = {};

export const AdminRole: Story = {
  args: {
    user: {
      id: "adm_jordan_456",
      name: "Jordan Lee",
      role: "admin",
    },
  },
};
