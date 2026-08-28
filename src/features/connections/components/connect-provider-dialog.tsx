"use client";

import { useState } from "react";
import {
  AlertCircle,
  Database,
  ExternalLink,
  Globe,
  Loader2,
  Plus,
  Server,
  Shield,
  X,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { PROVIDER_CATALOG } from "../providers/catalog";
import type { ProviderDescriptor, ProviderId } from "../types";

interface ConnectProviderDialogProps {
  organizationId: string;
  onSuccess: () => void;
}

export function ConnectProviderDialog({
  organizationId,
  onSuccess,
}: ConnectProviderDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderDescriptor>(
    PROVIDER_CATALOG[0]!,
  );
  const [name, setName] = useState("");
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setCredentials({});
    setError(null);
  };

  const handleOpen = () => {
    resetForm();
    setName(`${selectedProvider.name} Connection`);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  const handleProviderSelect = (provider: ProviderDescriptor) => {
    setSelectedProvider(provider);
    setName(`${provider.name} Connection`);
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
        `/api/organizations/${organizationId}/connections`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            providerId: selectedProvider.id,
            name: name.trim() || `${selectedProvider.name} Connection`,
            credentials,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to establish connection");
      }

      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (id: ProviderId) => {
    switch (id) {
      case "neon":
      case "supabase":
        return <Database className="size-5" />;
      case "vercel":
        return <Globe className="size-5" />;
      case "render":
      case "railway":
        return <Server className="size-5" />;
      case "cloudflare":
        return <Shield className="size-5" />;
      default:
        return <Server className="size-5" />;
    }
  };

  return (
    <>
      <Button onClick={handleOpen} className="gap-2">
        <Plus className="size-4" />
        Connect Provider
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">
                  Connect Cloud Provider
                </h3>
                <p className="text-muted-foreground text-sm">
                  Grant Harbor read-only or scoped access to discover and
                  synchronize resources.
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
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Provider Selection Grid */}
              <div className="space-y-2">
                <Label>Select Provider</Label>
                <div className="grid grid-cols-3 gap-3">
                  {PROVIDER_CATALOG.map((provider) => {
                    const isSelected = selectedProvider.id === provider.id;
                    return (
                      <Card
                        key={provider.id}
                        className={`hover:border-primary/50 cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-primary ring-1"
                            : ""
                        }`}
                        onClick={() => handleProviderSelect(provider)}
                      >
                        <CardContent className="flex flex-col items-center gap-2 p-3 text-center">
                          <div
                            className={`rounded-md p-2 ${
                              isSelected
                                ? "bg-primary/20 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {getIcon(provider.id)}
                          </div>
                          <div className="text-xs font-semibold">
                            {provider.name}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Provider Overview and Docs Link */}
              <div className="bg-muted/40 space-y-2 rounded-lg border p-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-semibold">
                    {selectedProvider.name} Setup
                  </span>
                  <a
                    href={selectedProvider.docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary inline-flex items-center gap-1 hover:underline"
                  >
                    API Documentation <ExternalLink className="size-3" />
                  </a>
                </div>
                <p className="text-muted-foreground">
                  {selectedProvider.description}
                </p>
                <div className="text-muted-foreground">
                  <span className="text-foreground font-medium">
                    Required Scopes:
                  </span>{" "}
                  {selectedProvider.requiredScopes.join(", ")}
                </div>
              </div>

              {/* Connection Name */}
              <div className="space-y-2">
                <Label htmlFor="conn-name">Connection Name</Label>
                <Input
                  id="conn-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Production Neon, Vercel Main"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Dynamic Credential Fields */}
              {selectedProvider.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`field-${field.key}`}>{field.label}</Label>
                    {!field.required && (
                      <span className="text-muted-foreground text-xs">
                        Optional
                      </span>
                    )}
                  </div>
                  <Input
                    id={`field-${field.key}`}
                    type={field.type}
                    value={credentials[field.key] || ""}
                    onChange={(e) =>
                      handleFieldChange(field.key, e.target.value)
                    }
                    placeholder={field.placeholder}
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
                  Save & Validate Connection
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
