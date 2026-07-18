import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { decrypt } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const session = await getServerSession(authOptions);
  const userId = (session?.user as Record<string, unknown> | undefined)?.dbId as string | undefined;
  if (!userId) return NextResponse.json({ error: "Sign in to test this key." }, { status: 401 });
  const key = await prisma.externalKey.findUnique({
    where: { userId_provider: { userId, provider: "openai" } },
    select: { encryptedKey: true },
  });
  if (!key) return NextResponse.json({ error: "No OpenAI API key is configured." }, { status: 404 });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      signal: controller.signal,
      headers: { Authorization: `Bearer ${decrypt(key.encryptedKey)}` },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({})) as { error?: { message?: string } };
      return NextResponse.json({ error: body.error?.message || `OpenAI rejected the key (${response.status}).` }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error && error.name === "AbortError" ? "OpenAI connection test timed out." : "Unable to reach OpenAI." }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
