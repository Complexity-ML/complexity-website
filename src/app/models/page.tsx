"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Box, Hourglass, ScanSearch } from "lucide-react";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import SectionHeading from "@/components/SectionHeading";
import { Badge } from "@/components/ui/badge";

type ModelLink = { label: string; href: string };

type Model = {
  id: string;
  icon: typeof ScanSearch;
  tone: "cyan" | "amber" | "violet";
  status?: string;
  name: string;
  kicker: string;
  stats: { value: string; label: string }[];
  description: string[];
  links: ModelLink[];
};

const tones: Record<Model["tone"], { border: string; bg: string; text: string; statText: string }> = {
  cyan: { border: "border-cyan-400/20", bg: "bg-cyan-400/[0.04]", text: "text-cyan-200", statText: "text-cyan-100" },
  amber: { border: "border-amber-400/20", bg: "bg-amber-400/[0.04]", text: "text-amber-200", statText: "text-amber-100" },
  violet: { border: "border-violet-400/20", bg: "bg-violet-400/[0.04]", text: "text-violet-200", statText: "text-violet-100" },
};

const models: Model[] = [
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
    ],
    links: [
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
      { label: "Architecture deep-dive", href: "/i64" },
      { label: "Base pretrain (HF)", href: "https://huggingface.co/AETHORIA-AI/TR-HASH-MOE-500M-20B" },
      { label: "SFT experiment (HF)", href: "https://huggingface.co/AETHORIA-AI/TR-HASH-MOE-500M-HF" },
    ],
  },
  {
    id: "200m",
    icon: Hourglass,
    tone: "violet",
    status: "Training in progress",
    name: "TR-HASH 200M — 130B tokens",
    kicker: "Next generation, replay-scheduled pretrain",
    stats: [
      { value: "~201M", label: "parameters" },
      { value: "70B → 130B", label: "unique tokens, replayed" },
      { value: "4", label: "routed experts" },
    ],
    description: [
      "Currently training on a curated mixture (DCLM, FineWeb-Edu, Stack-Edu, FineMath, Cosmopedia-v2): 70B unique tokens replayed to a 130B-token schedule, wide shared SwiGLU branch with narrow routed experts.",
      "Checkpoints back up automatically to Hugging Face as the run progresses. Nothing below is a final result yet — this card will update as the run completes.",
    ],
    links: [{ label: "Model page (HF, live)", href: "https://huggingface.co/AETHORIA-AI/TR-HASH-200M-130B" }],
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
            title="Three generations, tracked honestly."
            description="Every checkpoint below ships with the numbers that actually happened — including the ones that didn't work yet. Compact vision, the first end-to-end pretrain, and the run currently in flight."
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
                      <Hourglass className="size-3" /> {model.status}
                    </Badge>
                  )}
                </div>

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
