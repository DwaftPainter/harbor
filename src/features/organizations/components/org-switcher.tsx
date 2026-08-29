"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Check, ChevronsUpDown, Plus, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UserOrganization } from "@/features/organizations/types";
import { cn } from "@/lib/utils";

interface OrgSwitcherProps {
  activeOrg: UserOrganization | null;
  organizations: UserOrganization[];
}

export function OrgSwitcher({ activeOrg, organizations }: OrgSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSwitching, setIsSwitching] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  async function handleSwitchOrg(orgId: string) {
    if (activeOrg?.id === orgId) {
      setIsOpen(false);
      return;
    }

    try {
      setIsSwitching(true);
      const res = await fetch("/api/organizations/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId }),
      });

      if (!res.ok) {
        throw new Error("Failed to switch organization");
      }

      setIsOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSwitching(false);
    }
  }

  if (!activeOrg && organizations.length === 0) {
    return (
      <Link href="/create-organization">
        <Button size="sm" variant="outline" className="gap-2 text-xs">
          <Plus className="size-3.5" />
          Create Organization
        </Button>
      </Link>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={isSwitching}
        onClick={() => setIsOpen((prev) => !prev)}
        className="border-border/80 bg-background/80 flex h-9 w-48 items-center justify-between gap-2 px-2.5 text-left backdrop-blur sm:w-56"
      >
        <div className="flex min-w-0 items-center gap-2">
          <div className="bg-primary/10 text-primary flex size-5.5 shrink-0 items-center justify-center rounded text-xs font-semibold">
            {activeOrg?.name.charAt(0).toUpperCase() || "O"}
          </div>
          <div className="min-w-0 flex-1 truncate">
            <span className="text-foreground block truncate text-xs leading-tight font-semibold">
              {activeOrg?.name ?? "Select organization"}
            </span>
            <span className="text-muted-foreground block truncate text-[10px]">
              {activeOrg?.role ? `${activeOrg.role}` : ""}
            </span>
          </div>
        </div>
        <ChevronsUpDown className="text-muted-foreground size-3.5 shrink-0" />
      </Button>

      {isOpen && (
        <div
          role="listbox"
          className="bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 absolute top-full left-0 z-50 mt-1.5 w-64 rounded-md border p-1 shadow-lg"
        >
          <div className="text-muted-foreground px-2 py-1.5 text-[11px] font-semibold tracking-wider uppercase">
            Organizations
          </div>
          <div className="max-h-60 space-y-0.5 overflow-y-auto">
            {organizations.map((org) => {
              const isSelected = activeOrg?.id === org.id;

              return (
                <button
                  key={org.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSwitchOrg(org.id)}
                  className={cn(
                    "hover:bg-accent hover:text-accent-foreground flex w-full cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-xs font-medium transition-colors",
                    isSelected && "bg-accent/60 font-semibold",
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Building2 className="text-muted-foreground size-3.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-foreground truncate text-xs">
                        {org.name}
                      </p>
                      <p className="text-muted-foreground truncate text-[10px]">
                        {org.slug} • {org.memberCount} member
                        {org.memberCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className="px-1.5 py-0 text-[10px] capitalize"
                    >
                      {org.role}
                    </Badge>
                    {isSelected && (
                      <Check className="text-primary size-3.5 shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="border-border my-1 border-t" />

          <Link
            href="/create-organization"
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs transition-colors"
          >
            <Plus className="size-3.5" />
            <span>Create new organization</span>
          </Link>
          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs transition-colors"
          >
            <Shield className="size-3.5" />
            <span>Organization settings</span>
          </Link>
        </div>
      )}
    </div>
  );
}
