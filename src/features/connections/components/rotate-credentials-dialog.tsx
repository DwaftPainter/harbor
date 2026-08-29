"use client";

import { useState } from "react";
import { AlertCircle, Key, Loader2, X } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { getProviderDescriptor } from "../providers/catalog";
import type { ProviderConnectionDTO } from "../types";

interface RotateCredentialsDialogProps {
  organizationId: string;
  connection: ProviderConnectionDTO;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function RotateCredentialsDialog({
  organizationId,
  connection,
  onSuccess,
  trigger,
}: RotateCredentialsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const descriptor = getProviderDescriptor(connection.providerId);

  const handleOpen = () => {
    setCredentials({});
    setError(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setCredentials({});
    setError(null);
  };

  const handleFieldChange = (key: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/connections/${connection.id}/rotate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credentials }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to rotate credentials");
      }

      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rotation failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {trigger ? (
        <span onClick={handleOpen}>{trigger}</span>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpen}
          className="gap-2"
        >
          <Key className="size-4" />
          Rotate
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">
                  Rotate Credentials
                </h3>
                <p className="text-muted-foreground text-sm">
                  Update secrets for{" "}
                  <span className="text-foreground font-medium">
                    {connection.name}
                  </span>
                  .
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                disabled={isLoading}
              >
                <X className="size-4" />
              </Button>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="size-4" />
                <AlertTitle>Rotation Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {descriptor?.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={`rotate-${field.key}`}>{field.label}</Label>
                  <Input
                    id={`rotate-${field.key}`}
                    type={field.type}
                    value={credentials[field.key] || ""}
                    onChange={(e) =>
                      handleFieldChange(field.key, e.target.value)
                    }
                    placeholder={`New ${field.placeholder || field.label}`}
                    required={field.required !== false}
                    disabled={isLoading}
                  />
                  {field.helpText && (
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {field.helpText}
                    </p>
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-3 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="gap-2">
                  {isLoading && <Loader2 className="size-4 animate-spin" />}
                  Encrypt & Update
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
