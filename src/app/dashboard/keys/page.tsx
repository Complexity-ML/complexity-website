"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Copy, Check, Key, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface KeyData {
  api_key: string;
  user_id: string;
  prefix: string;
}

export default function KeysPage() {
  const { data: session } = useSession();
  const [keyData, setKeyData] = useState<KeyData | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const userId = (session?.user as Record<string, unknown> | undefined)?.id as string | undefined;

  const revealKey = async () => {
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">API Keys</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Use this key to access the vllm-i64 API directly.
        </p>
      </div>

      {/* Key card */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between bg-card/50">
          <div className="flex items-center gap-3">
            <Key className="size-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Default key</p>
              <p className="text-xs text-muted-foreground">
                Deterministic — always the same for your account
              </p>
            </div>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {userId ? `${userId.slice(0, 16)}...` : "—"}
          </Badge>
        </div>

        <Separator />

        <div className="px-5 py-4 space-y-4">
          {keyData && showKey ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-3 py-2.5 rounded-md text-xs font-mono break-all select-all">
                  {keyData.api_key}
                </code>
                <Button variant="outline" size="icon" className="shrink-0" onClick={() => setShowKey(false)}>
                  <EyeOff className="size-4" />
                </Button>
                <Button variant="outline" size="icon" className="shrink-0" onClick={copyKey}>
                  {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Keep this key secret. Do not share it or commit it to version control.
              </p>
            </div>
          ) : keyData ? (
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted px-3 py-2.5 rounded-md text-xs font-mono text-muted-foreground">
                {keyData.prefix}{"•".repeat(26)}
              </code>
              <Button variant="outline" size="icon" className="shrink-0" onClick={() => setShowKey(true)}>
                <Eye className="size-4" />
              </Button>
              <Button variant="outline" size="icon" className="shrink-0" onClick={copyKey}>
                {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
              </Button>
            </div>
          ) : (
            <Button onClick={revealKey} disabled={loading} variant="outline" className="gap-2">
              <Key className="size-4" />
              {loading ? "Loading..." : "Reveal API Key"}
            </Button>
          )}
        </div>
      </div>

      {/* Usage example */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium">Usage</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-2 bg-card/50 border-b border-border">
            <span className="text-xs font-mono text-muted-foreground">cURL</span>
          </div>
          <pre className="px-4 py-3 text-xs font-mono overflow-x-auto">{`curl -X POST https://api.complexity.ml/v1/chat/completions \\
  -H "Authorization: Bearer sk-i64-..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "pacific-prime-chat",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": true
  }'`}</pre>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-2 bg-card/50 border-b border-border">
            <span className="text-xs font-mono text-muted-foreground">TypeScript</span>
          </div>
          <pre className="px-4 py-3 text-xs font-mono overflow-x-auto">{`import { I64Client } from "vllm-i64";

const client = new I64Client({ apiKey: "sk-i64-..." });

const stream = client.chat.stream({
  messages: [{ role: "user", content: "Hello" }],
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
}`}</pre>
        </div>
      </div>
    </div>
  );
}
