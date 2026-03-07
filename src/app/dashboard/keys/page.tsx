"use client";

import { useState, useEffect, useCallback } from "react";
import { Copy, Check, Key, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function KeysPage() {
  const [prefix, setPrefix] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/keys")
      .then((r) => r.json())
      .then((data) => {
        if (data.has_key) {
          setHasKey(true);
          setPrefix(data.prefix);
        }
      })
      .catch(() => {});
  }, []);

  const generate = useCallback(async () => {
    if (hasKey && !confirm("Regenerate your API key? The old key will stop working immediately and your partition will change.")) {
      return;
    }
    setLoading(true);
    setNewKey(null);
    try {
      const res = await fetch("/api/keys", { method: "POST" });
      const data = await res.json();
      if (data.api_key) {
        setNewKey(data.api_key);
        setPrefix(data.prefix);
        setHasKey(true);
      }
    } finally {
      setLoading(false);
    }
  }, [hasKey]);

  const copyKey = useCallback(() => {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [newKey]);

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
              <p className="text-sm font-medium">API Key</p>
              <p className="text-xs text-muted-foreground">
                {hasKey ? "Regenerating invalidates the old key and changes your partition." : "Generate a key to use the API."}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="px-5 py-4 space-y-4">
          {/* Current key prefix */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Current key</p>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                {prefix ?? "No key generated yet"}
              </p>
            </div>
            <Button onClick={generate} disabled={loading} variant="outline" size="sm" className="gap-2">
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              {hasKey ? "Regenerate" : "Generate"}
            </Button>
          </div>

          {/* New key display (shown once after generation) */}
          {newKey && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs text-amber-500 font-medium">
                  Save this key now — it won&apos;t be shown again.
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-3 py-2.5 rounded-md text-xs font-mono break-all select-all">
                    {newKey}
                  </code>
                  <Button variant="outline" size="icon" className="shrink-0" onClick={copyKey}>
                    {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                  </Button>
                </div>
              </div>
            </>
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
  -H "Authorization: Bearer i64_..." \\
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

const client = new I64Client("https://api.complexity.ml", {
  apiKey: "i64_...",
});

for await (const chunk of client.chat.stream(
  [{ role: "user", content: "Hello" }],
)) {
  process.stdout.write(chunk);
}`}</pre>
        </div>
      </div>
    </div>
  );
}
