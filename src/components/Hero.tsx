"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, Github, Route, Scale, Terminal, Zap } from "lucide-react";
import { FaDiscord } from "react-icons/fa6";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const metrics = [
  { value: "201.2M", label: "parameters", color: "text-sky-300" },
  { value: "≈162B", label: "source exposure", color: "text-violet-300" },
  { value: "32K", label: "vocabulary", color: "text-emerald-300" },
  { value: "top-2", label: "hash routing", color: "text-amber-300" },
];

const flow = [
  { icon: Route, title: "token_id", detail: "stable identity", tone: "border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-200" },
  { icon: Scale, title: "route_table", detail: "fixed assignment", tone: "border-sky-400/25 bg-sky-400/[0.07] text-sky-200" },
  { icon: Zap, title: "expert[e]", detail: "residual path", tone: "border-violet-400/25 bg-violet-400/[0.07] text-violet-200" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.06] pt-28 sm:pt-32 lg:flex lg:min-h-[min(1000px,100svh)] lg:items-center lg:pt-24">
      <div className="hairline-grid pointer-events-none absolute inset-0 opacity-35 [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
      <div className="pointer-events-none absolute left-[8%] top-[16%] size-[36rem] rounded-full bg-emerald-500/[0.08] blur-[130px]" />
      <div className="pointer-events-none absolute right-[5%] top-[8%] size-[32rem] rounded-full bg-violet-500/[0.08] blur-[130px]" />

      <div className="site-shell relative z-10 grid gap-9 pb-10 sm:gap-14 sm:pb-20 lg:grid-cols-[minmax(0,0.88fr)_minmax(540px,1.12fr)] lg:items-center lg:gap-16 lg:pb-12 xl:gap-24">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="max-w-3xl"
        >
          <div className="mb-7 flex flex-wrap items-center gap-2">
            <Badge className="border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-emerald-200">
              <span className="mr-2 size-1.5 rounded-full bg-emerald-300" />
              Open research
            </Badge>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">Paris · 2026</span>
          </div>

          <p className="mb-4 font-mono text-xs text-primary/80">complexity.deep / routing</p>
          <h1 className="text-balance text-[clamp(3.2rem,6.4vw,7.2rem)] font-semibold leading-[0.88] tracking-[-0.07em]">
            Efficient models,
            <span className="mt-2 block bg-gradient-to-r from-emerald-200 via-sky-200 to-violet-300 bg-clip-text text-transparent">
              less hidden magic.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-pretty text-base leading-7 text-white/58 sm:text-lg sm:leading-8 xl:text-xl">
            We build inspectable transformer systems around deterministic token routing, shared expert capacity and executable open-source tooling.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button size="lg" className="h-12 bg-white px-6 text-black hover:bg-white/85" asChild>
              <Link href="/models">
                <BookOpen className="size-4" />
                Read the research
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 border-white/12 bg-white/[0.035] px-6" asChild>
              <a href="/labo-ai">Explore LABO AI</a>
            </Button>
            <Button size="lg" variant="outline" className="h-12 border-violet-400/25 bg-violet-400/[0.07] px-6 text-violet-100 hover:bg-violet-400/[0.12]" asChild>
              <a href="https://discord.gg/EyDqXqpxWu" target="_blank" rel="noopener noreferrer">
                <FaDiscord className="size-4" />
                Join the community
              </a>
            </Button>
            <Button size="lg" variant="ghost" className="h-12 px-5 text-white/50 hover:text-white" asChild>
              <a href="https://github.com/Complexity-ML" target="_blank" rel="noopener noreferrer">
                <Github className="size-4" />
                GitHub
              </a>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="relative mx-auto w-full max-w-[760px]"
        >
          <div className="lab-surface overflow-hidden rounded-[1.4rem]">
            <div className="flex h-12 items-center justify-between border-b border-white/[0.07] bg-black/20 px-4 sm:px-5">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-red-400/60" />
                <span className="size-2.5 rounded-full bg-amber-400/60" />
                <span className="size-2.5 rounded-full bg-emerald-400/60" />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/28">routing_profile.py</span>
              <Terminal className="size-3.5 text-white/28" />
            </div>

            <div className="dot-grid relative p-5 sm:p-7 lg:p-8">
              <div className="mb-7 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-xl border border-white/[0.07] bg-black/25 p-3.5">
                    <p className={`font-mono text-lg font-semibold sm:text-xl ${metric.color}`}>{metric.value}</p>
                    <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-white/33">{metric.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
                {flow.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="contents">
                      <div className={`rounded-xl border p-4 ${item.tone}`}>
                        <Icon className="mb-6 size-4 opacity-80" />
                        <p className="font-mono text-xs font-semibold">{item.title}</p>
                        <p className="mt-1 text-[10px] opacity-50">{item.detail}</p>
                      </div>
                      {index < flow.length - 1 && (
                        <ArrowRight className="mx-auto hidden size-4 text-white/22 sm:block" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.07] bg-[#07090d]/85 p-4 font-mono text-[11px] leading-6 text-white/55 sm:p-5 sm:text-xs">
                <p><span className="text-violet-300">def</span> <span className="text-sky-300">route</span>(token_id):</p>
                <p className="pl-4"><span className="text-white/28"># fixed, inspectable, no learned gate</span></p>
                <p className="pl-4"><span className="text-violet-300">return</span> shared(x) <span className="text-amber-300">+</span> experts[table[token_id]](x)</p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4 font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">
                <span>no learned router</span>
                <span className="text-emerald-300/75">status: full SFT released</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
