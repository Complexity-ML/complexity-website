"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Copy, Check, Key, User, Shield, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface KeyData {
  api_key: string;
  user_id: string;
  prefix: string;
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [keyData, setKeyData] = useState<KeyData | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const generateKey = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/keys");
      if (res.ok) {
        const data = await res.json();
        setKeyData(data);
        setShowKey(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyKey = () => {
    if (keyData) {
      navigator.clipboard.writeText(keyData.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const user = session?.user;
  const userId = (user as Record<string, unknown> | undefined)?.id as string | undefined;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/demo">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Account</h1>
            <p className="text-sm text-muted-foreground">Manage your profile and API keys</p>
          </div>
        </div>

        <Separator />

        {/* Profile */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <User className="size-4" />
            Profile
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
            {user?.image && (
              <Image
                src={user.image}
                alt=""
                width={48}
                height={48}
                className="rounded-full"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut className="size-4 mr-1.5" />
              Sign out
            </Button>
          </div>
        </section>

        <Separator />

        {/* Security */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Shield className="size-4" />
            Security
          </div>
          <div className="p-4 rounded-lg border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">User ID</span>
              <Badge variant="outline" className="font-mono text-xs">
                {userId}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Partition</span>
              <Badge variant="outline" className="font-mono text-xs">
                sha256(api_key || user_id) mod 64
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Your data is isolated via token-routed partitions. No cross-user access path exists.
            </p>
          </div>
        </section>

        <Separator />

        {/* API Keys */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Key className="size-4" />
            API Key
          </div>
          <div className="p-4 rounded-lg border border-border space-y-4">
            <p className="text-sm text-muted-foreground">
              Use this key to access the vllm-i64 API directly. Your key is deterministic — it is always the same for your account.
            </p>

            {keyData && showKey ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-3 py-2 rounded text-xs font-mono break-all">
                    {keyData.api_key}
                  </code>
                  <Button variant="outline" size="icon" onClick={copyKey}>
                    {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Keep this key secret. Do not share it or commit it to code.
                </p>
              </div>
            ) : (
              <Button onClick={generateKey} disabled={loading} variant="outline" className="gap-2">
                <Key className="size-4" />
                {loading ? "Generating..." : "Reveal API Key"}
              </Button>
            )}

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium">Usage</p>
              <pre className="bg-muted p-3 rounded text-xs font-mono overflow-x-auto">{`curl -X POST https://your-server/v1/chat/completions \\
  -H "Authorization: Bearer sk-i64-..." \\
  -H "Content-Type: application/json" \\
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'`}</pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
