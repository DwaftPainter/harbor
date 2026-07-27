import { CircleHelp, Search } from "lucide-react";

export function Header() {
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
        <span className="text-muted-foreground hidden text-xs sm:inline">
          Foundation
        </span>
        <button
          type="button"
          aria-label="Help"
          className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-2 transition-colors"
        >
          <CircleHelp aria-hidden="true" className="size-4" />
        </button>
      </div>
    </header>
  );
}
