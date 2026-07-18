"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Boxes, GitBranch, Scale, ShieldCheck, TrendingDown } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";

const claims = [
  {
    icon: GitBranch,
    code: "01 / signal",
    title: "Token identity is enough to route a residual path.",
    text: "A fixed vocabulary table replaces the learned gate. Routing is deterministic, auditable and has no collapse mode.",
    accent: "text-emerald-300 border-emerald-400/20 bg-emerald-400/[0.055]",
  },
  {
    icon: Boxes,
    code: "02 / capacity",
    title: "A shared expert keeps the contextual backbone.",
    text: "Common syntax and language structure remain dense while narrow residual experts partition lexical capacity.",
    accent: "text-sky-300 border-sky-400/20 bg-sky-400/[0.055]",
  },
  {
    icon: Scale,
    code: "03 / control",
    title: "Evidence is matched before it is compared.",
    text: "The headline run compares 306.5M-parameter models over the same 8B-token FineWeb-Edu budget.",
    accent: "text-violet-300 border-violet-400/20 bg-violet-400/[0.055]",
  },
  {
    icon: TrendingDown,
    code: "04 / result",
    title: "The advantage appears late, then remains.",
    text: "Token-Routed first wins at logged step 740 and ends with a −0.0163 smoothed training-loss gap.",
    accent: "text-amber-300 border-amber-400/20 bg-amber-400/[0.055]",
  },
];

export default function ResearchStory() {
  return (
    <section id="research" className="site-section scroll-mt-24 border-b border-white/[0.055]">
      <div className="site-shell">
        <SectionHeading
          eyebrow="Research / source of truth"
          title={<>Deterministic routing.<br className="hidden sm:block" /> Claims kept precise.</>}
          description="The current manuscript tests one focused idea: whether stable token identity can allocate useful residual capacity while a shared path preserves contextual computation."
          action={
            <Button variant="outline" className="border-white/12 bg-white/[0.03]" asChild>
              <a href="/papers/token-identity-routing-residual-experts.pdf" target="_blank" rel="noopener noreferrer">
                Read hosted PDF
                <ArrowUpRight className="size-4" />
              </a>
            </Button>
          }
        />

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {claims.map((claim, index) => {
            const Icon = claim.icon;
            return (
              <motion.article
                key={claim.code}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className={`group min-h-[300px] rounded-2xl border p-5 transition-transform duration-300 hover:-translate-y-1 sm:p-6 xl:min-h-[350px] ${claim.accent}`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] opacity-60">{claim.code}</p>
                  <Icon className="size-4 opacity-70" />
                </div>
                <h3 className="mt-16 text-xl font-medium leading-tight tracking-[-0.025em] text-white sm:text-2xl xl:mt-24">
                  {claim.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-white/48">{claim.text}</p>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-4 grid gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300">
              <ShieldCheck className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">Scope guardrails</p>
              <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">what the result does not claim</p>
            </div>
          </div>
          <ul className="grid gap-2 text-xs leading-5 text-white/48 md:grid-cols-3">
            <li className="rounded-xl border border-white/[0.055] bg-black/15 p-3">Quality at matched tokens is not a pure speed benchmark.</li>
            <li className="rounded-xl border border-white/[0.055] bg-black/15 p-3">The vLLM throughput result uses the separate 187M serving model.</li>
            <li className="rounded-xl border border-white/[0.055] bg-black/15 p-3">Single-seed limits and learned-router controls remain explicit.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
