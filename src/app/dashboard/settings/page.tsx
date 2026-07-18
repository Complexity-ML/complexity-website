"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { AlertTriangle, LogOut, Shield, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const user = session?.user;
  const rawId = (user as Record<string, unknown> | undefined)?.id as string | undefined;
  const maskedId = rawId
    ? rawId.replace(/^(.{8}).*(.{4})$/, "$1••••••$2")
    : undefined;

  const deleteAccount = async () => {
    if (deleteConfirmation !== "DELETE" || deleting) return;
    setDeleting(true);
    setDeleteError("");
    const response = await fetch("/api/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation: deleteConfirmation }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({})) as { error?: string };
      setDeleteError(body.error || "Account deletion failed.");
      setDeleting(false);
      return;
    }
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and security settings.
        </p>
      </div>

      {/* Profile */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="px-5 py-4 bg-card/50 border-b border-border">
          <p className="text-sm font-medium">Profile</p>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center gap-4">
            {user?.image && (
              <Image
                src={user.image}
                alt=""
                width={56}
                height={56}
                className="rounded-full"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="px-5 py-4 bg-card/50 border-b border-border flex items-center gap-2">
          <Shield className="size-4" />
          <p className="text-sm font-medium">Security</p>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm">User ID</span>
            <Badge variant="outline" className="font-mono text-xs">
              {maskedId}
            </Badge>
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground">
            Your account is secured via GitHub OAuth.
          </p>
        </div>
      </div>

      {/* Sign out */}
      <div className="rounded-lg border border-destructive/30 overflow-hidden">
        <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Sign out</p>
            <p className="text-xs text-muted-foreground">End your current session</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="size-4 mr-1.5" />
            Sign out
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-destructive/30 overflow-hidden">
        <div className="border-b border-destructive/20 bg-destructive/5 px-5 py-4">
          <div className="flex items-center gap-2 text-destructive"><AlertTriangle className="size-4" /><p className="text-sm font-medium">Delete account</p></div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">Permanently removes your encrypted provider keys, API keys, sessions and cloud workspace data. Local LABO presets remain in this browser until you clear them.</p>
        </div>
        <div className="space-y-3 px-5 py-4">
          <label className="text-xs text-muted-foreground" htmlFor="delete-account-confirmation">Type <span className="font-mono text-foreground">DELETE</span> to confirm</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input id="delete-account-confirmation" value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} className="h-9 flex-1 rounded-md border border-border bg-background px-3 font-mono text-xs outline-none focus:border-destructive/60" />
            <Button variant="destructive" size="sm" disabled={deleteConfirmation !== "DELETE" || deleting} onClick={() => void deleteAccount()}>
              <Trash2 className="mr-1.5 size-4" />{deleting ? "Deleting…" : "Delete account"}
            </Button>
          </div>
          {deleteError && <p className="text-xs text-destructive">{deleteError}</p>}
        </div>
      </div>
    </div>
  );
}
