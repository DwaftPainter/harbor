import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState() {
  return (
    <div aria-label="Loading page" aria-live="polite" className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}
