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
  citation: string;
};

const papers: Paper[] = [
  {
    id: "200m",
    badge: "Release paper · 2026",
    title: "TR-Hash 200M: Multi-Hash Token Routing Across 162B Token Exposures and Full-Parameter SFT",
    description:
      "The complete 201.2M release record: multi-hash architecture, 130B replay pretraining, the interrupted 32.07B full-parameter refinement, three full-SFT epochs, held-out loss, PIQA checkpoint selection, artifacts and limitations.",
    href: "/papers/tr-hash-200m-multi-hash-routing.pdf",
    citation: `@misc{peyriguere2026trhash200m,
  title={TR-Hash 200M: Multi-Hash Token Routing Across 162B Token Exposures and Full-Parameter SFT},
  author={Boris Peyriguere},
  note={Release paper},
  year={2026},
  url={https://www.complexity-ai.fr/papers/tr-hash-200m-multi-hash-routing.pdf}
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
          <div className="mt-8 flex flex-wrap gap-3">
            {paper.id === "200m" && (
              <Button className="bg-white text-black hover:bg-white/85" asChild>
                <a href="/ai-lab">Try the 200M chat</a>
              </Button>
            )}
            <Button variant={paper.id === "200m" ? "outline" : "default"} className={paper.id === "200m" ? "border-white/12 bg-white/[0.03]" : "bg-white text-black hover:bg-white/85"} asChild>
              <a href={paper.href} target="_blank" rel="noopener noreferrer">
                Read report
                <ArrowUpRight className="size-4" />
              </a>
            </Button>
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
