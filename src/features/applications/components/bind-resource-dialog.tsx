"use client";

import { useEffect, useState } from "react";
import { Link2, Plus } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ExternalResourceDTO } from "@/features/resources/types";

import type { EnvironmentDTO, ResourceBindingDTO } from "../types";

interface BindResourceDialogProps {
  organizationId: string;
  applicationId: string;
  environments: EnvironmentDTO[];
  selectedEnvironmentId?: string;
  onBound: (binding: ResourceBindingDTO) => void;
}

export function BindResourceDialog({
  organizationId,
  applicationId,
  environments,
  selectedEnvironmentId,
  onBound,
}: BindResourceDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetEnvId, setTargetEnvId] = useState(
    selectedEnvironmentId || environments[0]?.id || "",
  );
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [availableResources, setAvailableResources] = useState<
    ExternalResourceDTO[]
  >([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let ignore = false;

    async function loadResources() {
      try {
        const res = await fetch(
          `/api/organizations/${organizationId}/resources?pageSize=100`,
        );
        if (!ignore) {
          const json = await res.json();
          if (res.ok) {
            setAvailableResources(json.data || []);
            if (json.data?.[0]?.id && !selectedResourceId) {
              setSelectedResourceId(json.data[0].id);
            }
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Failed to load resources",
          );
        }
      } finally {
        if (!ignore) {
          setIsLoadingResources(false);
        }
      }
    }

    loadResources();

    return () => {
      ignore = true;
    };
  }, [isOpen, organizationId, selectedResourceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEnvId || !selectedResourceId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/applications/${applicationId}/bindings`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            environmentId: targetEnvId,
            resourceId: selectedResourceId,
            isPrimary,
            bindingSource: "manual",
          }),
        },
      );

      const json = await res.json();
      if (res.ok) {
        onBound(json.data);
        setIsOpen(false);
      } else {
        setError(json.error || "Failed to bind resource");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => {
          setTargetEnvId(selectedEnvironmentId || environments[0]?.id || "");
          setIsOpen(true);
        }}
        size="sm"
        variant="outline"
        className="h-8 gap-1.5 text-xs"
      >
        <Plus className="size-3.5" /> Bind Resource
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-background w-full max-w-md space-y-4 rounded-lg border p-6 shadow-2xl">
            <div className="flex items-center gap-3 border-b pb-2">
              <div className="bg-primary/10 text-primary rounded-md p-2">
                <Link2 className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Bind Cloud Resource</h3>
                <p className="text-muted-foreground text-xs">
                  Attach an external cloud resource to an operational
                  environment.
                </p>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="target-env" className="text-xs">
                  Target Environment *
                </Label>
                <select
                  id="target-env"
                  value={targetEnvId}
                  onChange={(e) => setTargetEnvId(e.target.value)}
                  className="border-input bg-background text-foreground focus:ring-ring h-9 w-full rounded-md border px-2.5 text-xs focus:ring-1 focus:outline-none"
                >
                  {environments.map((env) => (
                    <option key={env.id} value={env.id}>
                      {env.name} ({env.classification})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="target-resource" className="text-xs">
                  Select Resource *
                </Label>
                {isLoadingResources ? (
                  <div className="text-muted-foreground rounded-md border p-3 text-center text-xs">
                    Loading cloud resources...
                  </div>
                ) : availableResources.length === 0 ? (
                  <div className="text-muted-foreground rounded-md border p-3 text-center text-xs">
                    No resources found. Synchronize a cloud connection first.
                  </div>
                ) : (
                  <select
                    id="target-resource"
                    value={selectedResourceId}
                    onChange={(e) => setSelectedResourceId(e.target.value)}
                    className="border-input bg-background text-foreground focus:ring-ring h-9 w-full rounded-md border px-2.5 text-xs focus:ring-1 focus:outline-none"
                  >
                    {availableResources.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.providerId} • {r.resourceKind})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="is-primary"
                  checked={isPrimary}
                  onCheckedChange={(c) => setIsPrimary(Boolean(c))}
                />
                <Label
                  htmlFor="is-primary"
                  className="cursor-pointer text-xs font-normal"
                >
                  Mark as primary resource for this environment
                </Label>
              </div>

              <div className="flex justify-end gap-2 border-t pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="h-8 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || !selectedResourceId || !targetEnvId}
                  className="h-8 text-xs"
                >
                  {isSubmitting ? "Binding..." : "Confirm Binding"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
