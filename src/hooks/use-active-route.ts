"use client";

import { usePathname } from "next/navigation";

export function useActiveRoute() {
  const pathname = usePathname();

  return (href: string) =>
    href === "/" ? pathname === href : pathname.startsWith(href);
}
