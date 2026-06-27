"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Boxes, GitBranch, Scale, ShieldCheck, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const claims = [
  {
    icon: GitBranch,
    title: "Lexical, deterministic routing",
    text: "Every token is assigned from a fixed routing table. No learned gating network, no router collapse, no auxiliary balancing loss.",
  },
  {
    icon: Boxes,
    title: "Shared lexical expert",
    text: "A dense shared MLP path preserves common syntax and language structure while routed experts specialize on lexical partitions.",
  },
  {
    icon: Scale,
    title: "Corrected scaling evidence",
    text: "The headline quality result is a 306.5M iso-parameter, iso-batch comparison over 8B FineWeb-Edu tokens.",
  },
  {
    icon: TrendingDown,
    title: "Late-run advantage",
    text: "Token-Routed first wins at logged train step 740 and finishes with a −0.0163 smoothed final train-loss gap.",
  },
];

const caveats = [
  "300M result is quality-at-matched-tokens, not a pure speed benchmark.",
  "187M vLLM benchmark reaches 8,078 tok/s sustained on RTX PRO 6000.",
  "Expert utilization remains near-balanced at the end of the corrected 300M run.",
];

export default function ResearchStory() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="container mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-28"
          >
            <Badge variant="outline" className="mb-5 border-primary/30 bg-primary/10 text-primary">
              Current paper story
            </Badge>
            <p className="font-mono text-sm text-primary">{"// SOURCE OF TRUTH"}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
              Deterministic routing, shared experts, corrected scaling.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              The site now tracks the new OpenReview submission instead of the older architecture story. The message is simple: fixed lexical routing can produce useful specialization without learned MoE routing machinery.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Button asChild>
                <a href="https://openreview.net/forum?id=Jd9jhTnkUy" target="_blank" rel="noopener noreferrer">
                  OpenReview
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="#benchmark">See evidence</a>
              </Button>
            </div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {claims.map((claim, index) => {
              const Icon = claim.icon;
              return (
                <motion.div
                  key={claim.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                >
                  <Card className="h-full border-border/60 bg-card/45 backdrop-blur transition-colors hover:border-primary/50 hover:bg-card/70">
                    <CardHeader>
                      <div className="mb-4 flex size-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <CardTitle className="text-lg leading-tight">{claim.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed text-muted-foreground">{claim.text}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="sm:col-span-2"
            >
              <Card className="border-border/60 bg-background/45 backdrop-blur">
                <CardContent className="p-5 sm:p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-2xl border border-primary/25 bg-primary/10 p-3 text-primary">
                      <ShieldCheck className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Claims kept precise</p>
                      <p className="text-sm text-muted-foreground">The homepage separates benchmark, scaling, and caveats.</p>
                    </div>
                  </div>
                  <ul className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                    {caveats.map((item) => (
                      <li key={item} className="rounded-xl border border-border/40 bg-card/35 p-3">
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
