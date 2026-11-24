import type { Meta, StoryObj } from "@storybook/react-vite";
import { CourtGrid } from "./CourtGrid";
import { courtFixtures } from "./fixtures";

const meta = {
  title: "Courts/Court grid",
  component: CourtGrid,
  parameters: { layout: "fullscreen" },
  args: { courts: courtFixtures, onViewAvailability: () => undefined },
} satisfies Meta<typeof CourtGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SportsAndFallback: Story = {};
