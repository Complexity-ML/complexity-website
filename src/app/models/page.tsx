"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Bot, Box, CheckCircle2, Network, ScanSearch } from "lucide-react";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import SectionHeading from "@/components/SectionHeading";
import { Badge } from "@/components/ui/badge";

type ModelLink = { label: string; href: string };

type Model = {
  id: string;
  icon: typeof ScanSearch;
  tone: "cyan" | "amber" | "emerald" | "violet";
  status?: string;
  name: string;
  kicker: string;
  stats: { value: string; label: string }[];
  description: string[];
  paper?: { title: string; doi: string; href: string };
  links: ModelLink[];
};

const tones: Record<Model["tone"], { border: string; bg: string; text: string; statText: string }> = {
  cyan: { border: "border-cyan-400/20", bg: "bg-cyan-400/[0.04]", text: "text-cyan-200", statText: "text-cyan-100" },
  amber: { border: "border-amber-400/20", bg: "bg-amber-400/[0.04]", text: "text-amber-200", statText: "text-amber-100" },
  emerald: { border: "border-emerald-400/20", bg: "bg-emerald-400/[0.04]", text: "text-emerald-200", statText: "text-emerald-100" },
  violet: { border: "border-violet-400/20", bg: "bg-violet-400/[0.04]", text: "text-violet-200", statText: "text-violet-100" },
};

const models: Model[] = [
  {
    id: "200m",
    icon: Network,
    tone: "violet",
    status: "Released · Full SFT live",
    name: "TR-HASH MoE 200M — ≈162B source",
    kicker: "130B pretrain → 32.07B refinement → full SFT",
    stats: [
      { value: "201.2M", label: "parameters" },
      { value: "≈162B", label: "source-token exposure" },
      { value: "69.10%", label: "PIQA acc_norm (SFT epoch 3)" },
    ],
    paper: {
      title: "Deterministic multi-hash routing supports long-horizon training in a compact language model",
      doi: "10.21203/rs.3.rs-10788774/v1",
      href: "https://doi.org/10.21203/rs.3.rs-10788774/v1",
    },
    description: [
      "The base pretraining run completed its 130B-token replay schedule. A fresh-optimizer full-parameter refinement then reached step 8,156 / 17,802, adding approximately 32.07B unique-token exposures before it was intentionally stopped; the refinement release is therefore an evaluated intermediate checkpoint, not a completed 70B pass.",
      "The released assistant is the 32,000-token full-parameter SFT trained directly from the refinement checkpoint for three epochs on the audited 300K mixture. Epoch 3 is published at the repository root and reaches 68.01% PIQA accuracy and 69.10% normalized accuracy.",
      "The cited checkpoint reaches 57.24% ARC-Easy, 27.13% ARC-Challenge and 47.29% Combined ARC on the complete public zero-shot splits. These results, the architecture and the complete training lineage are documented in the public Research Square preprint.",
    ],
    links: [
      { label: "Try the 200M chat", href: "/ai-lab?model=v1" },
      { label: "Model weights", href: "https://huggingface.co/AETHORIA-AI/TR-HASH-MoE-200M-160B-SFT" },
      { label: "Code", href: "https://github.com/Complexity-ML/complexity-framework" },
      { label: "Combined ARC benchmark", href: "/#benchmark" },
      { label: "130B base", href: "https://huggingface.co/AETHORIA-AI/TR-HASH-MoE-200M-130B" },
      { label: "≈162B refinement", href: "https://huggingface.co/AETHORIA-AI/TR-HASH-MoE-200M-160B-Refinement" },
      { label: "Live demo", href: "https://huggingface.co/spaces/Pacific-i64/TR-hash-tiny" },
      { label: "Interactive paper", href: "https://huggingface.co/spaces/Pacific-i64/Token-Routing-Interactive-Paper" },
    ],
  },
  {
    id: "100m-agentic",
    icon: Bot,
    tone: "emerald",
    status: "Released · Agentic SFT live",
    name: "TR-HASH MoE 100M Agentic",
    kicker: "125B pretraining lineage → refinement checkpoint → full SFT",
    stats: [
      { value: "100.4M", label: "parameters" },
      { value: "65.13%", label: "PIQA accuracy (direct-final)" },
      { value: "49.96%", label: "ARC-Easy accuracy" },
      { value: "22.87%", label: "ARC-Challenge accuracy" },
      { value: "41.01%", label: "Combined ARC accuracy" },
      { value: "30.39%", label: "HellaSwag accuracy" },
    ],
    description: [
      "The released assistant contains exactly 100,366,720 parameters and starts from token_pack_014_213622 in the public 100M Agentic refinement archive. It preserves deterministic top-2 token-ID routing across four experts, a shared SwiGLU path, 10 transformer layers and causal GQA.",
      "Full-parameter instruction tuning ran for three epochs on 200,000 training examples, with 10,000 held-out examples and exact PIQA decontamination. The run uses the model's native 32K Agentic tokenizer and chat boundaries with a 2,048-token sequence length. Its supervised targets cover direct final answers and tool calls; they do not contain synthetic thinking traces.",
      "The selected step 9,429 reduced matched validation loss from 1.876376 to 1.283129, a 31.62% relative reduction. On the complete public zero-shot splits, causal-choice scoring reaches 49.96% ARC-Easy, 22.87% ARC-Challenge, 41.01% Combined ARC and 30.39% HellaSwag accuracy. The complete 1,838-example PIQA validation split uses the separate Agentic direct-final protocol and reaches 65.13% accuracy.",
    ],
    links: [
      { label: "Try the 100M Agentic chat", href: "/ai-lab?model=v2" },
      { label: "Model weights", href: "https://huggingface.co/AETHORIA-AI/TR-HASH-MoE-100M-70B-Agentic-SFT" },
      { label: "Refinement archive", href: "https://huggingface.co/AETHORIA-AI/TR-HASH-MoE-100M-70B-Agentic-Refinement" },
      { label: "125B pretrain", href: "https://huggingface.co/AETHORIA-AI/TR-HASH-MoE-100M-125B-Agentic-Pretraining" },
      { label: "Agentic tokenizer", href: "https://huggingface.co/AETHORIA-AI/TR-HASH-Tokenizer-32K-Agentic" },
      { label: "SFT dataset", href: "https://huggingface.co/datasets/AETHORIA-AI/TR-HASH-Agentic-SFT-32K-21K" },
      { label: "Benchmark report", href: "/reports/tr-hash-100m-agentic-sft-zero-shot.json" },
      { label: "Code", href: "https://github.com/Complexity-ML/complexity-framework" },
      { label: "Live demo", href: "https://huggingface.co/spaces/Pacific-i64/TR-HASH-100M-Agentic" },
    ],
  },
  {
    id: "vision-v8",
    icon: ScanSearch,
    tone: "cyan",
    name: "TR-HASH Vision v8",
    kicker: "Compact object detection",
    stats: [
      { value: "2.53M", label: "parameters" },
      { value: "20.05", label: "AP50-95 (SFT)" },
      { value: "62.3%", label: "of 32.2 AP YOLO26 reference" },
    ],
    description: [
      "A hash-routed detector: a dense shared SwiGLU branch plus 8 narrow experts, top-2 routed by a deterministic hash of spatial-grid position — no learned gating, no auxiliary load-balancing loss.",
      "Two-stage recipe — from-scratch pretraining (Mosaic + MixUp, MuSGD) followed by a full-parameter, clean-image supervised fine-tuning stage. SFT alone moved AP50-95 from 16.59 to 20.05 (+20.9% relative), reaching 62.3% of the 32.2 AP YOLO26 reference used on our model cards. Single random-init run, no hyperparameter search, neither stage had plateaued.",
      "Independently reproduced — thanks to the community: O2M+NMS mAP50 0.325 / mAP50-95 0.200 / AR100 0.379, NMS-free mAP50 0.140 / mAP50-95 0.096 — matching our reported numbers.",
    ],
    links: [
      { label: "Read the paper", href: "/papers/tr-hash-vision-v8-sft.pdf" },
      { label: "Pretrain checkpoint", href: "https://huggingface.co/AETHORIA-AI/TR-HASH-Vision-v8-2M-COCO" },
      { label: "SFT checkpoint", href: "https://huggingface.co/AETHORIA-AI/TR-HASH-Vision-v8-2M-COCO-SFT" },
      { label: "Live demo", href: "https://huggingface.co/spaces/Pacific-i64/TR-HASH-Vision-v8-ComfyUI" },
    ],
  },
  {
    id: "500m",
    icon: Box,
    tone: "amber",
    name: "TR-HASH-MOE 500M",
    kicker: "First end-to-end pretrain — the guinea pig",
    stats: [
      { value: "492.1M", label: "parameters" },
      { value: "20B", label: "tokens" },
      { value: "4", label: "routed experts" },
    ],
    description: [
      "The first model that proved the architecture could learn end-to-end: deterministic token-identity routing across four residual experts, with one always-on shared SwiGLU path carrying shared context.",
      "An SFT follow-up on this base (LoRA, one full-shard epoch) wasn't pretrained long enough to pass our behavioral promotion gate — it isn't published as an assistant. But the metrics show real learning, not a dead run: full PIQA accuracy was retained (0.6953 → 0.6964) and matched eval loss dropped (3.68 → 2.98). The base simply needed more pretraining before instruction-following behavior could reliably stick — an instruction-coverage limit, not a capability regression.",
    ],
    links: [
      { label: "500M research paper", href: "/papers/tr-hash-deterministic-token-id-routing.pdf" },
      { label: "Base pretrain (HF)", href: "https://huggingface.co/AETHORIA-AI/TR-HASH-MOE-500M-20B" },
      { label: "SFT experiment (HF)", href: "https://huggingface.co/AETHORIA-AI/TR-HASH-MOE-500M-HF" },
    ],
  },
];

export default function ModelsPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <Navigation />

      <section className="relative border-b border-white/[0.06] pb-16 pt-36 sm:pb-20 sm:pt-44 lg:pt-52">
        <div className="hairline-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="site-shell relative z-10">
          <SectionHeading
            eyebrow="Model releases"
            title="Four releases, tracked honestly."
            description="Every checkpoint below ships with the numbers that actually happened — including interrupted runs and experiments that did not pass promotion. The released 200M and 100M Agentic assistants, compact vision, and the first end-to-end pretrain."
          />
        </div>
      </section>

      <section className="site-section">
        <div className="site-shell flex flex-col gap-6">
          {models.map((model, index) => {
            const Icon = model.icon;
            const tone = tones[model.tone];
            return (
              <motion.div
                key={model.id}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className={`overflow-hidden rounded-2xl border ${tone.border} ${tone.bg} p-6 sm:p-8 lg:p-10`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <span className={`grid size-11 shrink-0 place-items-center rounded-xl border ${tone.border} bg-black/15`}>
                      <Icon className={`size-5 ${tone.text}`} />
                    </span>
                    <div>
                      <p className={`font-mono text-[9px] uppercase tracking-[0.2em] ${tone.text} opacity-70`}>{model.kicker}</p>
                      <h3 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">{model.name}</h3>
                    </div>
                  </div>
                  {model.status && (
                    <Badge className={`border ${tone.border} ${tone.bg} ${tone.text}`}>
                      <CheckCircle2 className="size-3" /> {model.status}
                    </Badge>
                  )}
                </div>

                {model.paper && (
                  <a
                    href={model.paper.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-6 flex items-center justify-between gap-5 rounded-xl border border-violet-300/25 bg-violet-400/[0.09] p-4 transition-colors hover:border-violet-200/50 hover:bg-violet-400/[0.14] sm:p-5"
                  >
                    <div className="flex min-w-0 items-start gap-3.5">
                      <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-violet-300/25 bg-violet-300/[0.09] text-violet-100">
                        <BookOpen className="size-4.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-200">Official preprint</p>
                        <p className="mt-1 text-sm font-medium leading-5 text-white/88 sm:text-base">{model.paper.title}</p>
                        <p className="mt-2 truncate font-mono text-[10px] text-violet-200/75 sm:text-xs">DOI {model.paper.doi}</p>
                      </div>
                    </div>
                    <ArrowUpRight className="size-5 shrink-0 text-violet-200/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-100" />
                  </a>
                )}

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                  {model.stats.map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-white/[0.07] bg-black/15 p-4">
                      <p className={`font-mono text-xl tracking-[-0.03em] sm:text-2xl ${tone.statText}`}>{stat.value}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/35">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-3">
                  {model.description.map((paragraph, paragraphIndex) => (
                    <p key={paragraphIndex} className="max-w-3xl text-sm leading-7 text-white/52 sm:text-[15px]">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  {model.links.map((link) => {
                    const external = link.href.startsWith("http");
                    const Comp = external ? "a" : Link;
                    return (
                      <Comp
                        key={link.href}
                        href={link.href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        className={`group inline-flex items-center gap-1.5 rounded-lg border ${tone.border} bg-black/15 px-3.5 py-2 text-xs font-medium text-white/70 transition-colors hover:text-white`}
                      >
                        {link.label}
                        <ArrowUpRight className="size-3.5 opacity-45 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-90" />
                      </Comp>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <Footer />
    </main>
  );
}
