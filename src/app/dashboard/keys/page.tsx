"use client";

import { useState, useEffect, useCallback } from "react";
import { Copy, Check, Key, RefreshCw, Eye, EyeOff, Plus, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function KeysPage() {
  const [prefix, setPrefix] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [fullKey, setFullKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [revealing, setRevealing] = useState(false);

  // External keys state
  type ExtKey = { provider: string; prefix: string; api_key?: string; created_at: string };
  const [extKeys, setExtKeys] = useState<ExtKey[]>([]);
  const [extRevealing, setExtRevealing] = useState<string | null>(null);
  const [addingProvider, setAddingProvider] = useState<string | null>(null);
  const [newExtKey, setNewExtKey] = useState("");
  const [extLoading, setExtLoading] = useState(false);

  const PROVIDERS: Record<string, { label: string; placeholder: string }> = {
    openai: { label: "OpenAI", placeholder: "sk-..." },
    anthropic: { label: "Anthropic", placeholder: "sk-ant-..." },
    google: { label: "Google AI", placeholder: "AIza..." },
    mistral: { label: "Mistral", placeholder: "..." },
  };

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
    fetch("/api/keys/external")
      .then((r) => r.json())
      .then((data) => { if (data.keys) setExtKeys(data.keys); })
      .catch(() => {});
  }, []);

  const revealKey = useCallback(async () => {
    if (fullKey) {
      setShowKey(true);
      return;
    }
    setRevealing(true);
    try {
      const res = await fetch("/api/keys?reveal=true");
      const data = await res.json();
      if (data.api_key) {
        setFullKey(data.api_key);
        setShowKey(true);
      }
    } finally {
      setRevealing(false);
    }
  }, [fullKey]);

  const regenerate = useCallback(async () => {
    if (!confirm("Regenerate your API key? The old key will stop working immediately and your partition will change.")) {
      return;
    }
    setLoading(true);
    setFullKey(null);
    setShowKey(false);
    try {
      const res = await fetch("/api/keys", { method: "POST" });
      const data = await res.json();
      if (data.api_key) {
        setFullKey(data.api_key);
        setPrefix(data.prefix);
        setHasKey(true);
        setShowKey(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const copyKey = useCallback(() => {
    if (!fullKey) return;
    navigator.clipboard.writeText(fullKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [fullKey]);

  const revealExtKey = useCallback(async (provider: string) => {
    // If already revealed, toggle off
    const existing = extKeys.find((k) => k.provider === provider);
    if (existing?.api_key) {
      setExtKeys((prev) => prev.map((k) => k.provider === provider ? { ...k, api_key: undefined } : k));
      return;
    }
    setExtRevealing(provider);
    try {
      const res = await fetch(`/api/keys/external?reveal=${provider}`);
      const data = await res.json();
      if (data.keys) setExtKeys(data.keys);
    } finally {
      setExtRevealing(null);
    }
  }, [extKeys]);

  const saveExtKey = useCallback(async (provider: string) => {
    if (!newExtKey.trim()) return;
    setExtLoading(true);
    try {
      const res = await fetch("/api/keys/external", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, api_key: newExtKey.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setExtKeys((prev) => {
          const filtered = prev.filter((k) => k.provider !== provider);
          return [...filtered, { provider: data.provider, prefix: data.prefix, created_at: new Date().toISOString() }];
        });
        setAddingProvider(null);
        setNewExtKey("");
      }
    } finally {
      setExtLoading(false);
    }
  }, [newExtKey]);

  const deleteExtKey = useCallback(async (provider: string) => {
    if (!confirm(`Remove your ${PROVIDERS[provider]?.label || provider} API key?`)) return;
    await fetch(`/api/keys/external?provider=${provider}`, { method: "DELETE" });
    setExtKeys((prev) => prev.filter((k) => k.provider !== provider));
  }, []);

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
                {hasKey ? "Your key is stored securely. You can reveal or regenerate it." : "Generate a key to use the API."}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="px-5 py-4 space-y-4">
          {hasKey ? (
            <>
              {/* Key display */}
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-3 py-2.5 rounded-md text-xs font-mono break-all select-all">
                  {showKey && fullKey ? fullKey : `${prefix}${"•".repeat(40)}`}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={showKey ? () => setShowKey(false) : revealKey}
                  disabled={revealing}
                >
                  {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
                {fullKey && (
                  <Button variant="outline" size="icon" className="shrink-0" onClick={copyKey}>
                    {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                  </Button>
                )}
              </div>

              {/* Regenerate */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Regenerating invalidates the old key and changes your partition.
                </p>
                <Button onClick={regenerate} disabled={loading} variant="outline" size="sm" className="gap-2 shrink-0">
                  <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
                  Regenerate
                </Button>
              </div>
            </>
          ) : (
            <Button onClick={regenerate} disabled={loading} variant="outline" className="gap-2">
              <Key className="size-4" />
              {loading ? "Generating..." : "Generate API Key"}
            </Button>
          )}
        </div>
      </div>

      {/* External API Keys */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between bg-card/50">
          <div className="flex items-center gap-3">
            <ExternalLink className="size-4 text-primary" />
            <div>
              <p className="text-sm font-medium">External API Keys</p>
              <p className="text-xs text-muted-foreground">
                Connect external providers to use their models through complexity.
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="px-5 py-4 space-y-3">
          {/* Existing external keys */}
          {extKeys.map((k) => (
            <div key={k.provider} className="flex items-center gap-2">
              <span className="text-sm font-medium w-24">{PROVIDERS[k.provider]?.label || k.provider}</span>
              <code className="flex-1 bg-muted px-3 py-2 rounded-md text-xs font-mono">
                {k.api_key || `${k.prefix}${"•".repeat(30)}`}
              </code>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => revealExtKey(k.provider)}
                disabled={extRevealing === k.provider}
              >
                {k.api_key ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 text-destructive hover:bg-destructive/10"
                onClick={() => deleteExtKey(k.provider)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}

          {/* Add new key form */}
          {addingProvider ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium w-24">{PROVIDERS[addingProvider]?.label}</span>
              <input
                type="password"
                className="flex-1 bg-muted px-3 py-2 rounded-md text-xs font-mono border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder={PROVIDERS[addingProvider]?.placeholder}
                value={newExtKey}
                onChange={(e) => setNewExtKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveExtKey(addingProvider)}
                autoFocus
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveExtKey(addingProvider)}
                disabled={extLoading || !newExtKey.trim()}
              >
                {extLoading ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setAddingProvider(null); setNewExtKey(""); }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(PROVIDERS)
                .filter(([id]) => !extKeys.some((k) => k.provider === id))
                .map(([id, { label }]) => (
                  <Button
                    key={id}
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setAddingProvider(id)}
                  >
                    <Plus className="size-3" />
                    {label}
                  </Button>
                ))}
              {extKeys.length === Object.keys(PROVIDERS).length && (
                <p className="text-xs text-muted-foreground">All providers configured.</p>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground pt-1">
            Keys are encrypted with AES-256-GCM and isolated by your partition. They never leave your account.
          </p>
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
