import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

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
    <Card className="min-h-80 border-dashed py-0">
      <CardContent className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="bg-accent text-accent-foreground mb-4 flex size-11 items-center justify-center rounded-lg">
          <Icon aria-hidden="true" className="size-5" />
        </div>
        <h2 className="font-semibold">{title}</h2>
        <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-6">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
