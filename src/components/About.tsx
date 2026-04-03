"use client";

import { motion } from "framer-motion";
import { Zap, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const innovations = [
  {
    icon: <span className="text-2xl">μ</span>,
    title: "Mu-Guided Dynamics",
    description:
      "Learned mu projection that maintains context across layers through clamped scaling and linear adaptation.",
  },
  {
    icon: <Zap className="size-6" />,
    title: "Token-Routed MLP",
    description:
      "Deterministic expert routing based on token identity. Perfect load balance without routing collapse.",
  },
  {
    icon: <BarChart3 className="size-6" />,
    title: "CGGR Kernels",
    description:
      "Custom Triton kernels for contiguous group GEMM routing. 5-6x speedup over naive implementations.",
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
          <p className="text-primary font-mono text-sm mb-2">// ABOUT</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">Our Mission</h2>

          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Complexity-ML is dedicated to developing efficient and innovative transformer
            architectures. Our research focuses on making large language models more
            accessible through novel routing mechanisms and dynamics-inspired control systems.
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
