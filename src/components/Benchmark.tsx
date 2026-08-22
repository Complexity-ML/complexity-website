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

const assistantPromptPanel = [
  { prompt: "Capital of France", expected: "Paris", trHash: "The capital of France is Paris…", opt: "The capital of France…", trPass: true, optPass: false },
  { prompt: "5 + 7", expected: "12", trHash: "5 + 7 = 10…", opt: "5!…", trPass: false, optPass: false },
  { prompt: "17 × 23", expected: "391", trHash: "17 × 23 = ?…", opt: "It’s a number.", trPass: false, optPass: false },
  { prompt: "Falling drinking glass", expected: "Breaks / shatters", trHash: "Falls straight down…", opt: "Falls … into the ground.", trPass: false, optPass: false },
  { prompt: "Three rainbow colors", expected: "Any 3 valid colors", trHash: "Red, Orange, Yellow…", opt: "The rainbow is the color…", trPass: true, optPass: false },
  { prompt: "Recall the name Boris", expected: "Boris", trHash: "Boris…", opt: "Boris… (then repeats)", trPass: true, optPass: true },
];

export default function Benchmark() {
  return (
    <section id="benchmark" className="site-section scroll-mt-24 border-b border-white/[0.055]">
      <div className="site-shell">
        <SectionHeading
          eyebrow="Inference / evidence"
          title="Numbers with their context attached."
          description="The cards preserve the separate CUDA-graph serving result. The figure reports zero-shot quality for the released 201.2M checkpoint, with model scale and protocol kept visible."
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
              <p className="font-mono text-[10px] text-violet-300/75">combined_arc_model_comparison.png</p>
              <p className="mt-1 text-xs text-white/35">Full ARC public splits · zero-shot causal-choice · 201.2M versus 124M–774M</p>
            </div>
            <span className="rounded-full border border-violet-400/20 bg-violet-400/[0.07] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-violet-200">full-split evaluation</span>
          </div>
          <div className="flex justify-center bg-[#090b10] p-3 sm:p-5 lg:p-8">
            <a
              href="/combined_arc_model_comparison.png"
              target="_blank"
              rel="noreferrer"
              className="group relative flex max-h-[500px] w-full items-center justify-center overflow-hidden rounded-xl bg-white/[0.025]"
              aria-label="Open the complete Combined ARC comparison image"
            >
              <Image
                src="/combined_arc_model_comparison.png"
                alt="Combined ARC zero-shot accuracy comparison: TR-HASH MoE 200M reaches 47.29%, ahead of evaluated GPT-2, Pythia, and OPT baselines from 124M to 774M parameters"
                width={1714}
                height={1321}
                sizes="(min-width: 1024px) 880px, (min-width: 640px) 80vw, calc(100vw - 48px)"
                className="max-h-[500px] w-auto max-w-full object-contain transition-opacity duration-200 group-hover:opacity-90"
              />
              <span className="absolute bottom-3 right-3 rounded-full border border-black/10 bg-black/70 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                open full size
              </span>
            </a>
          </div>
          <figcaption className="border-t border-white/[0.07] px-4 py-4 text-xs leading-6 text-white/42 sm:px-6">
            TR-HASH MoE 200M reaches 47.29% Combined ARC: the zero-shot micro-average over all 2,376 ARC-Easy and 1,172 ARC-Challenge questions. The comparison uses complete public splits and one documented causal-choice scoring protocol; it does not isolate routing because training data, tokenizers and token budgets differ. The serving cards above remain a separate 187M CUDA-graph-compatible runtime result and are not used as evidence for this quality comparison.
          </figcaption>
        </motion.figure>

        <div className="mt-16 sm:mt-24">
          <SectionHeading
            eyebrow="Practical assistant smoke test"
            title="3/6 versus 1/6—useful signal, not a matched benchmark."
            description="Six fixed everyday prompts were sampled once per model with the same generation limits. TR-HASH full SFT produced a usable answer on three; base OPT-125M did so on one. The comparison is intentionally narrow and the training stages are not matched."
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-violet-400/20 bg-violet-400/[0.05] p-6">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-violet-200/60">TR-HASH MoE 200M · full SFT</p>
              <p className="mt-4 font-mono text-4xl tracking-[-0.05em] text-violet-100">3 / 6</p>
              <p className="mt-2 text-sm text-white/42">Correct fact present before any drift.</p>
            </div>
            <div className="rounded-2xl border border-white/[0.075] bg-white/[0.025] p-6">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">OPT-125M · base</p>
              <p className="mt-4 font-mono text-4xl tracking-[-0.05em] text-white/70">1 / 6</p>
              <p className="mt-2 text-sm text-white/42">Only the explicit name recall passed.</p>
            </div>
          </div>

          <div className="mt-3 overflow-x-auto rounded-2xl border border-white/[0.075]">
            <table className="min-w-[860px] w-full text-left text-sm">
              <thead className="border-b border-white/[0.07] bg-white/[0.025] font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">
                <tr>
                  <th className="px-4 py-4">Prompt</th>
                  <th className="px-4 py-4">Expected</th>
                  <th className="px-4 py-4 text-violet-200/70">TR-HASH 200M SFT</th>
                  <th className="px-4 py-4">OPT-125M base</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-white/52">
                {assistantPromptPanel.map((row) => (
                  <tr key={row.prompt} className="bg-black/10 align-top">
                    <td className="px-4 py-4 font-medium text-white/75">{row.prompt}</td>
                    <td className="px-4 py-4 text-white/38">{row.expected}</td>
                    <td className="px-4 py-4"><span className={row.trPass ? "text-emerald-300" : "text-rose-300"}>{row.trPass ? "✓" : "✕"}</span> <span className="ml-2">{row.trHash}</span></td>
                    <td className="px-4 py-4"><span className={row.optPass ? "text-emerald-300" : "text-rose-300"}>{row.optPass ? "✓" : "✕"}</span> <span className="ml-2">{row.opt}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 grid gap-3 rounded-2xl border border-amber-400/15 bg-amber-400/[0.035] p-5 text-xs leading-6 text-white/46 lg:grid-cols-[1fr_auto] lg:items-center">
            <p>
              Protocol: model-specific intended prompt wrapper, PyTorch CPU, fixed per-prompt seeds, temperature 0.4, top-k 30, top-p 0.85, repetition penalty 1.1 and 64 generated tokens. Manual semantic scoring accepts the expected fact before later drift. OPT-125M is a base model trained on about 180B tokens; TR-HASH is a 201.2M full-SFT assistant. This does not isolate routing, scale, data or architecture.
            </p>
            <a href="/data/tr-hash-200m-vs-opt-125m-prompt-panel.json" target="_blank" rel="noreferrer" className="font-mono text-[9px] uppercase tracking-[0.15em] text-amber-200/70 transition-colors hover:text-amber-100">
              raw outputs + protocol
            </a>
          </div>
        </div>

        <div className="mt-16 sm:mt-24">
          <SectionHeading
            eyebrow="Full-SFT expert geometry"
            title="Inspect the routed contribution—not an old proxy."
            description="This projection is regenerated from the released 201.2M full-SFT checkpoint on natural PIQA validation text, without a chat template. The layer menu exposes independently embedded layers 1, 4, 8, 12 and 16."
          />
          <div className="lab-surface overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3 sm:px-6">
              <span className="font-mono text-[10px] text-violet-300/70">TR-HASH MoE 200M full SFT · expert_tsne_3d.html</span>
              <div className="flex items-center gap-4">
                <a href="/ai-lab" className="font-mono text-[9px] uppercase tracking-[0.16em] text-violet-200/65 transition-colors hover:text-violet-100">
                  try 200M chat
                </a>
                <a
                  href="/expert_tsne_3d.metadata.json"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/30 transition-colors hover:text-white/70"
                >
                  provenance
                </a>
              </div>
            </div>
            <iframe
              src="/expert_tsne_3d.html"
              title="Interactive 3D t-SNE of TR-HASH MoE 200M full-SFT routed expert contributions"
              className="h-[560px] w-full border-0 sm:h-[700px] xl:h-[800px]"
              loading="lazy"
            />
            <div className="grid gap-3 border-t border-white/[0.07] px-4 py-4 text-xs leading-6 text-white/42 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <p>
                Each point is one of the two actual routed residual contributions for a sampled token. The shared MLP output is excluded; vectors are L2-normalized before PCA and 3-D t-SNE. Cluster separation remains exploratory and is not evidence of specialization or model quality.
              </p>
              <a
                href="/expert_tsne_3d.points.csv.gz"
                className="font-mono text-[9px] uppercase tracking-[0.15em] text-violet-200/60 transition-colors hover:text-violet-100"
              >
                download 6,000 points
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
