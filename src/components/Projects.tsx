"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Blocks, Box, Braces, Cpu, Github, Network, ScanSearch } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import { Badge } from "@/components/ui/badge";

const projects = [
  {
    title: "TR-HASH MoE 200M",
    kicker: "Released full-parameter SFT",
    description: "Try the 201.2M assistant trained through a 130B-token base run, a 32.07B-token refinement and three full-SFT epochs. It reaches 69.31% normalized PIQA and answered 3/6 fixed everyday prompts versus 1/6 for base OPT-125M; this small panel is not a matched benchmark.",
    tags: ["201.2M parameters", "69.31% PIQA", "3/6 vs OPT 1/6"],
    href: "/ai-lab",
    source: "https://huggingface.co/AETHORIA-AI/TR-HASH-MoE-200M-160B-SFT",
    icon: Network,
    tone: "emerald",
    featured: true,
    span: "xl:col-span-7 xl:min-h-[400px]",
  },
  {
    title: "LABO AI",
    kicker: "Visual architecture laboratory",
    description: "Build, inspect and execute PyTorch architectures as typed atomic graphs—with an agent that uses the same visible tools.",
    tags: ["OpenAI", "Electron", "PyTorch"],
    href: "/labo-ai",
    source: "https://github.com/Complexity-ML/labo-ai",
    icon: Blocks,
    tone: "violet",
    featured: true,
    span: "xl:col-span-5 xl:min-h-[400px]",
  },
  {
    title: "TR-HASH Vision v8 Demo",
    kicker: "Interactive object detection",
    description: "Run the compact hash-routed COCO detector on your own image, or draw a new example from 100 shuffled validation images without repeats.",
    tags: ["2.53M parameters", "COCO", "Random 100"],
    href: "https://huggingface.co/spaces/Pacific-i64/TR-HASH-Vision-v8-ComfyUI",
    icon: ScanSearch,
    tone: "cyan",
    span: "xl:col-span-3",
  },
  {
    title: "TR-Hash-i64",
    kicker: "Serving engine",
    description: "Paged KV cache, continuous batching and an OpenAI-compatible API for token-routed inference.",
    tags: ["Inference", "CUDA", "API"],
    href: "https://github.com/Complexity-ML/TR-Hash-i64",
    icon: Cpu,
    tone: "sky",
    span: "xl:col-span-3",
  },
  {
    title: "AETHORIA-AI",
    kicker: "Hugging Face organization",
    description: "Every TR-Hash checkpoint, dataset and Space we publish, in one place — see /models on this site for the current releases with their real numbers.",
    tags: ["Models", "Datasets", "Spaces"],
    href: "https://huggingface.co/AETHORIA-AI",
    icon: Box,
    tone: "amber",
    span: "xl:col-span-3",
  },
  {
    title: "Complexity Framework",
    kicker: "PyTorch foundation",
    description: "Canonical TR-Hash MoE execution, multi-hash routing, GQA/MHA decoders, CUDA paths and full-parameter pretraining, refinement and SFT.",
    tags: ["PyTorch", "TR-Hash 200M", "Full SFT"],
    href: "https://github.com/Complexity-ML/complexity-framework",
    icon: Braces,
    tone: "rose",
    span: "xl:col-span-3",
  },
];

const tones: Record<string, string> = {
  violet: "border-violet-400/20 bg-violet-400/[0.05] text-violet-200",
  cyan: "border-cyan-400/20 bg-cyan-400/[0.05] text-cyan-100",
  emerald: "border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-200",
  sky: "border-sky-400/20 bg-sky-400/[0.05] text-sky-200",
  amber: "border-amber-400/20 bg-amber-400/[0.05] text-amber-200",
  rose: "border-rose-400/20 bg-rose-400/[0.05] text-rose-200",
};

export default function Projects() {
  return (
    <section id="projects" className="site-section scroll-mt-24 border-b border-white/[0.055] bg-black/[0.12]">
      <div className="site-shell">
        <SectionHeading
          eyebrow="Open-source stack"
          title="Research that ships as artifacts."
          description="Models, runtimes, experiments and visual tools share one objective: make advanced architecture work easier to inspect and reproduce."
          action={
            <a className="inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-white" href="https://github.com/Complexity-ML" target="_blank" rel="noopener noreferrer">
              <Github className="size-4" />
              View organization
              <ArrowUpRight className="size-3.5" />
            </a>
          }
        />

        <div className="grid auto-rows-fr gap-3 md:grid-cols-2 xl:grid-cols-12">
          {projects.map((project, index) => {
            const Icon = project.icon;
            return (
              <motion.a
                key={project.title}
                href={project.href}
                target={project.href.startsWith("http") ? "_blank" : undefined}
                rel={project.href.startsWith("http") ? "noopener noreferrer" : undefined}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.42, delay: index * 0.045 }}
                className={`group relative flex min-h-[280px] flex-col overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:brightness-110 sm:p-6 ${tones[project.tone]} ${project.span}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-11 place-items-center rounded-xl border border-current/20 bg-black/15">
                    <Icon className="size-5" />
                  </span>
                  <ArrowUpRight className="size-4 opacity-35 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-80" />
                </div>

                <div className="mt-auto pt-14">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-[0.48]">{project.kicker}</p>
                  <h3 className={`mt-2 font-semibold tracking-[-0.035em] text-white ${project.featured ? "text-3xl sm:text-4xl" : "text-2xl"}`}>{project.title}</h3>
                  <p className={`mt-3 max-w-xl leading-6 text-white/48 ${project.featured ? "text-sm sm:text-base" : "text-sm"}`}>{project.description}</p>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="border-current/15 bg-black/10 text-[9px] font-normal text-current/70">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
