"use client";

import { useState } from "react";
import { Layers, Plus, Settings } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  ENVIRONMENT_CLASSIFICATIONS,
  type EnvironmentClassification,
  type EnvironmentDTO,
} from "../types";

interface EnvironmentManagerDialogProps {
  organizationId: string;
  applicationId: string;
  environments: EnvironmentDTO[];
  onEnvironmentCreated: (env: EnvironmentDTO) => void;
  onEnvironmentArchived: (envId: string) => void;
}

export function EnvironmentManagerDialog({
  organizationId,
  applicationId,
  environments,
  onEnvironmentCreated,
  onEnvironmentArchived,
}: EnvironmentManagerDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [classification, setClassification] =
    useState<EnvironmentClassification>("custom");
  const [isProduction, setIsProduction] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/applications/${applicationId}/environments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            slug: slug.trim() || undefined,
            classification,
            isProduction,
          }),
        },
      );

      const json = await res.json();
      if (res.ok) {
        onEnvironmentCreated(json.data);
        setName("");
        setSlug("");
        setClassification("custom");
        setIsProduction(false);
      } else {
        setError(json.error || "Failed to create environment");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async (envId: string) => {
    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/applications/${applicationId}/environments/${envId}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        onEnvironmentArchived(envId);
      }
    } catch {
      // Ignored for fast optimistic update
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        variant="outline"
        className="h-8 gap-1.5 text-xs"
      >
        <Settings className="size-3.5" /> Manage Environments
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-background max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-lg border p-6 shadow-2xl">
            <div className="flex items-center gap-3 border-b pb-2">
              <div className="bg-primary/10 text-primary rounded-md p-2">
                <Layers className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold">
                  Environments Manager
                </h3>
                <p className="text-muted-foreground text-xs">
                  Configure and order operational contexts for this application.
                </p>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* List of current environments */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Active Environments ({environments.length})
              </Label>
              <div className="bg-card divide-y rounded-md border">
                {environments.map((env) => (
                  <div
                    key={env.id}
                    className="flex items-center justify-between p-3 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-semibold">
                        {env.name}
                      </span>
                      <span className="text-muted-foreground font-mono text-[11px]">
                        /{env.slug}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] capitalize"
                      >
                        {env.classification}
                      </Badge>
                      {env.isProduction && (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-500"
                        >
                          Production
                        </Badge>
                      )}
                    </div>

                    {environments.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchive(env.id)}
                        className="text-muted-foreground hover:text-destructive h-7 text-xs"
                      >
                        Archive
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form to add new environment */}
            <form onSubmit={handleCreate} className="space-y-3 border-t pt-2">
              <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Add New Environment
              </Label>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="new-env-name" className="text-xs">
                    Name *
                  </Label>
                  <Input
                    id="new-env-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. QA or Sandbox"
                    required
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="new-env-class" className="text-xs">
                    Classification
                  </Label>
                  <select
                    id="new-env-class"
                    value={classification}
                    onChange={(e) =>
                      setClassification(
                        e.target.value as EnvironmentClassification,
                      )
                    }
                    className="border-input bg-background text-foreground h-8 w-full rounded-md border px-2 text-xs focus:outline-none"
                  >
                    {ENVIRONMENT_CLASSIFICATIONS.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="new-env-prod"
                  checked={isProduction}
                  onCheckedChange={(c) => setIsProduction(Boolean(c))}
                />
                <Label
                  htmlFor="new-env-prod"
                  className="cursor-pointer text-xs font-normal"
                >
                  Designate as production environment
                </Label>
              </div>

              <div className="flex justify-end gap-2 border-t pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 text-xs"
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || !name.trim()}
                  className="h-8 gap-1 text-xs"
                >
                  <Plus className="size-3.5" />
                  {isSubmitting ? "Adding..." : "Add Environment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
