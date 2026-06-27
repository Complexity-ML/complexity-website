"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { ArrowRight, BookOpen, Github, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  { value: "29 ms", label: "median TTFT" },
  { value: "4", label: "routed experts" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <GridBackground />

      <div className="absolute inset-0 z-0 opacity-70" aria-hidden="true">
        <RoutingAnimation />
      </div>

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
            className="font-mono text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8"
          >
            48.8566° N, 2.3522° E
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6 sm:mb-8"
          >
            <Badge className="gap-2 px-4 py-2 text-sm bg-primary/10 text-primary border-primary/30 shadow-[0_0_30px_rgba(74,222,128,0.18)]">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              OPEN-SOURCE AI LAB
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-[-0.06em] leading-[0.95] mb-5 sm:mb-7"
          >
            <span className="text-primary">{"//"}</span> COMPLEXITY
            <br />
            <span className="text-muted-foreground">MACHINE LEARNING</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 sm:mb-10 px-2 leading-relaxed"
          >
            Building efficient transformer architectures with{" "}
            <span className="text-primary">deterministic lexical routing</span> and a{" "}
            <span className="text-primary">shared-expert Token-Routed MLP</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4 sm:px-0"
          >
            <Button size="lg" className="shadow-[0_0_40px_rgba(74,222,128,0.22)]" asChild>
              <a href="/demo">
                Try the live demo
                <ArrowRight className="size-5" />
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="https://github.com/Complexity-ML" target="_blank" rel="noopener noreferrer">
                <Github className="size-5" />
                GitHub
              </a>
            </Button>
            <Button variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground" asChild>
              <a href="https://openreview.net/forum?id=Jd9jhTnkUy" target="_blank" rel="noopener noreferrer">
                <BookOpen className="size-5" />
                Paper
              </a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-2 rounded-2xl border border-border/50 bg-background/45 p-2 backdrop-blur-md sm:mt-10 sm:gap-3"
          >
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border/40 bg-card/40 px-3 py-3">
                <div className="text-lg font-bold text-foreground sm:text-2xl">{stat.value}</div>
                <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.75 }}
            transition={{ duration: 0.8, delay: 1.15 }}
            className="mx-auto mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground"
          >
            <Sparkles className="size-3.5 text-primary" />
            <span>Token-routed inference, benchmarked and open for inspection.</span>
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
  );
}
