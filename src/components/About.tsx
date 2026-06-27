"use client";

import { motion } from "framer-motion";
import { GitBranch, Zap, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const innovations = [
  {
    icon: <GitBranch className="size-6" />,
    title: "Zipf-Balanced Routing",
    description:
      "A deterministic frequency table assigns tokens to experts with no learned router and no auxiliary load-balancing loss.",
  },
  {
    icon: <Zap className="size-6" />,
    title: "Token-Routed MLP",
    description:
      "Deterministic lexical routing via Zipf-balanced greedy bin-packing, avoiding learned router collapse and auxiliary balancing losses.",
  },
  {
    icon: <BarChart3 className="size-6" />,
    title: "Shared Lexical Expert",
    description:
      "A dense shared MLP path preserves common syntax and language patterns while routed experts specialize on lexical partitions.",
  },
];

export default function About() {
  return (
    <section id="about" className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 sm:mb-16"
        >
          <p className="text-primary font-mono text-sm mb-2">{"// ABOUT"}</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">Our Mission</h2>

          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Complexity-ML is dedicated to developing efficient and innovative transformer
            architectures. Our research focuses on making large language models more
            accessible through deterministic lexical routing, shared expert capacity, and corrected matched-budget scaling.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
        >
          {innovations.map((item) => (
            <Card key={item.title} className="bg-card/50 border-border/50">
              <CardContent className="p-4 sm:p-6 space-y-3">
                <div className="size-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  {item.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
