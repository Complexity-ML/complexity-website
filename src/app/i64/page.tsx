"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, Boxes, Cpu, Github, GitMerge, Route, Scale } from "lucide-react";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import SectionHeading from "@/components/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "201.2M", label: "trainable parameters" },
  { value: "≈162B", label: "source-token exposure" },
  { value: "68.82 / 69.31%", label: "PIQA acc / acc_norm · full SFT epoch 2" },
  { value: "16", label: "persisted layer route tables" },
];

const comparisons = [
  {
    icon: Route,
    title: "Routing signal",
    dense: "Every token activates the same dense MLP capacity.",
    routed: "Multi-hash rendezvous voting compiles each token identity to a fixed top-2 expert pair.",
  },
  {
    icon: Scale,
    title: "Load balance",
    dense: "There is no conditional load to distribute.",
    routed: "The persisted table makes routing auditable in advance; runtime dispatch needs no learned gate or balancing loss.",
  },
  {
    icon: GitMerge,
    title: "Shared context",
    dense: "One monolithic path carries common and token-specific functions.",
    routed: "A shared dense path remains contextual; routing adds narrow residual capacity.",
  },
  {
    icon: Cpu,
    title: "Serving behavior",
    dense: "Uniform kernels are simple but activate every parameter in the block.",
    routed: "Expert dispatch trades implementation complexity for conditional execution.",
  },
];

export default function I64Page() {
  return (
    <main className="min-h-screen overflow-hidden">
      <Navigation />

      <section className="relative border-b border-white/[0.06] pb-20 pt-36 sm:pb-28 sm:pt-44 lg:pb-36 lg:pt-52">
        <div className="hairline-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="pointer-events-none absolute left-1/2 top-20 size-[45rem] -translate-x-1/2 rounded-full bg-sky-500/[0.07] blur-[150px]" />
        <div className="site-shell relative z-10">
          <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-5xl text-center">
            <Badge className="border-sky-400/20 bg-sky-400/[0.07] px-3 py-1.5 text-sky-200">TR-HASH MoE 200M · architecture field guide</Badge>
            <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.24em] text-white/30">dense.compute // token.routed</p>
            <h1 className="mt-5 text-balance text-[clamp(3.4rem,8vw,8.5rem)] font-semibold leading-[0.86] tracking-[-0.075em]">
              Fixed routes.
              <span className="mt-3 block bg-gradient-to-r from-white via-sky-200 to-emerald-200 bg-clip-text text-transparent">Context stays shared.</span>
            </h1>
            <p className="mx-auto mt-8 max-w-3xl text-pretty text-base leading-8 text-white/50 sm:text-lg">
              The released 201.2M-parameter model uses a shared SwiGLU path plus deterministic multi-hash top-2 residual experts in each of its 16 layers. Its promoted full-SFT epoch-2 checkpoint scores 68.82% PIQA accuracy and 69.31% normalized accuracy.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" className="h-12 bg-white px-6 text-black hover:bg-white/85" asChild>
                <Link href="/ai-lab">
                  Try the 200M chat <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 border-white/12 bg-white/[0.03] px-6" asChild>
                <a href="/papers/tr-hash-200m-multi-hash-routing.pdf" target="_blank" rel="noopener noreferrer">
                  <BookOpen className="size-4" /> Read the 200M report
                </a>
              </Button>
              <Button size="lg" variant="outline" className="h-12 border-white/12 bg-white/[0.03] px-6" asChild>
                <a href="https://github.com/Complexity-ML/complexity-framework" target="_blank" rel="noopener noreferrer">
                  <Github className="size-4" /> Source artifacts
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-white/[0.06] bg-black/[0.12]">
        <div className="site-shell grid grid-cols-2 divide-x divide-y divide-white/[0.07] border-x border-white/[0.07] md:grid-cols-4 md:divide-y-0">
          {stats.map((stat) => (
            <div key={stat.label} className="p-5 text-center sm:p-8 lg:p-10">
              <p className="font-mono text-2xl tracking-[-0.04em] text-sky-200 sm:text-3xl lg:text-4xl">{stat.value}</p>
              <p className="mt-2 text-[9px] uppercase tracking-[0.16em] text-white/28">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="site-section border-b border-white/[0.06]">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Architecture / comparison"
            title="Dense is the reference concept. Routing is the realized system."
            description="This is the architecture realized by the released TR-HASH MoE 200M lineage. The dense column is a conceptual reference, not a benchmark: no parameter-matched dense control is claimed."
          />

          <div className="overflow-hidden rounded-2xl border border-white/[0.075]">
            <div className="hidden grid-cols-[240px_1fr_1fr] border-b border-white/[0.07] bg-white/[0.025] lg:grid">
              <div className="p-5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/25">axis</div>
              <div className="border-l border-white/[0.07] p-5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">dense residual</div>
              <div className="border-l border-emerald-400/15 bg-emerald-400/[0.03] p-5 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-200/70">token-routed residual</div>
            </div>
            {comparisons.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={false}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.04 }}
                  className="grid border-b border-white/[0.07] last:border-0 lg:grid-cols-[240px_1fr_1fr]"
                >
                  <div className="flex items-center gap-3 bg-white/[0.018] p-5 sm:p-6">
                    <span className="grid size-9 place-items-center rounded-lg border border-white/[0.07] bg-black/15 text-white/45"><Icon className="size-4" /></span>
                    <h3 className="text-sm font-medium">{item.title}</h3>
                  </div>
                  <div className="border-t border-white/[0.07] p-5 lg:border-l lg:border-t-0 lg:p-6">
                    <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/25 lg:hidden">dense</p>
                    <p className="text-sm leading-7 text-white/44">{item.dense}</p>
                  </div>
                  <div className="border-t border-emerald-400/10 bg-emerald-400/[0.025] p-5 lg:border-l lg:border-t-0 lg:p-6">
                    <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-300/55 lg:hidden">token-routed</p>
                    <p className="text-sm leading-7 text-white/58">{item.routed}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="site-section border-b border-white/[0.06] bg-black/[0.12]">
        <div className="site-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center xl:gap-20">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/75">forward.py</p>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">The idea fits in one residual equation.</h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/46 sm:text-base">Each layer persists a top-2 table compiled from multi-hash rendezvous voting. Token identity selects two narrow residual experts, but never replaces the shared contextual computation.</p>
          </div>
          <div className="lab-surface overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3">
              <span className="font-mono text-[10px] text-white/35">residual_mlp.py</span>
              <span className="font-mono text-[9px] text-emerald-300/65">valid</span>
            </div>
            <div className="overflow-x-auto p-5 font-mono text-xs leading-7 text-white/58 sm:p-7 sm:text-sm lg:p-9">
              <p><span className="text-violet-300">class</span> <span className="text-sky-300">TRHashEngineMLP</span>(nn.Module):</p>
              <p className="pl-4"><span className="text-violet-300">def</span> <span className="text-sky-300">forward</span>(self, x, token_ids):</p>
              <p className="pl-8">expert_pair = self.route_table[:, token_ids]  <span className="text-white/25"># compiled multi-hash top-2</span></p>
              <p className="pl-8">shared = self.shared_expert(x)</p>
              <p className="pl-8">routed = 2 * self.experts(x, expert_pair).mean(dim=0)</p>
              <p className="pl-8"><span className="text-violet-300">return</span> shared <span className="text-amber-300">+</span> routed</p>
            </div>
          </div>
        </div>
      </section>

      <section className="site-section">
        <div className="site-shell">
          <div className="relative overflow-hidden rounded-3xl border border-violet-400/15 bg-violet-400/[0.045] p-6 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-12 xl:p-14">
            <div className="pointer-events-none absolute right-0 top-0 size-72 rounded-full bg-violet-500/10 blur-[90px]" />
            <div className="relative max-w-3xl">
              <Badge className="border-violet-400/20 bg-violet-400/[0.08] text-violet-200"><Boxes className="mr-2 size-3.5" /> Visual tooling</Badge>
              <h2 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">Build the architecture instead of only reading about it.</h2>
              <p className="mt-4 text-sm leading-7 text-white/46 sm:text-base">LABO AI turns these primitives into typed cards, visible tensor flows and synchronized PyTorch.</p>
            </div>
            <Button size="lg" className="relative mt-8 h-12 bg-white px-6 text-black hover:bg-white/85 lg:mt-0" asChild>
              <Link href="/labo-ai">Open LABO AI <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
