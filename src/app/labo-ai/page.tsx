import type { Metadata } from "next";
import {
  Blocks,
  Bot,
  Braces,
  Download,
  ExternalLink,
  Github,
  Play,
  Save,
  Workflow,
} from "lucide-react";
import Footer from "@/components/Footer";
import LaboDownloads from "@/components/LaboDownloads";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "LABO AI | Agentic neural architecture lab",
  description:
    "Design, inspect and execute neural architectures as typed atomic graphs with an OpenAI-powered agent.",
  alternates: { canonical: "/labo-ai" },
  openGraph: {
    title: "LABO AI | Agentic neural architecture lab",
    description:
      "Build executable PyTorch models from typed atomic cards—with an agent that uses the same visible tools as you.",
    url: "https://www.complexity-ai.fr/labo-ai",
    type: "website",
  },
};

const features = [
  {
    icon: Blocks,
    title: "100+ executable cards",
    text: "Compose language, vision, multimodal and routing architectures from typed PyTorch atomics.",
  },
  {
    icon: Bot,
    title: "A tool-using graph agent",
    text: "Ask LABO can inspect, search, add, connect, arrange, run, save and export through bounded tools.",
  },
  {
    icon: Workflow,
    title: "Parallel-aware layout",
    text: "Stable ranks and lanes keep sequences, forks, joins and side-by-side comparisons readable.",
  },
  {
    icon: Braces,
    title: "Synchronized PyTorch",
    text: "Move between the visual graph and inspectable generated code without hiding the model behind a canvas.",
  },
  {
    icon: Play,
    title: "Local atomic execution",
    text: "Run, rerun, reset or step through an architecture and isolate failures between parallel models.",
  },
  {
    icon: Save,
    title: "Workspaces and export",
    text: "Save reusable presets locally, then export the complete graph as SVG or the model as Python.",
  },
];

const graphCards = [
  { label: "Token IDs", detail: "input", lane: "col-start-1 row-start-2", tone: "emerald" },
  { label: "Embedding", detail: "200k → H", lane: "col-start-2 row-start-2", tone: "blue" },
  { label: "RMSNorm", detail: "H", lane: "col-start-3 row-start-2", tone: "violet" },
  { label: "Causal SDPA", detail: "8 heads / 2 KV", lane: "col-start-4 row-start-1", tone: "violet" },
  { label: "Residual MLP", detail: "SwiGLU", lane: "col-start-4 row-start-3", tone: "amber" },
  { label: "Residual add", detail: "H + H", lane: "col-start-5 row-start-2", tone: "blue" },
  { label: "LM head", detail: "H → vocab", lane: "col-start-6 row-start-2", tone: "rose" },
];

const toneClasses: Record<string, string> = {
  emerald: "border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
  blue: "border-sky-400/35 bg-sky-400/10 text-sky-200",
  violet: "border-violet-400/35 bg-violet-400/10 text-violet-200",
  amber: "border-amber-400/35 bg-amber-400/10 text-amber-200",
  rose: "border-rose-400/35 bg-rose-400/10 text-rose-200",
};

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[112rem] overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d12] shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
      <div className="flex h-12 items-center justify-between border-b border-white/10 px-4">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-red-400/70" />
          <span className="size-2.5 rounded-full bg-amber-400/70" />
          <span className="size-2.5 rounded-full bg-emerald-400/70" />
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
          Architecture.graph
        </div>
        <Badge className="border-violet-400/30 bg-violet-400/10 text-violet-200">
          Agent ready
        </Badge>
      </div>

      <div className="grid min-h-[420px] grid-cols-[160px_1fr] sm:grid-cols-[210px_1fr]">
        <aside className="hidden border-r border-white/10 bg-black/20 p-4 sm:block">
          <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
            Block library
          </p>
          {[
            "Graph inputs",
            "Attention",
            "Residual",
            "Routing",
            "Generation",
            "Vision",
          ].map((item, index) => (
            <div
              key={item}
              className={`mb-2 rounded-lg border px-3 py-2 text-xs ${
                index === 1
                  ? "border-violet-400/30 bg-violet-400/10 text-violet-200"
                  : "border-transparent text-white/45"
              }`}
            >
              {item}
            </div>
          ))}
        </aside>

        <div className="relative overflow-hidden p-5 sm:p-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,.16) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-300/70">
                Ask LABO
              </p>
              <p className="mt-1 text-sm text-white/75">
                Build a compact GPT-like QA model and run it.
              </p>
            </div>
            <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 font-mono text-[10px] text-emerald-300">
              7 cards · valid
            </span>
          </div>

          <div className="relative grid min-w-[760px] grid-cols-6 grid-rows-3 items-center gap-x-6 gap-y-5 py-8">
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 size-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 1000 300"
            >
              <defs>
                <linearGradient id="elastic" x1="0" x2="1">
                  <stop stopColor="#34d399" />
                  <stop offset="0.45" stopColor="#8b5cf6" />
                  <stop offset="1" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
              <path d="M105 150 C150 150 165 150 205 150" stroke="url(#elastic)" strokeWidth="2" fill="none" opacity=".55" />
              <path d="M270 150 C320 150 330 150 370 150" stroke="url(#elastic)" strokeWidth="2" fill="none" opacity=".55" />
              <path d="M435 150 C500 150 470 55 550 55" stroke="url(#elastic)" strokeWidth="2" fill="none" opacity=".55" />
              <path d="M435 150 C500 150 470 245 550 245" stroke="url(#elastic)" strokeWidth="2" fill="none" opacity=".55" />
              <path d="M620 55 C700 55 675 150 730 150" stroke="url(#elastic)" strokeWidth="2" fill="none" opacity=".55" />
              <path d="M620 245 C700 245 675 150 730 150" stroke="url(#elastic)" strokeWidth="2" fill="none" opacity=".55" />
              <path d="M790 150 C845 150 850 150 895 150" stroke="url(#elastic)" strokeWidth="2" fill="none" opacity=".55" />
            </svg>
            {graphCards.map((card) => (
              <div
                key={card.label}
                className={`${card.lane} ${toneClasses[card.tone]} relative z-10 min-w-[112px] rounded-xl border p-3 shadow-lg backdrop-blur`}
              >
                <p className="text-xs font-semibold">{card.label}</p>
                <p className="mt-1 font-mono text-[9px] opacity-60">{card.detail}</p>
              </div>
            ))}
          </div>

          <div className="relative mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-black/35 px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-white/55">
              <Play className="size-3.5 text-emerald-300" />
              Atomic PyTorch execution
            </div>
            <span className="font-mono text-[10px] text-emerald-300">completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LaboAIPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <Navigation />

      <section className="relative px-4 pb-20 pt-32 sm:px-6 sm:pb-28 sm:pt-40">
        <div className="pointer-events-none absolute left-1/2 top-12 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[130px]" />
        <div className="site-shell text-center">
          <div className="mb-6 flex justify-center gap-2">
            <Badge className="border-violet-400/30 bg-violet-400/10 text-violet-200">OpenAI Build Week</Badge>
            <Badge variant="outline" className="border-white/15 text-white/55">Desktop alpha</Badge>
          </div>
          <h1 className="mx-auto max-w-4xl text-balance text-4xl font-bold tracking-[-0.04em] sm:text-6xl md:text-7xl">
            Neural architectures,
            <span className="block bg-gradient-to-r from-violet-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
              visible and executable.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            LABO AI turns PyTorch models into typed atomic graphs. Build by hand or ask an agent that uses the same visible, validated tools as you.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-12 bg-violet-500 px-6 text-white hover:bg-violet-400" asChild>
              <a href="/labo-ai/live">
                <Play className="size-4" />
                Try the web beta
              </a>
            </Button>
            <Button size="lg" variant="outline" className="h-12 border-white/15 bg-white/5 px-6" asChild>
              <a href="#download">
                <Download className="size-4" />
                Download desktop
              </a>
            </Button>
          </div>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">
            Free · Open source · macOS, Windows and Linux
          </p>
        </div>
      </section>

      <section className="site-shell pb-14 sm:pb-28">
        <ProductPreview />
      </section>

      <section className="border-y border-white/5 bg-white/[0.015] px-4 py-14 sm:px-6 sm:py-28">
        <div className="site-shell">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-300">One graph, four views</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">Understand what the model does.</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The visual graph, tensor contracts, generated PyTorch and local runtime share one typed model representation.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-2xl border border-white/10 bg-card/55 p-6 transition-colors hover:border-violet-400/30 hover:bg-card">
                <feature.icon className="size-5 text-violet-300" />
                <h3 className="mt-5 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-28">
        <div className="site-shell grid items-center gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-300">Demo</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">From a prompt to a running graph.</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Watch Ask LABO construct a compact GPT-like QA architecture, wire compatible ports, arrange it, generate PyTorch and execute it locally.
            </p>
            <Button variant="link" className="mt-4 h-auto p-0 text-violet-300" asChild>
              <a href="https://youtu.be/ZmLuFFJaXgc" target="_blank" rel="noopener noreferrer">
                Open on YouTube <ExternalLink className="size-3.5" />
              </a>
            </Button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
            <div className="aspect-video">
              <iframe
                className="size-full"
                src="https://www.youtube-nocookie.com/embed/ZmLuFFJaXgc?rel=0"
                title="LABO AI agent demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      <LaboDownloads />

      <section className="px-4 py-20 text-center sm:px-6 sm:py-28">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Models should be inspectable.</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Explore the source, build a graph and tell us which atomic capability should come next.
          </p>
          <Button size="lg" variant="outline" className="mt-8 border-white/15 bg-white/5" asChild>
            <a href="https://github.com/Complexity-ML/labo-ai" target="_blank" rel="noopener noreferrer">
              <Github className="size-4" /> View LABO AI on GitHub
            </a>
          </Button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
