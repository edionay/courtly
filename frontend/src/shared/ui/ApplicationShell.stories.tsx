import type { Meta, StoryObj } from "@storybook/react-vite";
import { ApplicationShell } from "./ApplicationShell";

const meta = {
  title: "Foundation/Application shell",
  component: ApplicationShell,
  parameters: { layout: "fullscreen" },
  args: {
    navigation: [
      { label: "Courts", href: "/courts" },
      { label: "My bookings", href: "/bookings" },
    ],
    activeHref: "/courts",
    onSignOut: () => undefined,
    children: (
      <>
        <h1 className="page-heading">Courts</h1>
        <p className="page-description">Choose a court to see its availability.</p>
      </>
    ),
  },
} satisfies Meta<typeof ApplicationShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Courts: Story = {};

export const Administrator: Story = {
  args: {
    navigation: [
      { label: "Courts", href: "/courts" },
      { label: "My bookings", href: "/bookings" },
      { label: "Daily bookings", href: "/admin/bookings" },
    ],
  },
};
