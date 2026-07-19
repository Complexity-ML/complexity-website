import { NextResponse } from "next/server";

const REPOSITORY = "Complexity-ML/labo-ai";
const LATEST_RELEASE = `https://github.com/${REPOSITORY}/releases/latest`;

const ASSET_SUFFIXES = {
  "mac-dmg": "LABO-AI-Setup-arm64.dmg",
  "windows-installer": "LABO-AI-Setup-x64.exe",
} as const;

interface GitHubRelease {
  assets: Array<{ name: string; browser_download_url: string }>;
}

function latestReleaseRedirect() {
  return NextResponse.redirect(LATEST_RELEASE, { status: 307 });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ asset: string }> },
) {
  const { asset } = await params;
  const suffix = ASSET_SUFFIXES[asset as keyof typeof ASSET_SUFFIXES];
  if (!suffix) return NextResponse.json({ error: "Unknown LABO AI download" }, { status: 404 });

  try {
    const response = await fetch(`https://api.github.com/repos/${REPOSITORY}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json" },
      cache: "no-store",
    });
    if (!response.ok) return latestReleaseRedirect();

    const release = await response.json() as GitHubRelease;
    const download = release.assets.find((candidate) => candidate.name === suffix)?.browser_download_url;
    if (!download) return latestReleaseRedirect();

    return NextResponse.redirect(download, { status: 307 });
  } catch {
    return latestReleaseRedirect();
  }
}
