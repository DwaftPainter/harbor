import { CircleHelp, Search } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/features/auth/components/sign-out-button";

interface HeaderProps {
  userEmail: string;
  userName: string;
}

export function Header({ userEmail, userName }: HeaderProps) {
  const initials =
    userName
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <header className="bg-background/95 sticky top-0 z-10 flex h-16 items-center justify-between border-b px-4 backdrop-blur md:px-8">
      <div className="text-muted-foreground hidden items-center gap-2 text-sm sm:flex">
        <Search aria-hidden="true" className="size-4" />
        <span>Search resources</span>
        <kbd className="bg-muted ml-3 rounded border px-1.5 py-0.5 font-mono text-xs">
          ⌘K
        </kbd>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="hidden text-right sm:block">
          <p className="max-w-40 truncate text-xs font-medium">{userName}</p>
          <p className="text-muted-foreground max-w-48 truncate text-xs">
            {userEmail}
          </p>
        </div>
        <Button aria-label="Help" size="icon-sm" type="button" variant="ghost">
          <CircleHelp aria-hidden="true" className="size-4" />
        </Button>
        <SignOutButton />
      </div>
    </header>
  );
}
