import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import LogoMark from "@/components/LogoMark";

const groups = [
  {
    title: "Explore",
    links: [
      { label: "Research", href: "/#research" },
      { label: "Projects", href: "/#projects" },
      { label: "Benchmarks", href: "/#benchmark" },
      { label: "Architecture", href: "/i64" },
    ],
  },
  {
    title: "Build",
    links: [
      { label: "LABO AI", href: "/labo-ai" },
      { label: "AI LAB", href: "/ai-lab" },
      { label: "Discord community", href: "https://discord.gg/EyDqXqpxWu" },
      { label: "GitHub", href: "https://github.com/Complexity-ML" },
      { label: "HuggingFace", href: "https://huggingface.co/Pacific-i64" },
    ],
  },
  {
    title: "Research",
    links: [
      { label: "Hosted paper", href: "/papers/token-identity-routing-residual-experts.pdf" },
      { label: "Interactive paper", href: "https://huggingface.co/spaces/Pacific-i64/Token-Routing-Interactive-Paper" },
      { label: "Paper artifacts", href: "https://github.com/Complexity-ML/tmlr-paper-pool" },
      { label: "vllm-i64", href: "https://github.com/Complexity-ML/vllm-i64" },
      { label: "TR-Hash 0.5B", href: "https://huggingface.co/AETHORIA-AI/TR-HASH-MOE-500M-HF" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "My account", href: "/dashboard/settings" },
      { label: "Privacy", href: "/privacy" },
      { label: "Sign in", href: "/auth/signin" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.07] bg-[#07090c]">
      <div className="site-shell py-12 sm:py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-20">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <LogoMark className="size-10" />
              <span className="font-semibold tracking-[0.08em]">COMPLEXITY</span>
            </Link>
            <p className="mt-6 max-w-lg text-sm leading-7 text-white/42 sm:text-base">
              Open-source AI research for efficient, inspectable transformer architectures and executable model tooling.
            </p>
            <p className="mt-8 font-mono text-[9px] uppercase tracking-[0.2em] text-white/22">Paris · France · Open science</p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {groups.map((group) => (
              <div key={group.title}>
                <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.2em] text-white/28">{group.title}</p>
                <ul className="space-y-3">
                  {group.links.map((link) => {
                    const external = link.href.startsWith("http");
                    return (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          target={external ? "_blank" : undefined}
                          rel={external ? "noopener noreferrer" : undefined}
                          className="group inline-flex items-center gap-1.5 text-sm text-white/48 transition-colors hover:text-white"
                        >
                          {link.label}
                          {external && <ArrowUpRight className="size-3 opacity-35 group-hover:opacity-100" />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.07] pt-6 text-[10px] text-white/25 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Complexity-ML. All research claims subject to the stated experimental limits.</p>
          <p className="font-mono uppercase tracking-[0.14em]">Code and artifact licenses vary by repository</p>
        </div>
      </div>
    </footer>
  );
}
