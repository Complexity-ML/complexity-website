"use client";

import { motion } from "framer-motion";
import { ArrowRight, BarChart3, GitBranch, Layers3, Zap } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    icon: GitBranch,
    title: "Route tokens deterministically",
    description: "Tokens are assigned once by a Zipf-balanced frequency table, eliminating learned routers and auxiliary load-balancing losses.",
  },
  {
    icon: Layers3,
    title: "Keep a shared lexical expert",
    description: "A dense shared path handles syntax and common patterns while routed experts specialize on lexical partitions.",
  },
  {
    icon: BarChart3,
    title: "Correct the scaling comparison",
    description: "The current result is a 300M iso-parameter, iso-batch comparison over 8B FineWeb-Edu tokens.",
  },
  {
    icon: Zap,
    title: "Serve with graph-friendly kernels",
    description: "The 187M model reaches 8,078 tok/s in vLLM 0.18; the corrected 300M result reports quality at matched tokens, not a pure speed win.",
  },
];

const faqs = [
  {
    question: "Why not just scale dense models?",
    answer:
      "The paper studies a conditional capacity/compute trade-off: a shared dense branch plus token-conditioned routed branches, compared against dense baselines at matched budgets.",
  },
  {
    question: "What makes the routing robust?",
    answer:
      "The routing table is built by greedy bin-packing over empirical token frequencies. In the corrected 300M run, final expert utilization remains near-balanced with no dead experts.",
  },
  {
    question: "Is this only a paper concept?",
    answer:
      "The paper reports component ablations at 187M, a corrected 300M iso-parameter run over 8B FineWeb-Edu tokens, and vLLM inference results for the 187M model.",
  },
];

export default function WhyComplexity() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start"
        >
          <div>
            <Badge variant="outline" className="mb-5 border-primary/30 bg-primary/10 text-primary">
              Architecture story
            </Badge>
            <p className="font-mono text-sm text-primary">{"// WHY COMPLEXITY"}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
              Less brute force. More routed intelligence.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              COMPLEXITY-DEEP now centers on deterministic lexical routing, a shared lexical expert, Zipf-balanced bin-packing, and corrected 300M scaling evidence over an 8B-token budget.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <a href="/demo">
                  Open demo
                  <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="#benchmark">See benchmark</a>
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border-border/60 bg-card/50 backdrop-blur">
            <CardHeader className="border-b border-border/50">
              <CardTitle>Token-routed transformer, explained</CardTitle>
              <CardDescription>
                Updated from the new OpenReview paper: lexical routing, shared expert, Zipf balance, and corrected scaling caveats.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid gap-px bg-border/40 sm:grid-cols-2">
                {steps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.title} className="bg-background/80 p-5 transition-colors hover:bg-primary/[0.04]">
                      <div className="mb-4 flex size-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <h3 className="font-semibold tracking-tight">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                    </div>
                  );
                })}
              </div>
              <div className="p-5">
                <Accordion type="single" collapsible defaultValue="item-0">
                  {faqs.map((item, index) => (
                    <AccordionItem key={item.question} value={`item-${index}`}>
                      <AccordionTrigger>{item.question}</AccordionTrigger>
                      <AccordionContent className="leading-relaxed text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
