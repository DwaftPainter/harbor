"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Crown,
  Loader2,
  Mail,
  Plus,
  Trash2,
  UserX,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ORGANIZATION_ROLES,
  type OrganizationMemberWithUser,
  type OrganizationRole,
  type UserOrganization,
} from "@/features/organizations/types";

interface OrganizationSettingsProps {
  currentUserId: string;
  activeOrg: UserOrganization;
}

interface PendingInvite {
  id: string;
  email: string;
  role: OrganizationRole;
  expiresAt: string;
  createdAt: string;
  inviter: {
    name: string;
    email: string;
  };
}

export function OrganizationSettings({
  currentUserId,
  activeOrg,
}: OrganizationSettingsProps) {
  const router = useRouter();

  // State for Org Profile
  const [name, setName] = React.useState(activeOrg.name);
  const [slug, setSlug] = React.useState(activeOrg.slug);
  const [isUpdatingOrg, setIsUpdatingOrg] = React.useState(false);
  const [orgMessage, setOrgMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // State for Members & Invites
  const [members, setMembers] = React.useState<OrganizationMemberWithUser[]>(
    [],
  );
  const [invites, setInvites] = React.useState<PendingInvite[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = React.useState(true);
  const [membersError, setMembersError] = React.useState<string | null>(null);

  // Invite Form
  const [showInviteForm, setShowInviteForm] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] =
    React.useState<OrganizationRole>("member");
  const [isSendingInvite, setIsSendingInvite] = React.useState(false);
  const [inviteError, setInviteError] = React.useState<string | null>(null);

  // Transfer Ownership
  const [targetOwnerId, setTargetOwnerId] = React.useState("");
  const [isTransferring, setIsTransferring] = React.useState(false);
  const [transferError, setTransferError] = React.useState<string | null>(null);

  // Delete Org
  const [isDeletingOrg, setIsDeletingOrg] = React.useState(false);

  const isOwner = activeOrg.role === "owner";
  const isAdmin = activeOrg.role === "admin";
  const canManageMembers = isOwner || isAdmin;

  const loadData = React.useCallback(async () => {
    try {
      setIsLoadingMembers(true);
      setMembersError(null);

      const [membersRes, invitesRes] = await Promise.all([
        fetch(`/api/organizations/${activeOrg.id}/members`),
        canManageMembers
          ? fetch(`/api/organizations/${activeOrg.id}/invitations`)
          : Promise.resolve(null),
      ]);

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData.data || []);
      }

      if (invitesRes && invitesRes.ok) {
        const invitesData = await invitesRes.json();
        setInvites(invitesData.data || []);
      }
    } catch (err) {
      setMembersError("Failed to load organization members and invitations.");
      console.error(err);
    } finally {
      setIsLoadingMembers(false);
    }
  }, [activeOrg.id, canManageMembers]);

  React.useEffect(() => {
    let ignore = false;

    async function fetchInitialData() {
      try {
        const [membersRes, invitesRes] = await Promise.all([
          fetch(`/api/organizations/${activeOrg.id}/members`),
          canManageMembers
            ? fetch(`/api/organizations/${activeOrg.id}/invitations`)
            : Promise.resolve(null),
        ]);

        if (!ignore && membersRes.ok) {
          const membersData = await membersRes.json();
          setMembers(membersData.data || []);
        }

        if (!ignore && invitesRes && invitesRes.ok) {
          const invitesData = await invitesRes.json();
          setInvites(invitesData.data || []);
        }
      } catch (err) {
        if (!ignore) {
          setMembersError(
            "Failed to load organization members and invitations.",
          );
          console.error(err);
        }
      } finally {
        if (!ignore) {
          setIsLoadingMembers(false);
        }
      }
    }

    void fetchInitialData();

    return () => {
      ignore = true;
    };
  }, [activeOrg.id, canManageMembers]);

  async function handleUpdateOrg(e: React.FormEvent) {
    e.preventDefault();
    setOrgMessage(null);

    try {
      setIsUpdatingOrg(true);
      const res = await fetch(`/api/organizations/${activeOrg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update organization");
      }

      setOrgMessage({
        type: "success",
        text: "Organization updated successfully.",
      });
      router.refresh();
    } catch (err) {
      setOrgMessage({
        type: "error",
        text:
          err instanceof Error ? err.message : "Failed to update organization",
      });
    } finally {
      setIsUpdatingOrg(false);
    }
  }

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteError(null);

    try {
      setIsSendingInvite(true);
      const res = await fetch(
        `/api/organizations/${activeOrg.id}/invitations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send invitation");
      }

      setInviteEmail("");
      setShowInviteForm(false);
      await loadData();
    } catch (err) {
      setInviteError(
        err instanceof Error ? err.message : "Failed to send invitation",
      );
    } finally {
      setIsSendingInvite(false);
    }
  }

  async function handleRevokeInvite(invitationId: string) {
    try {
      const res = await fetch(
        `/api/organizations/${activeOrg.id}/invitations/${invitationId}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        throw new Error("Failed to revoke invitation");
      }

      await loadData();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRoleChange(memberId: string, newRole: OrganizationRole) {
    try {
      const res = await fetch(
        `/api/organizations/${activeOrg.id}/members/${memberId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update member role");
        return;
      }

      await loadData();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRemoveMember(memberId: string, isSelf: boolean) {
    const message = isSelf
      ? "Are you sure you want to leave this organization?"
      : "Are you sure you want to remove this member?";

    if (!confirm(message)) return;

    try {
      const res = await fetch(
        `/api/organizations/${activeOrg.id}/members/${memberId}`,
        { method: "DELETE" },
      );

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to remove member");
        return;
      }

      if (isSelf) {
        router.push("/");
        router.refresh();
      } else {
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleTransferOwnership() {
    if (!targetOwnerId) return;

    if (
      !confirm(
        "Are you sure you want to transfer primary ownership of this organization?",
      )
    ) {
      return;
    }

    try {
      setIsTransferring(true);
      setTransferError(null);

      const res = await fetch(
        `/api/organizations/${activeOrg.id}/transfer-ownership`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetUserId: targetOwnerId }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to transfer ownership");
      }

      await loadData();
      router.refresh();
    } catch (err) {
      setTransferError(
        err instanceof Error ? err.message : "Failed to transfer ownership",
      );
    } finally {
      setIsTransferring(false);
    }
  }

  async function handleDeleteOrg() {
    if (
      !confirm(
        `Are you sure you want to permanently delete "${activeOrg.name}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      setIsDeletingOrg(true);
      const res = await fetch(`/api/organizations/${activeOrg.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete organization");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeletingOrg(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* General Org Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>
                General settings for{" "}
                <span className="text-foreground font-semibold">
                  {activeOrg.name}
                </span>
                .
              </CardDescription>
            </div>
            <Badge variant="outline" className="capitalize">
              {activeOrg.role}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateOrg} className="space-y-4">
            {orgMessage && (
              <Alert
                variant={
                  orgMessage.type === "error" ? "destructive" : "default"
                }
              >
                <AlertDescription>{orgMessage.text}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-org-name">Organization Name</Label>
                <Input
                  id="edit-org-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!canManageMembers || isUpdatingOrg}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-org-slug">Slug Identifier</Label>
                <Input
                  id="edit-org-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  disabled={!canManageMembers || isUpdatingOrg}
                  required
                />
              </div>
            </div>

            {canManageMembers && (
              <div className="flex justify-end pt-2">
                <Button type="submit" size="sm" disabled={isUpdatingOrg}>
                  {isUpdatingOrg && (
                    <Loader2 className="mr-2 size-3.5 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Members & Roles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Members & Roles</CardTitle>
              <CardDescription>
                Manage who has access to this organization and their permission
                tier.
              </CardDescription>
            </div>
            {canManageMembers && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setShowInviteForm((prev) => !prev)}
              >
                <Plus className="size-3.5" />
                Invite Member
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {showInviteForm && (
            <div className="bg-muted/40 space-y-3 rounded-lg border p-4">
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <Mail className="text-primary size-4" />
                Invite New Member
              </h4>
              {inviteError && (
                <Alert variant="destructive">
                  <AlertDescription>{inviteError}</AlertDescription>
                </Alert>
              )}
              <form
                onSubmit={handleSendInvite}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <Input
                  type="email"
                  placeholder="collaborator@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={isSendingInvite}
                  required
                  className="flex-1"
                />
                <select
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as OrganizationRole)
                  }
                  disabled={isSendingInvite}
                  className="border-input bg-background focus-visible:ring-ring/50 h-9 rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                >
                  {ORGANIZATION_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInviteForm(false)}
                    disabled={isSendingInvite}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSendingInvite || !inviteEmail}
                  >
                    {isSendingInvite && (
                      <Loader2 className="mr-2 size-3.5 animate-spin" />
                    )}
                    Send Invite
                  </Button>
                </div>
              </form>
            </div>
          )}

          {membersError && (
            <Alert variant="destructive">
              <AlertDescription>{membersError}</AlertDescription>
            </Alert>
          )}

          {isLoadingMembers ? (
            <div className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-center text-sm">
              <Loader2 className="size-4 animate-spin" />
              Loading members...
            </div>
          ) : (
            <div className="divide-border divide-y">
              {members.map((m) => {
                const isSelf = m.userId === currentUserId;
                const initials =
                  m.user.name
                    .split(/\s+/)
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "U";

                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-4 py-3.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-foreground truncate text-sm leading-none font-medium">
                          {m.user.name}{" "}
                          {isSelf && (
                            <span className="text-muted-foreground text-xs">
                              (You)
                            </span>
                          )}
                        </p>
                        <p className="text-muted-foreground mt-1 truncate text-xs">
                          {m.user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {isOwner && !isSelf ? (
                        <select
                          value={m.role}
                          onChange={(e) =>
                            handleRoleChange(
                              m.id,
                              e.target.value as OrganizationRole,
                            )
                          }
                          className="border-input bg-background h-8 rounded-md border px-2.5 py-1 text-xs shadow-xs"
                        >
                          {ORGANIZATION_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r.charAt(0).toUpperCase() + r.slice(1)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Badge
                          variant={m.role === "owner" ? "default" : "outline"}
                          className="text-xs capitalize"
                        >
                          {m.role === "owner" && (
                            <Crown className="mr-1 size-3" />
                          )}
                          {m.role}
                        </Badge>
                      )}

                      {(canManageMembers || isSelf) && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          title={
                            isSelf ? "Leave organization" : "Remove member"
                          }
                          onClick={() => handleRemoveMember(m.id, isSelf)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <UserX className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pending Invitations */}
          {canManageMembers && invites.length > 0 && (
            <div className="space-y-3 pt-4">
              <Separator />
              <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Pending Invitations ({invites.length})
              </h4>
              <div className="divide-border divide-y">
                {invites.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between py-2.5 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="text-foreground truncate font-medium">
                        {inv.email}
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        Invited as{" "}
                        <span className="capitalize">{inv.role}</span> by{" "}
                        {inv.inviter.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] capitalize"
                      >
                        Pending
                      </Badge>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => handleRevokeInvite(inv.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        Revoke
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone (Owner Only) */}
      {isOwner && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="size-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions regarding ownership and deletion of this
              organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Transfer Ownership */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Transfer Ownership</h4>
              <p className="text-muted-foreground text-xs">
                Promote another active member to primary Organization Owner.
              </p>
              {transferError && (
                <Alert variant="destructive">
                  <AlertDescription>{transferError}</AlertDescription>
                </Alert>
              )}
              <div className="flex gap-3">
                <select
                  value={targetOwnerId}
                  onChange={(e) => setTargetOwnerId(e.target.value)}
                  disabled={isTransferring}
                  className="border-input bg-background h-9 flex-1 rounded-md border px-3 py-1 text-sm"
                >
                  <option value="">
                    Select a member to transfer ownership to...
                  </option>
                  {members
                    .filter((m) => m.userId !== currentUserId)
                    .map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.user.name} ({m.user.email})
                      </option>
                    ))}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isTransferring || !targetOwnerId}
                  onClick={handleTransferOwnership}
                >
                  {isTransferring && (
                    <Loader2 className="mr-2 size-3.5 animate-spin" />
                  )}
                  Transfer Ownership
                </Button>
              </div>
            </div>

            <Separator />

            {/* Delete Organization */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <h4 className="text-destructive text-sm font-semibold">
                  Delete Organization
                </h4>
                <p className="text-muted-foreground text-xs">
                  Permanently delete this organization and revoke all member
                  access.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeletingOrg}
                onClick={handleDeleteOrg}
              >
                {isDeletingOrg ? (
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="mr-1.5 size-3.5" />
                )}
                Delete Organization
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
