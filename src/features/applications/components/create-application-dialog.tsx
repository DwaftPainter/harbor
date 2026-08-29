"use client";

import { useState } from "react";
import { Boxes, Plus } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { ApplicationDetailDTO } from "../types";

interface CreateApplicationDialogProps {
  organizationId: string;
  onCreated: (app: ApplicationDetailDTO) => void;
}

export function CreateApplicationDialog({
  organizationId,
  onCreated,
}: CreateApplicationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [defaultEnvironments, setDefaultEnvironments] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/applications`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            slug: slug.trim() || undefined,
            description: description.trim() || undefined,
            defaultEnvironments,
          }),
        },
      );

      const json = await res.json();
      if (res.ok) {
        onCreated(json.data);
        setIsOpen(false);
        setName("");
        setSlug("");
        setDescription("");
      } else {
        setError(json.error || "Failed to create application");
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
        onClick={() => setIsOpen(true)}
        size="sm"
        className="gap-1.5 text-xs font-medium"
      >
        <Plus className="size-4" /> New Application
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-background w-full max-w-md space-y-4 rounded-lg border p-6 shadow-2xl">
            <div className="flex items-center gap-3 border-b pb-2">
              <div className="bg-primary/10 text-primary rounded-md p-2">
                <Boxes className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Create Application</h3>
                <p className="text-muted-foreground text-xs">
                  Group synchronized resources into a logical application.
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
                <Label htmlFor="app-name" className="text-xs">
                  Application Name *
                </Label>
                <Input
                  id="app-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. E-Commerce Core"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="app-slug" className="text-xs">
                  Custom URL Slug (optional)
                </Label>
                <Input
                  id="app-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. ecommerce-core"
                  className="h-9 font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="app-desc" className="text-xs">
                  Description (optional)
                </Label>
                <Input
                  id="app-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Primary storefront and backend API"
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="default-envs"
                  checked={defaultEnvironments}
                  onCheckedChange={(c) => setDefaultEnvironments(Boolean(c))}
                />
                <Label
                  htmlFor="default-envs"
                  className="cursor-pointer text-xs font-normal"
                >
                  Automatically create default environments (Production,
                  Staging, Development)
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
                  disabled={isSubmitting || !name.trim()}
                  className="h-8 text-xs"
                >
                  {isSubmitting ? "Creating..." : "Create Application"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
