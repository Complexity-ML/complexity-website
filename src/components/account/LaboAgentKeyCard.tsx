"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Eye, EyeOff, ExternalLink, KeyRound, LoaderCircle, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type KeyStatus = {
  configured: boolean;
  prefix?: string;
};

type Feedback = {
  tone: "success" | "error" | "muted";
  text: string;
};

export default function LaboAgentKeyCard() {
  const [status, setStatus] = useState<KeyStatus | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState<"save" | "test" | "remove" | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    void fetch("/api/labo/key")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load the key status.");
        return response.json() as Promise<KeyStatus>;
      })
      .then(setStatus)
      .catch((error: Error) => {
        setStatus({ configured: false });
        setFeedback({ tone: "error", text: error.message });
      });
  }, []);

  const testConnection = async (successText = "Connection verified. LABO AI web is ready.") => {
    setBusy("test");
    setFeedback({ tone: "muted", text: "Testing the encrypted key with OpenAI…" });
    const response = await fetch("/api/labo/key/test", { method: "POST" });
    const body = await response.json().catch(() => ({})) as { error?: string };
    if (response.ok) {
      setFeedback({ tone: "success", text: successText });
    } else {
      setFeedback({ tone: "error", text: body.error || "OpenAI rejected the connection test." });
    }
    setBusy(null);
    return response.ok;
  };

  const saveKey = async () => {
    const value = apiKey.trim();
    if (!value || busy) return;
    setBusy("save");
    setFeedback({ tone: "muted", text: "Encrypting and saving the key…" });
    const response = await fetch("/api/labo/key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: value }),
    });
    const body = await response.json().catch(() => ({})) as KeyStatus & { error?: string };
    if (!response.ok) {
      setFeedback({ tone: "error", text: body.error || "The key could not be saved." });
      setBusy(null);
      return;
    }
    setStatus({ configured: true, prefix: body.prefix });
    setApiKey("");
    setShowKey(false);
    setEditing(false);
    setBusy(null);
    await testConnection("Key saved, synchronized and verified with OpenAI.");
  };

  const removeKey = async () => {
    if (busy || !window.confirm("Remove the OpenAI key used by LABO AI web?")) return;
    setBusy("remove");
    setFeedback({ tone: "muted", text: "Removing the encrypted key…" });
    const response = await fetch("/api/labo/key", { method: "DELETE" });
    if (response.ok) {
      setStatus({ configured: false });
      setApiKey("");
      setEditing(false);
      setFeedback({ tone: "success", text: "Key removed. The LABO AI agent is now disconnected." });
    } else {
      const body = await response.json().catch(() => ({})) as { error?: string };
      setFeedback({ tone: "error", text: body.error || "The key could not be removed." });
    }
    setBusy(null);
  };

  const isEditing = editing || status?.configured === false;

  return (
    <section className="overflow-hidden rounded-xl border border-violet-400/20 bg-violet-400/[0.025]">
      <div className="flex flex-col gap-3 border-b border-white/[0.07] bg-white/[0.02] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg border border-violet-400/20 bg-violet-400/10 text-violet-200">
            <KeyRound className="size-4" />
          </div>
          <div>
            <p className="text-sm font-medium">OpenAI key for LABO AI</p>
            <p className="mt-0.5 text-xs text-muted-foreground">One encrypted key, synchronized with the web graph agent.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`size-2 rounded-full ${status?.configured ? "bg-emerald-400" : "bg-white/20"}`} />
          <span className={status?.configured ? "text-emerald-300" : "text-white/40"}>
            {status === null ? "Checking…" : status.configured ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5">
        {status?.configured && !isEditing && (
          <div className="flex flex-col gap-3 rounded-lg border border-white/[0.07] bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-sm text-white/85">{status.prefix || "Encrypted key"}</p>
              <p className="mt-1 text-xs text-white/35">The complete secret cannot be read back from this interface.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" disabled={busy !== null} onClick={() => void testConnection()}>
                {busy === "test" ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                Test
              </Button>
              <Button variant="outline" size="sm" disabled={busy !== null} onClick={() => { setEditing(true); setFeedback(null); }}>
                <RefreshCw className="size-4" />Replace
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" disabled={busy !== null} onClick={() => void removeKey()}>
                {busy === "remove" ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                Remove
              </Button>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="space-y-3">
            <label htmlFor="labo-openai-key" className="text-xs font-medium text-white/65">
              {status?.configured ? "Replacement OpenAI API key" : "OpenAI API key"}
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <input
                  id="labo-openai-key"
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  onKeyDown={(event) => { if (event.key === "Enter") void saveKey(); }}
                  placeholder="sk-…"
                  autoComplete="new-password"
                  autoCapitalize="none"
                  spellCheck={false}
                  className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 pr-10 font-mono text-xs outline-none transition-colors placeholder:text-white/18 focus:border-violet-400/50"
                />
                <button type="button" className="absolute inset-y-0 right-0 grid w-10 place-items-center text-white/35 hover:text-white" onClick={() => setShowKey((value) => !value)} aria-label={showKey ? "Hide key" : "Show key"}>
                  {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <Button className="bg-violet-500 text-white hover:bg-violet-400" disabled={!apiKey.trim() || busy !== null} onClick={() => void saveKey()}>
                {busy === "save" || busy === "test" ? <LoaderCircle className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
                Save & test
              </Button>
              {status?.configured && (
                <Button variant="ghost" disabled={busy !== null} onClick={() => { setEditing(false); setApiKey(""); setShowKey(false); setFeedback(null); }}>Cancel</Button>
              )}
            </div>
          </div>
        )}

        {feedback && (
          <p role="status" className={`rounded-lg border px-3 py-2 text-xs ${feedback.tone === "success" ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300" : feedback.tone === "error" ? "border-destructive/25 bg-destructive/[0.07] text-destructive" : "border-white/[0.07] bg-white/[0.025] text-white/45"}`}>
            {feedback.text}
          </p>
        )}

        <div className="flex flex-col gap-3 border-t border-white/[0.07] pt-4 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>The key is encrypted at rest and is only decrypted server-side for OpenAI requests.</p>
          <div className="flex shrink-0 gap-3">
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-white">OpenAI keys <ExternalLink className="size-3" /></a>
            <Link href="/labo-ai/live" className="inline-flex items-center gap-1 text-violet-300 hover:text-violet-200">Open LABO AI <ExternalLink className="size-3" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
