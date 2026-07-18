import { Apple, Check, Download, ExternalLink, MonitorDown, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const REPOSITORY = "Complexity-ML/labo-ai";
const FALLBACK_VERSION = "0.1.0";
const FALLBACK_RELEASE = `https://github.com/${REPOSITORY}/releases/tag/v${FALLBACK_VERSION}`;
const FALLBACK_ASSETS = `https://github.com/${REPOSITORY}/releases/download/v${FALLBACK_VERSION}`;

interface GitHubRelease {
  tag_name: string;
  html_url: string;
  assets: Array<{ name: string; browser_download_url: string }>;
}

interface DesktopRelease {
  version: string;
  releaseUrl: string;
  macDmg: string;
  macZip: string;
  windowsExe: string;
  windowsZip: string;
}

function fallbackRelease(): DesktopRelease {
  return {
    version: FALLBACK_VERSION,
    releaseUrl: FALLBACK_RELEASE,
    macDmg: `${FALLBACK_ASSETS}/LABO-AI-${FALLBACK_VERSION}-arm64.dmg`,
    macZip: `${FALLBACK_ASSETS}/LABO-AI-${FALLBACK_VERSION}-arm64-mac.zip`,
    windowsExe: `${FALLBACK_ASSETS}/LABO-AI-${FALLBACK_VERSION}-x64.exe`,
    windowsZip: `${FALLBACK_ASSETS}/LABO-AI-${FALLBACK_VERSION}-x64-win.zip`,
  };
}

async function latestDesktopRelease(): Promise<DesktopRelease> {
  try {
    const response = await fetch(`https://api.github.com/repos/${REPOSITORY}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!response.ok) return fallbackRelease();
    const release = await response.json() as GitHubRelease;
    const version = release.tag_name.replace(/^v/, "");
    const asset = (suffix: string) => release.assets.find((candidate) => candidate.name === `LABO-AI-${version}-${suffix}`)?.browser_download_url;
    const result = {
      version,
      releaseUrl: release.html_url,
      macDmg: asset("arm64.dmg"),
      macZip: asset("arm64-mac.zip"),
      windowsExe: asset("x64.exe"),
      windowsZip: asset("x64-win.zip"),
    };
    if (!result.macDmg || !result.macZip || !result.windowsExe || !result.windowsZip) return fallbackRelease();
    return result as DesktopRelease;
  } catch {
    return fallbackRelease();
  }
}

export default async function LaboDownloads() {
  const release = await latestDesktopRelease();
  return (
    <section id="download" className="relative scroll-mt-20 border-y border-white/5 bg-white/[0.015] px-4 py-14 sm:px-6 sm:py-24">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-72 max-w-3xl bg-violet-600/10 blur-[110px]" />
      <div className="site-shell relative">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-300">Download v{release.version}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">Run the complete local laboratory.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Desktop adds the native PyTorch player and OS-encrypted local credentials to the visual editor.</p>
        </div>
        <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-card/80 p-7">
            <Apple className="size-8 text-white" />
            <h3 className="mt-5 text-xl font-semibold">macOS</h3>
            <p className="mt-2 text-sm text-muted-foreground">Apple silicon · macOS 12 or later</p>
            <Button className="mt-7 w-full bg-white text-black hover:bg-white/85" asChild><a href={release.macDmg}><Download className="size-4" />Download DMG</a></Button>
            <Button variant="ghost" className="mt-2 w-full text-white/55" asChild><a href={release.macZip}>Portable ZIP</a></Button>
          </article>
          <article className="rounded-2xl border border-white/10 bg-card/80 p-7">
            <MonitorDown className="size-8 text-sky-300" />
            <h3 className="mt-5 text-xl font-semibold">Windows</h3>
            <p className="mt-2 text-sm text-muted-foreground">Windows 10/11 · x64</p>
            <Button className="mt-7 w-full bg-sky-500 text-white hover:bg-sky-400" asChild><a href={release.windowsExe}><Download className="size-4" />Download installer</a></Button>
            <Button variant="ghost" className="mt-2 w-full text-white/55" asChild><a href={release.windowsZip}>Portable ZIP</a></Button>
          </article>
        </div>
        <div className="mx-auto mt-5 flex max-w-5xl flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-6 py-5 text-sm sm:flex-row">
          <div className="flex items-center gap-3 text-white/65"><ShieldCheck className="size-5 text-emerald-300" />Open source · credentials encrypted by the operating system</div>
          <Button variant="ghost" size="sm" asChild><a href={release.releaseUrl} target="_blank" rel="noopener noreferrer">All downloads <ExternalLink className="size-3.5" /></a></Button>
        </div>
        <div className="mt-8 grid gap-3 text-sm text-white/50 sm:grid-cols-3">
          {["Typed graph validation", "Native PyTorch execution", "Inspectable generated code"].map((item) => <div key={item} className="flex items-center justify-center gap-2"><Check className="size-3.5 text-emerald-300" />{item}</div>)}
        </div>
      </div>
    </section>
  );
}
