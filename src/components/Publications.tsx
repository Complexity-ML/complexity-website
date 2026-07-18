"use client";

import { ArrowUpRight, BookOpen, Copy } from "lucide-react";
import { useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";

const citation = `@article{anonymous2026tokenidentity,
  title={Token identity provides a fixed routing signal for residual experts in language models},
  author={Anonymous},
  journal={Research manuscript},
  year={2026},
  url={https://www.complexity-ai.fr/papers/token-identity-routing-residual-experts.pdf}
}`;

export default function Publications() {
  const [copied, setCopied] = useState(false);

  const copyCitation = async () => {
    await navigator.clipboard.writeText(citation);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section id="publications" className="site-section scroll-mt-24 border-b border-white/[0.055] bg-black/[0.12]">
      <div className="site-shell">
        <SectionHeading
          eyebrow="Publication"
          title="One result, documented end to end."
          description="The manuscript, experimental boundaries and reusable citation live together instead of being scattered across external pages."
        />

        <article className="grid overflow-hidden rounded-2xl border border-white/[0.075] bg-white/[0.025] lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex min-h-[430px] flex-col p-6 sm:p-8 lg:p-10 xl:p-12">
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-200">2026 manuscript</span>
              <BookOpen className="size-5 text-white/24" />
            </div>
            <div className="mt-auto pt-20">
              <h3 className="max-w-4xl text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-4xl xl:text-5xl">
                Token identity provides a fixed routing signal for residual experts in language models
              </h3>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-white/48 sm:text-base">
                A parameter- and token-matched study of fixed token routing, dense shared computation and narrow residual experts—with standard task evaluation and learned-router controls.
              </p>
              <Button className="mt-8 bg-white text-black hover:bg-white/85" asChild>
                <a href="/papers/token-identity-routing-residual-experts.pdf" target="_blank" rel="noopener noreferrer">
                  Read hosted paper
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="flex flex-col border-t border-white/[0.07] bg-[#080a0e] lg:border-l lg:border-t-0">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <span className="font-mono text-[10px] text-white/38">citation.bib</span>
              <button onClick={copyCitation} className="flex items-center gap-2 text-[10px] text-white/35 transition-colors hover:text-white" type="button">
                <Copy className="size-3.5" />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="scrollbar-none flex-1 overflow-x-auto whitespace-pre-wrap p-5 font-mono text-[11px] leading-6 text-white/46 sm:p-7 sm:text-xs">
              <code>
                <span className="text-violet-300">@article</span>{`{anonymous2026tokenidentity,\n`}
                <span className="text-sky-300">  title</span>{`={Token identity provides a fixed routing signal for residual experts in language models},\n`}
                <span className="text-sky-300">  author</span>{`={Anonymous},\n`}
                <span className="text-sky-300">  journal</span>{`={Research manuscript},\n`}
                <span className="text-sky-300">  year</span>{`={2026},\n`}
                <span className="text-sky-300">  url</span>{`={https://www.complexity-ai.fr/papers/token-identity-routing-residual-experts.pdf}\n}`}
              </code>
            </pre>
          </div>
        </article>
      </div>
    </section>
  );
}
