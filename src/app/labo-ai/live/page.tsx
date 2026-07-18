import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "LABO AI Web Alpha | Visual neural architecture editor",
  description: "Use the LABO AI visual neural architecture editor directly in your browser.",
  alternates: { canonical: "/labo-ai/live" },
};

export default async function LaboLivePage() {
  const session = await getServerSession(authOptions);
  return (
    <main className="h-dvh overflow-hidden bg-[#07080b]">
      <Navigation />
      <section className="flex h-dvh min-h-0 flex-col px-2 pb-2 pt-[84px] sm:px-4 sm:pb-4">
        <div className="mb-3 flex min-h-10 shrink-0 flex-wrap items-center justify-between gap-3 px-1 sm:px-0">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/labo-ai" className="flex items-center gap-2 text-xs text-white/45 transition-colors hover:text-white"><ArrowLeft className="size-3.5" />Product</Link>
            <span className="h-4 w-px bg-white/10" />
            <span className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-violet-300">LABO AI / live workspace</span>
            <Badge className={`hidden sm:inline-flex ${session ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200" : "border-amber-400/25 bg-amber-400/10 text-amber-200"}`}>
              {session ? "Private workspace · auto-saved" : "Guest workspace · not saved"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="text-white/55" asChild><Link href="/labo-ai#download"><Download className="size-3.5" />Desktop</Link></Button>
            <Button size="sm" variant="outline" className="border-white/15 bg-white/5" asChild><a href="/labo-live" target="_blank" rel="noopener noreferrer">Raw full screen <ExternalLink className="size-3.5" /></a></Button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-white/10 bg-[#090a0e] shadow-[0_28px_90px_rgba(0,0,0,.6)]">
          <iframe
            src="/labo-live"
            title="LABO AI interactive web alpha"
            className="h-full w-full border-0"
            allow="clipboard-write"
          />
        </div>
      </section>
    </main>
  );
}
