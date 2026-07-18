import { ArrowUpRight, Braces, FlaskConical, MapPin } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

const principles = [
  { index: "01", title: "Inspectable by design", text: "Architecture choices, routing decisions and experimental caveats stay visible." },
  { index: "02", title: "Artifacts over claims", text: "Code, model releases, measurements and hosted papers accompany the narrative." },
  { index: "03", title: "Efficiency with controls", text: "Comparisons separate matched-token quality, training cost and serving throughput." },
];

export default function About() {
  return (
    <section id="about" className="site-section scroll-mt-24">
      <div className="site-shell">
        <div className="grid gap-14 xl:grid-cols-[0.75fr_1.25fr] xl:gap-24">
          <SectionHeading
            eyebrow="About the lab"
            title="Open systems for understandable AI."
            description="Complexity-ML is an independent open-source research lab in Paris, focused on transformer architecture, deterministic routing and practical model tooling."
            className="mb-0 self-start xl:sticky xl:top-28 xl:block"
          />

          <div>
            <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
              {principles.map((principle) => (
                <div key={principle.index} className="grid gap-4 py-7 sm:grid-cols-[64px_0.7fr_1fr] sm:items-start sm:gap-6 lg:py-9">
                  <span className="font-mono text-xs text-primary/55">{principle.index}</span>
                  <h3 className="text-xl font-medium tracking-[-0.025em] sm:text-2xl">{principle.title}</h3>
                  <p className="text-sm leading-7 text-white/45">{principle.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                <MapPin className="size-4 text-emerald-300" />
                <p className="mt-6 text-sm font-medium">Paris, France</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-white/28">48.8566° N · 2.3522° E</p>
              </div>
              <a href="https://github.com/Complexity-ML" target="_blank" rel="noopener noreferrer" className="group rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 transition-colors hover:bg-white/[0.05]">
                <Braces className="size-4 text-sky-300" />
                <p className="mt-6 flex items-center justify-between text-sm font-medium">Open source <ArrowUpRight className="size-3.5 opacity-40 group-hover:opacity-100" /></p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-white/28">GitHub organization</p>
              </a>
              <a href="/labo-ai" className="group rounded-xl border border-violet-400/15 bg-violet-400/[0.045] p-4 transition-colors hover:bg-violet-400/[0.08]">
                <FlaskConical className="size-4 text-violet-300" />
                <p className="mt-6 flex items-center justify-between text-sm font-medium">LABO AI <ArrowUpRight className="size-3.5 opacity-40 group-hover:opacity-100" /></p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-white/28">Visual architecture lab</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
