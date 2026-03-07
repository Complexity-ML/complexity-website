"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { LogOut, Shield, Key, Copy, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const rawId = (user as Record<string, unknown> | undefined)?.id as string | undefined;
  const maskedId = rawId
    ? rawId.replace(/^(.{8}).*(.{4})$/, "$1••••••$2")
    : undefined;

  const [keyPrefix, setKeyPrefix] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/keys")
      .then((r) => r.json())
      .then((data) => {
        if (data.has_key) setKeyPrefix(data.prefix);
      })
      .catch(() => {});
  }, []);

  const regenerate = useCallback(async () => {
    if (!confirm("Regenerate your API key? The old key will stop working immediately.")) return;
    setLoading(true);
    setNewKey(null);
    try {
      const res = await fetch("/api/keys", { method: "POST" });
      const data = await res.json();
      if (data.api_key) {
        setNewKey(data.api_key);
        setKeyPrefix(data.prefix);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const copyKey = useCallback(() => {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [newKey]);

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
              {maskedId}
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

      {/* API Key */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="px-5 py-4 bg-card/50 border-b border-border flex items-center gap-2">
          <Key className="size-4" />
          <p className="text-sm font-medium">API Key</p>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Current key</p>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                {keyPrefix ?? "No key generated"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={regenerate}
              disabled={loading}
            >
              <RefreshCw className={`size-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              {keyPrefix ? "Regenerate" : "Generate"}
            </Button>
          </div>

          {newKey && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs text-amber-500 font-medium">
                  Save this key now — it won&apos;t be shown again.
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted px-3 py-2 rounded font-mono break-all">
                    {newKey}
                  </code>
                  <Button variant="outline" size="sm" onClick={copyKey}>
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </Button>
                </div>
              </div>
            </>
          )}

          <Separator />
          <p className="text-xs text-muted-foreground">
            Regenerating your key invalidates the old one and changes your partition.
            Use this key as <code className="text-xs">Authorization: Bearer i64_...</code> header.
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
