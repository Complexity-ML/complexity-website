"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Key, MessageSquare, Shield, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const userId = (user as Record<string, unknown> | undefined)?.id as string | undefined;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your API keys and access the vllm-i64 inference engine.
        </p>
      </div>

      {/* Quick cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/demo"
          className="group p-5 rounded-lg border border-border hover:border-primary/50 transition-colors space-y-3"
        >
          <div className="flex items-center justify-between">
            <MessageSquare className="size-5 text-primary" />
            <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <p className="font-medium">Chat</p>
            <p className="text-xs text-muted-foreground">
              Interactive demo with streaming inference
            </p>
          </div>
        </Link>

        <Link
          href="/dashboard/keys"
          className="group p-5 rounded-lg border border-border hover:border-primary/50 transition-colors space-y-3"
        >
          <div className="flex items-center justify-between">
            <Key className="size-5 text-primary" />
            <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <p className="font-medium">API Keys</p>
            <p className="text-xs text-muted-foreground">
              Get your key for direct API access
            </p>
          </div>
        </Link>

        <div className="p-5 rounded-lg border border-border space-y-3">
          <Shield className="size-5 text-primary" />
          <div>
            <p className="font-medium">Security</p>
            <p className="text-xs text-muted-foreground">
              Token-routed partition isolation
            </p>
            <Badge variant="outline" className="mt-2 font-mono text-[10px]">
              {userId ? `${userId.slice(0, 20)}...` : "—"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick start */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Quick start</h2>
        <div className="p-4 rounded-lg border border-border bg-card/50">
          <pre className="text-xs font-mono overflow-x-auto text-muted-foreground">{`# Install the SDK
npm install vllm-i64

# Use in your code
import { I64Client } from "vllm-i64";

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
