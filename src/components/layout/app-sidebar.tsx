"use client";

import Link from "next/link";

import { navigationItems } from "@/config/navigation";
import { useActiveRoute } from "@/hooks/use-active-route";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const isActiveRoute = useActiveRoute();

  return (
    <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border z-20 border-b md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-r md:border-b-0">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <div className="bg-primary flex size-8 items-center justify-center rounded-lg text-sm font-semibold text-white">
          H
        </div>
        <div>
          <p className="text-sm font-semibold">Harbor</p>
          <p className="text-xs text-slate-400">Cloud control plane</p>
        </div>
      </div>

      <nav
        aria-label="Primary navigation"
        className="flex gap-1 overflow-x-auto p-3 md:flex-col md:p-4"
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex shrink-0 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
              )}
            >
              <Icon aria-hidden="true" className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
