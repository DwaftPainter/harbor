"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slugify } from "@/features/organizations/slug";

export function CreateOrgForm() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [slugEdited, setSlugEdited] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setName(val);
    if (!slugEdited) {
      setSlug(slugify(val));
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugEdited(true);
    setSlug(
      e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 48),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("Organization name must be at least 2 characters.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create organization");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create organization",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="org-name">Organization Name</Label>
        <Input
          id="org-name"
          type="text"
          placeholder="Acme Corp"
          value={name}
          onChange={handleNameChange}
          disabled={isSubmitting}
          required
          autoFocus
        />
        <p className="text-muted-foreground text-xs">
          The public display name for your team or organization.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="org-slug">Organization Slug</Label>
        <Input
          id="org-slug"
          type="text"
          placeholder="acme-corp"
          value={slug}
          onChange={handleSlugChange}
          disabled={isSubmitting}
        />
        <p className="text-muted-foreground text-xs">
          Unique URL identifier:{" "}
          <span className="text-foreground font-mono">
            harbor.app/{slug || "your-slug"}
          </span>
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || name.trim().length < 2}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Building2 className="mr-2 size-4" />
              Create Organization
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
