import { Boxes, Cable, LayoutDashboard, Rocket, Settings } from "lucide-react";

import type { NavigationItem } from "@/types/navigation";

export const navigationItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Applications",
    href: "/applications",
    icon: Boxes,
  },
  {
    label: "Deployments",
    href: "/deployments",
    icon: Rocket,
  },
  {
    label: "Connections",
    href: "/connections",
    icon: Cable,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
] as const satisfies ReadonlyArray<NavigationItem>;
