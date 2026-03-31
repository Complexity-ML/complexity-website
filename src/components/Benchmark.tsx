"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function Benchmark() {
  return (
    <section id="benchmark" className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 sm:mb-16"
        >
          <p className="text-primary font-mono text-sm mb-2">// INFERENCE</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            vLLM Benchmark
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b border-border/50 flex flex-wrap items-center gap-3">
            <Badge className="bg-primary/20 text-primary border-primary/30">
              8,078 tok/s sustained
            </Badge>
            <Badge variant="outline">RTX PRO 6000 96 GB</Badge>
            <Badge variant="outline">100 concurrent requests</Badge>
            <Badge variant="outline">TTFT 29.3 ms</Badge>
          </div>
          <img
            src="/benchmark_throughput.png"
            alt="vLLM inference benchmark — 8,078 tokens/s sustained, 10,179 tokens/s peak on a single NVIDIA RTX PRO 6000"
            className="w-full"
          />
          <div className="p-4 sm:p-6">
            <p className="text-sm text-muted-foreground">
              187M Token-Routed model served via vLLM 0.18 with PagedAttention and CUDA graphs.
              Deterministic token routing is natively compatible with CUDA graph capture,
              eliminating CPU-GPU synchronizations required by learned-router MoE architectures.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
