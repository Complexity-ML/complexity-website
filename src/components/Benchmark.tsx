"use client";

import Image from "next/image";
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
          <p className="text-primary font-mono text-sm mb-2">{"// INFERENCE"}</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            Inference + corrected scaling
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
          <Image
            src="/benchmark_throughput.png"
            alt="vLLM inference benchmark — 8,078 tokens/s sustained, 10,179 tokens/s peak on a single NVIDIA RTX PRO 6000"
            width={2780}
            height={1968}
            sizes="(min-width: 1152px) 1152px, 100vw"
            className="w-full h-auto"
          />
          <div className="p-4 sm:p-6">
            <p className="text-sm text-muted-foreground">
              187M Token-Routed model served via vLLM 0.18 with PagedAttention and CUDA graphs. The updated paper also reports a corrected 300M iso-parameter comparison over 8B FineWeb-Edu tokens: Token-Routed first wins at step 740 on train loss, step 750 on validation loss, and ends with a −0.0163 smoothed train-loss gap.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 sm:mt-16"
        >
          <p className="text-primary font-mono text-sm mb-2">{"// EXPERT ANALYSIS"}</p>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6">
            Expert analysis
          </h3>
          <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden">
            <iframe
              src="/expert_tsne_3d.html"
              title="Interactive 3D t-SNE visualization of expert activations"
              className="w-full border-0"
              style={{ height: "700px" }}
              loading="lazy"
            />
            <div className="p-4 sm:p-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                The updated paper emphasizes functional specialization measured by per-expert perplexity on assigned token subsets; geometric separation alone is not treated as proof of specialization.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
