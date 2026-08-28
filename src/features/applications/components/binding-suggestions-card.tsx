"use client";

import { useState } from "react";
import { Check, Sparkles, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type {
  BindingSuggestionDTO,
  EnvironmentDTO,
  ResourceBindingDTO,
} from "../types";

interface BindingSuggestionsCardProps {
  organizationId: string;
  applicationId: string;
  suggestions: BindingSuggestionDTO[];
  environments: EnvironmentDTO[];
  onAccepted: (binding: ResourceBindingDTO) => void;
  onDismissed: (resourceId: string) => void;
}

export function BindingSuggestionsCard({
  organizationId,
  applicationId,
  suggestions,
  environments,
  onAccepted,
  onDismissed,
}: BindingSuggestionsCardProps) {
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  if (suggestions.length === 0) return null;

  const handleAccept = async (s: BindingSuggestionDTO) => {
    const targetEnv =
      environments.find((e) => e.slug === s.suggestedEnvironmentSlug) ||
      environments[0];

    if (!targetEnv) return;

    setAcceptingId(s.resourceId);

    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/applications/${applicationId}/bindings`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            environmentId: targetEnv.id,
            resourceId: s.resourceId,
            bindingSource: "suggested",
            isPrimary: false,
          }),
        },
      );

      const json = await res.json();
      if (res.ok) {
        onAccepted(json.data);
      }
    } catch {
      // Ignored for optimistic UI
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <Card className="border-sky-500/30 bg-sky-500/5 shadow-xs">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2 text-sky-500">
          <Sparkles className="size-4" />
          <h4 className="text-xs font-semibold tracking-wider uppercase">
            Suggested Resource Groupings ({suggestions.length})
          </h4>
        </div>
        <p className="text-muted-foreground text-xs">
          Harbor detected synchronized provider resources matching this
          application. Review and bind them to your operational environments.
        </p>

        <div className="space-y-2 pt-1">
          {suggestions.map((s) => (
            <div
              key={s.resourceId}
              className="bg-background flex flex-col items-start justify-between gap-3 rounded-lg border p-3 text-xs shadow-2xs sm:flex-row sm:items-center"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-semibold">
                    {s.resource.name}
                  </span>
                  <Badge variant="secondary" className="text-[10px] capitalize">
                    {s.resource.providerId} • {s.resource.resourceKind}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-sky-500/30 bg-sky-500/10 text-[10px] text-sky-500 capitalize"
                  >
                    Suggests: {s.suggestedEnvironmentSlug}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-[11px]">{s.reason}</p>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDismissed(s.resourceId)}
                  className="text-muted-foreground hover:text-foreground h-7 text-xs"
                >
                  <X className="mr-1 size-3.5" /> Dismiss
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAccept(s)}
                  disabled={acceptingId === s.resourceId}
                  className="h-7 gap-1 text-xs"
                >
                  <Check className="size-3.5" />
                  {acceptingId === s.resourceId ? "Binding..." : "Accept"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
