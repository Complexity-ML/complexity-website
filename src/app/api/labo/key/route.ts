import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

const provider = "openai";

async function currentUserId(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  return (session?.user as Record<string, unknown> | undefined)?.dbId as string | undefined;
}

function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  return !origin || origin === new URL(req.url).origin;
}

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Sign in to configure Ask LABO." }, { status: 401 });
  const key = await prisma.externalKey.findUnique({
    where: { userId_provider: { userId, provider } },
    select: { prefix: true },
  });
  return NextResponse.json({
    configured: Boolean(key),
    source: key ? "secure-storage" : "none",
    encryptionAvailable: true,
    prefix: key?.prefix,
  });
}

export async function POST(req: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Sign in to save an OpenAI API key." }, { status: 401 });
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const body = await req.json().catch(() => ({})) as { apiKey?: unknown };
  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
  if (apiKey.length < 20 || !apiKey.startsWith("sk-")) {
    return NextResponse.json({ error: "Enter a valid OpenAI API key." }, { status: 400 });
  }
  const prefix = `${apiKey.slice(0, 8)}…${apiKey.slice(-4)}`;
  const encryptedKey = encrypt(apiKey);
  await prisma.externalKey.upsert({
    where: { userId_provider: { userId, provider } },
    update: { encryptedKey, prefix },
    create: { userId, provider, encryptedKey, prefix },
  });
  return NextResponse.json({ configured: true, source: "secure-storage", encryptionAvailable: true, prefix });
}

export async function DELETE(req: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Sign in to remove this key." }, { status: 401 });
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  await prisma.externalKey.deleteMany({ where: { userId, provider } });
  return NextResponse.json({ configured: false, source: "none", encryptionAvailable: true });
}
