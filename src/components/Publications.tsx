"use client";

import { ArrowUpRight, BookOpen, Copy } from "lucide-react";
import { useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";

type Paper = {
  id: string;
  badge: string;
  title: string;
  description: string;
  href: string;
  doi?: string;
  citation: string;
  modelHref?: string;
  codeHref?: string;
};

const papers: Paper[] = [
  {
    id: "tr-hash-preprint",
    badge: "Preprint · 2026",
    title: "Deterministic multi-hash routing supports long-horizon training in a compact language model",
    description:
      "Research Square preprint describing deterministic multi-hash routing, long-horizon training and the compact TR-HASH language-model experiments.",
    href: "https://doi.org/10.21203/rs.3.rs-10788774/v1",
    doi: "10.21203/rs.3.rs-10788774/v1",
    modelHref: "https://huggingface.co/AETHORIA-AI/TR-HASH-MoE-200M-160B-SFT",
    codeHref: "https://github.com/Complexity-ML/complexity-framework",
    citation: `@article{Peyriguere_2026,
  title={Deterministic multi-hash routing supports long-horizon training in a compact language model},
  author={Peyriguere, Boris},
  year={2026},
  month={Aug},
  publisher={Springer Science and Business Media LLC},
  doi={10.21203/rs.3.rs-10788774/v1},
  url={https://doi.org/10.21203/rs.3.rs-10788774/v1}
}`,
  },
  {
    id: "vision-v8",
    badge: "Public report · 2026",
    title: "TR-Hash Vision: Deterministic Spatial-Token Routing for a Compact Object Detector",
    description:
      "A four-page report for the 2.53M-parameter hash-routed object detector: architecture, the two-stage from-scratch-pretrain-then-SFT recipe, and complete COCO AP results for both the one-to-many and NMS-free branches.",
    href: "/papers/tr-hash-vision-v8-sft.pdf",
    citation: `@misc{peyriguere2026trhashvision,
  title={TR-Hash Vision: Deterministic Spatial-Token Routing for a Compact Object Detector},
  author={Boris Peyriguere},
  note={Research report},
  year={2026},
  url={https://www.complexity-ai.fr/papers/tr-hash-vision-v8-sft.pdf}
}`,
  },
];

function PaperCard({ paper }: { paper: Paper }) {
  const [copied, setCopied] = useState(false);

  const copyCitation = async () => {
    await navigator.clipboard.writeText(paper.citation);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <article className="grid overflow-hidden rounded-2xl border border-white/[0.075] bg-white/[0.025] lg:grid-cols-[1.15fr_0.85fr]">
      <div className="flex min-h-[380px] flex-col p-6 sm:p-8 lg:p-10 xl:p-12">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-200">{paper.badge}</span>
          <BookOpen className="size-5 text-white/24" />
        </div>
        <div className="mt-auto pt-16">
          <h3 className="max-w-4xl text-balance text-2xl font-semibold leading-[1.1] tracking-[-0.04em] sm:text-3xl xl:text-4xl">
            {paper.title}
          </h3>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/48 sm:text-base">
            {paper.description}
          </p>
          {paper.doi && (
            <a
              href={paper.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex max-w-full items-center gap-2 rounded-lg border border-violet-300/25 bg-violet-400/[0.08] px-3.5 py-2 font-mono text-[10px] text-violet-100 transition-colors hover:border-violet-200/45 hover:bg-violet-400/[0.13] sm:text-xs"
            >
              <span className="font-bold uppercase tracking-[0.16em] text-violet-200">DOI</span>
              <span className="truncate">{paper.doi}</span>
              <ArrowUpRight className="size-3.5 shrink-0" />
            </a>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button className="bg-white text-black hover:bg-white/85" asChild>
              <a href={paper.href} target="_blank" rel="noopener noreferrer">
                {paper.id === "tr-hash-preprint" ? "Open official preprint" : "Read report"}
                <ArrowUpRight className="size-4" />
              </a>
            </Button>
            {paper.modelHref && (
              <Button variant="outline" className="border-white/12 bg-white/[0.03]" asChild>
                <a href={paper.modelHref} target="_blank" rel="noopener noreferrer">
                  Model weights
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
            )}
            {paper.codeHref && (
              <Button variant="outline" className="border-white/12 bg-white/[0.03]" asChild>
                <a href={paper.codeHref} target="_blank" rel="noopener noreferrer">
                  Code
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
            )}
          </div>
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
          <code>{paper.citation}</code>
        </pre>
      </div>
    </article>
  );
}

export default function Publications() {
  return (
    <section id="publications" className="site-section scroll-mt-24 border-b border-white/[0.055] bg-black/[0.12]">
      <div className="site-shell">
        <SectionHeading
          eyebrow="Research reports"
          title="TR-Hash, documented end to end."
          description="Every report lives with its architecture facts, audited claims, explicit limitations and a reusable citation. Current release status and measured checkpoints are tracked separately on the Models page."
        />

        <div className="flex flex-col gap-4">
          {papers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </div>
      </div>
    </section>
  );
}
