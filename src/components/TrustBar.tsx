"use client";

import { motion } from "framer-motion";
import { Activity, Cpu, GitBranch, ShieldCheck } from "lucide-react";

const signals = [
  {
    icon: Activity,
    label: "Measured throughput",
    value: "8,078 tok/s",
    detail: "sustained vLLM benchmark",
  },
  {
    icon: Cpu,
    label: "Efficient activation",
    value: "300M iso-run",
    detail: "8B-token comparison",
  },
  {
    icon: GitBranch,
    label: "Deterministic routing",
    value: "0.248/0.264/0.248/0.240",
    detail: "final expert utilization",
  },
  {
    icon: ShieldCheck,
    label: "Open inspection",
    value: "Code + paper",
    detail: "research artifacts linked",
  },
];

export default function TrustBar() {
  return (
    <section className="px-4 sm:px-6" aria-label="Key performance and research signals">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid gap-3 rounded-3xl border border-border/60 bg-card/30 p-3 backdrop-blur md:grid-cols-4"
        >
          {signals.map((signal) => {
            const Icon = signal.icon;
            return (
              <div
                key={signal.label}
                className="group rounded-2xl border border-border/40 bg-background/45 p-4 transition-colors hover:border-primary/40 hover:bg-primary/[0.04]"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="rounded-xl border border-primary/20 bg-primary/10 p-2 text-primary">
                    <Icon className="size-4" />
                  </div>
                  <span className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {signal.label}
                </p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                  {signal.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{signal.detail}</p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
