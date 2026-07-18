"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { ArrowRight, BookOpen, Github, Route, Scale, TrendingDown, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GridBackground = dynamic(() => import("./GridBackground"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 -z-10 bg-background" />,
});

const RoutingAnimation = dynamic(() => import("./RoutingAnimation"), {
  ssr: false,
  loading: () => null,
});

const heroStats = [
  { value: "8,078", label: "tok/s sustained" },
  { value: "306.5M", label: "iso-param run" },
  { value: "−0.0163", label: "final loss gap" },
];

const routeFlow = [
  { icon: Route, label: "Token", value: "token_id" },
  { icon: Scale, label: "Balance", value: "Zipf freq" },
  { icon: Zap, label: "Dispatch", value: "expert e" },
  { icon: TrendingDown, label: "Result", value: "TR < Dense" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-24 pb-14 sm:px-6 sm:pt-28 lg:pb-20">
      <GridBackground />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background to-transparent" />

      <div className="container relative z-10 mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <Badge className="mb-6 gap-2 border-primary/30 bg-primary/10 px-4 py-2 text-primary shadow-[0_0_30px_rgba(74,222,128,0.16)]">
            <span className="size-2 rounded-full bg-primary" />
            Latest research manuscript
          </Badge>

          <h1 className="max-w-4xl text-5xl font-bold leading-[0.95] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
            Deterministic routing for efficient transformers.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-xl">
            COMPLEXITY-DEEP now focuses on lexical token routing, Zipf-balanced expert assignment, and a shared lexical expert — with corrected matched-budget scaling evidence.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="shadow-[0_0_40px_rgba(74,222,128,0.22)]" asChild>
              <a href="/papers/token-identity-routing-residual-experts.pdf" target="_blank" rel="noopener noreferrer">
                <BookOpen className="size-5" />
                Read the paper
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="/demo">Live demo</a>
            </Button>
            <Button variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground" asChild>
              <a href="https://github.com/Complexity-ML" target="_blank" rel="noopener noreferrer">
                <Github className="size-5" />
                GitHub
              </a>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          <Card className="mx-auto w-full max-w-xl overflow-hidden border-border/70 bg-card/65 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">routing table</p>
                  <CardTitle className="mt-2 text-xl">Token → expert, no learned router</CardTitle>
                </div>
                <Badge variant="outline" className="border-primary/30 text-primary">
                  4 experts
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="grid grid-cols-3 gap-2">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-primary/15 bg-background/70 p-3 text-center">
                    <div className="text-lg font-bold text-foreground sm:text-2xl">{stat.value}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-2 sm:grid-cols-4">
                {routeFlow.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-2xl border border-border/40 bg-background/30 p-3">
                      <Icon className="mb-3 size-4 text-primary" />
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                      <p className="mt-1 font-mono text-xs text-foreground">{item.value}</p>
                    </div>
                  );
                })}
              </div>

              <div className="overflow-hidden rounded-2xl border border-border/40 bg-background/35 py-3">
                <RoutingAnimation />
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">
                The corrected 300M run is evaluated at matched tokens over an 8B FineWeb-Edu budget; the 187M model provides the vLLM throughput benchmark.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
