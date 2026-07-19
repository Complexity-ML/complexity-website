"use client";

import { Check, Copy, Terminal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const INSTALL_COMMAND = "curl -fsSL https://github.com/Complexity-ML/labo-ai/releases/latest/download/install-labo-ai-macos.sh | bash";

export default function LaboMacInstall() {
  const [copied, setCopied] = useState(false);

  async function copyCommand() {
    await navigator.clipboard.writeText(INSTALL_COMMAND);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="mt-7">
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/35 p-2 pl-3">
        <Terminal className="size-4 shrink-0 text-emerald-300" />
        <code className="min-w-0 flex-1 truncate font-mono text-[11px] text-white/65">{INSTALL_COMMAND}</code>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-8 shrink-0 text-white/55 hover:bg-white/10 hover:text-white"
          onClick={copyCommand}
          aria-label={copied ? "Command copied" : "Copy install command"}
          title={copied ? "Copied" : "Copy command"}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </Button>
      </div>
      <p className="mt-3 text-center font-mono text-[10px] text-white/40">Paste in Terminal · SHA-256 verified · no Gatekeeper detour</p>
    </div>
  );
}
