"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const userId = (user as Record<string, unknown> | undefined)?.id as string | undefined;

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
          <div className="flex items-center justify-between">
            <span className="text-sm">User ID</span>
            <Badge variant="outline" className="font-mono text-xs">
              {userId}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm">Partition</span>
            <Badge variant="outline" className="font-mono text-xs">
              sha256(api_key || user_id) mod 64
            </Badge>
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground">
            Your data is isolated via token-routed partitions. No cross-user access path exists.
          </p>
        </div>
      </div>

      {/* Sign out */}
      <div className="rounded-lg border border-destructive/30 overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between">
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
    </div>
  );
}
