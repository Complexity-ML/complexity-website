"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Activity, Cpu, Gauge, Timer } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

const stats = [
  { icon: Gauge, value: "8,078", unit: "tok/s", label: "sustained throughput" },
  { icon: Activity, value: "10,179", unit: "tok/s", label: "observed peak" },
  { icon: Timer, value: "29.3", unit: "ms", label: "median TTFT" },
  { icon: Cpu, value: "100", unit: "req", label: "concurrent clients" },
];

export default function Benchmark() {
  return (
    <section id="benchmark" className="site-section scroll-mt-24 border-b border-white/[0.055]">
      <div className="site-shell">
        <SectionHeading
          eyebrow="Inference / evidence"
          title="Numbers with their context attached."
          description="Serving performance and quality-at-matched-tokens are separate measurements. The interface keeps the hardware, model scale and experimental limits visible."
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.04 }}
                className="rounded-2xl border border-white/[0.075] bg-white/[0.025] p-5 sm:p-6"
              >
                <div className="flex items-center justify-between text-white/30">
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em]">{stat.label}</span>
                  <Icon className="size-4" />
                </div>
                <p className="mt-9 font-mono text-3xl tracking-[-0.05em] text-white sm:text-4xl">
                  {stat.value}<span className="ml-2 text-sm text-primary/70">{stat.unit}</span>
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.figure
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="lab-surface mt-4 overflow-hidden rounded-2xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] bg-black/15 px-4 py-3 sm:px-6">
            <div>
              <p className="font-mono text-[10px] text-emerald-300/75">benchmark_throughput.png</p>
              <p className="mt-1 text-xs text-white/35">vLLM 0.18 · RTX PRO 6000 96 GB · 187M routed model</p>
            </div>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-emerald-200">verified artifact</span>
          </div>
          <div className="flex justify-center bg-[#090b10] p-3 sm:p-5 lg:p-8">
            <a
              href="/benchmark_throughput.png"
              target="_blank"
              rel="noreferrer"
              className="group relative flex max-h-[500px] w-full items-center justify-center overflow-hidden rounded-xl bg-white/[0.025]"
              aria-label="Open the complete benchmark image"
            >
              <Image
                src="/benchmark_throughput.png"
                alt="vLLM inference benchmark — 8,078 tokens/s sustained, 10,179 tokens/s peak on a single NVIDIA RTX PRO 6000"
                width={2780}
                height={1968}
                sizes="(min-width: 1024px) 880px, (min-width: 640px) 80vw, calc(100vw - 48px)"
                className="max-h-[500px] w-auto max-w-full object-contain transition-opacity duration-200 group-hover:opacity-90"
              />
              <span className="absolute bottom-3 right-3 rounded-full border border-black/10 bg-black/70 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                open full size
              </span>
            </a>
          </div>
          <figcaption className="border-t border-white/[0.07] px-4 py-4 text-xs leading-6 text-white/42 sm:px-6">
            The separate 300M training comparison uses an 8B-token FineWeb-Edu budget. Token-Routed first wins at logged train step 740 and validation step 750, ending with a −0.0163 smoothed training-loss gap.
          </figcaption>
        </motion.figure>

        <div className="mt-16 sm:mt-24">
          <SectionHeading
            eyebrow="Expert analysis"
            title="Inspect the geometry. Don’t overclaim it."
            description="The interactive projection is exploratory evidence. Functional specialization is evaluated separately through per-expert perplexity on assigned token subsets."
          />
          <div className="lab-surface overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3 sm:px-6">
              <span className="font-mono text-[10px] text-violet-300/70">expert_tsne_3d.html</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/25">interactive</span>
            </div>
            <iframe
              src="/expert_tsne_3d.html"
              title="Interactive 3D t-SNE visualization of expert activations"
              className="h-[460px] w-full border-0 sm:h-[620px] xl:h-[760px]"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
