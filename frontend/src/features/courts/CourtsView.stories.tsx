import type { Meta, StoryObj } from "@storybook/react-vite";
import { CourtsView } from "./CourtsView";
import { courtFixtures } from "./fixtures";

const meta = {
  title: "Courts/Courts screen",
  component: CourtsView,
  parameters: { layout: "fullscreen" },
  args: {
    courts: courtFixtures,
    onSignOut: () => undefined,
    onRetry: () => undefined,
  },
} satisfies Meta<typeof CourtsView>;

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

export const ConnectionError: Story = {
  args: {
    errorMessage: "Could not connect to the server. Please check your connection.",
  },
};

export const Empty: Story = {
  args: {
    courts: [],
  },
};
