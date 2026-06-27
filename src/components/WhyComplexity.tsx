"use client";

import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, GitBranch, Layers3, Zap } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    icon: GitBranch,
    title: "Route tokens deterministically",
    description: "Each token maps to a balanced expert path without a learned router collapse failure mode.",
  },
  {
    icon: Layers3,
    title: "Keep a shared lexical expert",
    description: "Common language structure remains available while specialized experts handle routed compute.",
  },
  {
    icon: BrainCircuit,
    title: "Guide attention with μ",
    description: "Mu-guided dynamics inject layer-to-layer state into attention projections for stable adaptation.",
  },
  {
    icon: Zap,
    title: "Serve with graph-friendly kernels",
    description: "Deterministic paths are easier to batch, capture, and optimize in inference engines.",
  },
];

const faqs = [
  {
    question: "Why not just scale dense models?",
    answer:
      "Dense models activate the same full MLP for every token. Complexity-Deep explores routing compute toward token-specific expert paths, improving active-parameter efficiency without giving up a shared lexical path.",
  },
  {
    question: "What makes the routing robust?",
    answer:
      "The routing is deterministic and Zipf-balanced, so expert utilization does not depend on a learned router staying well-behaved during training or inference.",
  },
  {
    question: "Is this only a paper concept?",
    answer:
      "No. The site links to code, model artifacts, PyPI packages, Hugging Face releases, benchmarks, and a live demo surface so the stack can be inspected end-to-end.",
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
              The site should make the research feel understandable at a glance: what changes, why it matters, and where to verify the claims.
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
                A shadcn-powered section that turns the architecture into digestible product storytelling.
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
