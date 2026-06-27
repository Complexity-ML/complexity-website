"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Boxes, GitBranch, Scale, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = [
  {
    icon: GitBranch,
    title: "Deterministic lexical routing",
    body: "Tokens are assigned to experts from a fixed routing table built with Zipf-balanced greedy bin-packing over empirical frequencies.",
  },
  {
    icon: Boxes,
    title: "Shared lexical expert",
    body: "A dense shared MLP path keeps common syntax and language structure available while routed experts specialize on lexical partitions.",
  },
  {
    icon: Scale,
    title: "Corrected matched-budget comparison",
    body: "The current scaling claim is a 306.5M iso-parameter run over 8B FineWeb-Edu tokens, compared at matched steps/tokens.",
  },
  {
    icon: TrendingDown,
    title: "Late-run advantage",
    body: "Token-Routed first wins at step 740 on logged train loss and ends with a −0.0163 smoothed final train-loss gap.",
  },
];

export default function PaperUpdate() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex flex-col gap-5 sm:mb-14 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <Badge variant="outline" className="mb-5 border-primary/30 bg-primary/10 text-primary">
              Updated paper
            </Badge>
            <p className="font-mono text-sm text-primary">{"// CURRENT STORY"}</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">
              Deterministic routing, shared experts, corrected scaling.
            </h2>
          </div>
          <Button variant="outline" asChild>
            <a href="https://openreview.net/forum?id=Jd9jhTnkUy" target="_blank" rel="noopener noreferrer">
              OpenReview
              <ArrowUpRight className="size-4" />
            </a>
          </Button>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
              >
                <Card className="h-full border-border/60 bg-card/45 backdrop-blur transition-colors hover:border-primary/50 hover:bg-card/70">
                  <CardHeader>
                    <div className="mb-4 flex size-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <CardTitle className="text-base leading-tight">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
