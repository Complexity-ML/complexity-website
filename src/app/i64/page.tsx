"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Github, BookOpen, ArrowRight, Zap, Cpu, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const GridBackground = dynamic(() => import("@/components/GridBackground"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 -z-10 bg-background" />,
});

const INNOVATIONS = [
  {
    icon: GitBranch,
    title: "Token-Routed MLP",
    dense: "Every token passes through the full MLP — wasted compute on irrelevant activations.",
    i64: "Deterministic routing selects only the relevant MLP paths per token. Less compute, same expressivity.",
  },
  {
    icon: Cpu,
    title: "Mu-Guided Dynamics",
    dense: "Standard optimizers with fixed learning rates — unstable training at scale.",
    i64: "PID-inspired control mechanism adapts dynamics during training. Stable convergence by design.",
  },
  {
    icon: Zap,
    title: "CGGR Kernels",
    dense: "Generic CUDA kernels not optimized for transformer workloads.",
    i64: "Custom kernels fused for i64 operations. Lower memory bandwidth, higher throughput.",
  },
];

const STATS = [
  { value: "384M", label: "Parameters (Pacific-i64)" },
  { value: "10K", label: "Safety contrastive pairs" },
  { value: "3", label: "Peer-reviewed papers" },
  { value: "CC BY-NC", label: "Open-source license" },
];

export default function I64Page() {
  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <GridBackground />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="font-mono text-xs sm:text-sm text-muted-foreground mb-6"
            >
              ARCHITECTURE COMPARISON
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-6 sm:mb-8"
            >
              <Badge className="gap-2 px-4 py-2 text-sm bg-primary/10 text-primary border-primary/30">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                EFFICIENCY RESEARCH
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6"
            >
              <span className="text-muted-foreground">DENSE</span>
              <span className="text-primary mx-4 sm:mx-6">//</span>
              <span className="text-foreground">i64</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10"
            >
              Why brute-forcing compute is no longer the answer — and how{" "}
              <span className="text-primary">integer-first, token-routed</span> architectures
              change the equation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4"
            >
              <Button size="lg" asChild>
                <a href="https://github.com/Complexity-ML" target="_blank" rel="noopener noreferrer">
                  <Github className="size-5" />
                  Explore on GitHub
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="https://doi.org/10.5281/zenodo.18293026" target="_blank" rel="noopener noreferrer">
                  <BookOpen className="size-5" />
                  Read the Paper
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:block"
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <span className="text-xs font-mono">SCROLL</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-px h-8 bg-gradient-to-b from-muted-foreground to-transparent"
            />
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-background/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl sm:text-4xl font-bold text-primary mb-1">{stat.value}</p>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="container mx-auto px-4 sm:px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-mono text-xs text-muted-foreground mb-4">// THE CASE FOR i64</p>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
            Three problems. Three solutions.
          </h2>
        </motion.div>

        <div className="space-y-6">
          {INNOVATIONS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="grid md:grid-cols-[1fr_auto_1fr] gap-0 border border-border/50 rounded-lg overflow-hidden"
              >
                {/* Dense */}
                <div className="p-6 bg-muted/20">
                  <p className="font-mono text-xs text-muted-foreground mb-2">DENSE</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.dense}</p>
                </div>

                {/* Label */}
                <div className="flex flex-col items-center justify-center px-6 py-4 bg-primary/5 border-x border-border/50 gap-2 min-w-[160px]">
                  <Icon className="size-5 text-primary" />
                  <p className="font-mono text-xs font-bold text-primary text-center">{item.title}</p>
                </div>

                {/* i64 */}
                <div className="p-6 bg-primary/5">
                  <p className="font-mono text-xs text-primary mb-2">i64</p>
                  <p className="text-sm leading-relaxed">{item.i64}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/50">
        <div className="container mx-auto px-4 sm:px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-mono text-xs text-muted-foreground mb-4">// GET STARTED</p>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-4">
              Try it on the <span className="text-primary">demo</span>
            </h2>
            <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
              Run i64 models directly in your browser. Compare outputs, latency, and token routing
              against dense baselines in real time.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/demo">
                  Open Demo
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="https://huggingface.co/Pacific-i64" target="_blank" rel="noopener noreferrer">
                  <span className="text-base">🤗</span>
                  HuggingFace
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
