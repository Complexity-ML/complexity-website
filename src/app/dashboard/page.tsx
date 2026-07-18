"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  MessageSquare,
  ArrowRight,
  BookOpen,
  Github,
  Cpu,
  Zap,
  Layers,
  Timer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MODEL_SPECS = [
  { icon: Cpu, label: "Scaling run", value: "306.5M" },
  { icon: Layers, label: "Experts", value: "4, top-k=2" },
  { icon: Zap, label: "Routing", value: "Fixed token table" },
  { icon: Timer, label: "Training", value: "8B tokens" },
];

const BENCHMARK_STATS = [
  { label: "Throughput", value: "8,078 tok/s", sub: "sustained" },
  { label: "Peak", value: "10,179 tok/s", sub: "burst" },
  { label: "TTFT", value: "29.3 ms", sub: "median" },
  { label: "ITL", value: "7.9 ms", sub: "median" },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center gap-4">
        {user?.image && (
          <Image
            src={user.image}
            alt=""
            width={48}
            height={48}
            className="rounded-full"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground">
            Complexity ML — Project Dashboard
          </p>
        </div>
      </div>

      {/* Quick links */}
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
            <p className="font-medium">Chat with Pacific-i64</p>
            <p className="text-xs text-muted-foreground">
              TR-MoE, dense, or side-by-side comparison
            </p>
          </div>
        </Link>

        <a
          href="/papers/token-identity-routing-residual-experts.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="group p-5 rounded-lg border border-border hover:border-primary/50 transition-colors space-y-3"
        >
          <div className="flex items-center justify-between">
            <BookOpen className="size-5 text-primary" />
            <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <p className="font-medium">Paper</p>
            <p className="text-xs text-muted-foreground">
              Latest double-anonymized research manuscript
            </p>
          </div>
        </a>

        <a
          href="https://github.com/Complexity-ML"
          target="_blank"
          rel="noopener noreferrer"
          className="group p-5 rounded-lg border border-border hover:border-primary/50 transition-colors space-y-3"
        >
          <div className="flex items-center justify-between">
            <Github className="size-5 text-primary" />
            <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <p className="font-medium">GitHub</p>
            <p className="text-xs text-muted-foreground">
              Source code and repositories
            </p>
          </div>
        </a>
      </div>

      {/* Model Card */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="px-5 py-4 bg-card/50 border-b border-border flex items-center justify-between">
          <p className="text-sm font-medium">Pacific-i64 — Model Card</p>
          <Badge variant="outline" className="font-mono text-[10px]">
            Coming soon
          </Badge>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
          {MODEL_SPECS.map((spec) => (
            <div key={spec.label} className="px-5 py-4 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <spec.icon className="size-4" />
                <span className="text-xs">{spec.label}</span>
              </div>
              <p className="text-lg font-bold font-mono">{spec.value}</p>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 bg-muted/20 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Decoder-only transformer family with deterministic Token-Routed MLP, Shared Lexical Expert, GQA, RoPE, and SwiGLU. Updated from the latest research manuscript.
          </p>
        </div>
      </div>

      {/* Benchmark Stats */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="px-5 py-4 bg-card/50 border-b border-border flex items-center justify-between">
          <p className="text-sm font-medium">vLLM Inference Benchmark</p>
          <Badge variant="outline" className="font-mono text-[10px]">
            RTX PRO 6000
          </Badge>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
          {BENCHMARK_STATS.map((stat) => (
            <div key={stat.label} className="px-5 py-4 space-y-1">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <p className="text-lg font-bold font-mono text-primary">
                {stat.value}
              </p>
              <span className="text-[10px] text-muted-foreground/60">{stat.sub}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-border">
          <Image
            src="/benchmark_throughput.png"
            alt="vLLM benchmark throughput"
            width={2780}
            height={1968}
            sizes="(min-width: 1024px) 896px, 100vw"
            className="w-full h-auto"
          />
        </div>
      </div>

      {/* Training Curves */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-5 py-3 bg-card/50 border-b border-border">
            <p className="text-sm font-medium">Loss Curves</p>
            <p className="text-xs text-muted-foreground">Dense vs Token-Routed (500M tokens)</p>
          </div>
          <Image
            src="/loss_curves.png"
            alt="Training loss curves"
            width={1976}
            height={1176}
            sizes="(min-width: 640px) 50vw, 100vw"
            className="w-full h-auto"
          />
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-5 py-3 bg-card/50 border-b border-border">
            <p className="text-sm font-medium">Expert Balance</p>
            <p className="text-xs text-muted-foreground">Fixed token assignment — measured expert traffic</p>
          </div>
          <Image
            src="/expert_balance.png"
            alt="Expert load balance"
            width={2777}
            height={973}
            sizes="(min-width: 640px) 50vw, 100vw"
            className="w-full h-auto"
          />
        </div>
      </div>

      {/* Architecture */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="px-5 py-3 bg-card/50 border-b border-border">
          <p className="text-sm font-medium">Architecture</p>
          <p className="text-xs text-muted-foreground">
            COMPLEXITY-DEEP decoder block
          </p>
        </div>
        <div className="p-4 flex justify-center bg-white/5">
          <Image
            src="/architecture.png"
            alt="Complexity-Deep architecture diagram"
            width={547}
            height={1266}
            sizes="547px"
            className="max-h-[500px] w-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}
