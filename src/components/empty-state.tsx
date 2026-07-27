import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <section className="bg-card flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center shadow-sm">
      <div className="bg-accent text-accent-foreground mb-4 flex size-11 items-center justify-center rounded-lg">
        <Icon aria-hidden="true" className="size-5" />
      </div>
      <h2 className="font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-6">
        {description}
      </p>
    </section>
  );
}
