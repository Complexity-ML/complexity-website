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
  { icon: Cpu, label: "Parameters", value: "—" },
  { icon: Layers, label: "Experts", value: "—" },
  { icon: Zap, label: "Routing", value: "Zipf bin-pack" },
  { icon: Timer, label: "Training", value: "—" },
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
              Python, ROS2, or side-by-side comparison
            </p>
          </div>
        </Link>

        <a
          href="https://openreview.net/forum?id=jZq6EVboC6"
          target="_blank"
          rel="noopener noreferrer"
          className="group p-5 rounded-lg border border-border hover:border-primary/50 transition-colors space-y-3"
        >
          <div className="flex items-center justify-between">
            <BookOpen className="size-5 text-primary" />
            <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <p className="font-medium">Paper (TMLR)</p>
            <p className="text-xs text-muted-foreground">
              Under review at Transactions on ML Research
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
            Decoder-only transformer with Mu-Guided Attention, Token-Routed MLP (Zipf bin-packing),
            Shared Lexical Expert, GQA, RoPE, SwiGLU. Model specs will be updated after TMLR review.
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
          <img
            src="/benchmark_throughput.png"
            alt="vLLM benchmark throughput"
            className="w-full"
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
          <img src="/loss_curves.png" alt="Training loss curves" className="w-full" />
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-5 py-3 bg-card/50 border-b border-border">
            <p className="text-sm font-medium">Expert Balance</p>
            <p className="text-xs text-muted-foreground">Zipf bin-packing — 1.0000x balance</p>
          </div>
          <img src="/expert_balance.png" alt="Expert load balance" className="w-full" />
        </div>
      </div>

      {/* Mu Contribution */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="px-5 py-3 bg-card/50 border-b border-border">
          <p className="text-sm font-medium">Mu-Guidance Contribution</p>
          <p className="text-xs text-muted-foreground">
            Ratio of Mu contribution to K, Q, V projections per layer (~50%)
          </p>
        </div>
        <img src="/mu_contribution.png" alt="Mu contribution per layer" className="w-full" />
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
          <img
            src="/architecture.png"
            alt="Complexity-Deep architecture diagram"
            className="max-h-[500px] object-contain"
          />
        </div>
      </div>
    </div>
  );
}
