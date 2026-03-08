import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/crypto";

const ALLOWED_PROVIDERS = ["openai", "anthropic", "google", "mistral"] as const;
type Provider = (typeof ALLOWED_PROVIDERS)[number];

function makePrefix(key: string): string {
  return key.slice(0, 8) + "...";
}

// GET /api/keys/external — list external keys (prefixes only, or reveal one)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbId = (session.user as Record<string, unknown>).dbId as string;
  const url = new URL(req.url);
  const revealProvider = url.searchParams.get("reveal");

  const keys = await prisma.externalKey.findMany({
    where: { userId: dbId },
    select: { provider: true, prefix: true, encryptedKey: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const result = keys.map((k) => {
    const base: Record<string, unknown> = {
      provider: k.provider,
      prefix: k.prefix,
      created_at: k.createdAt,
    };
    if (revealProvider === k.provider) {
      base.api_key = decrypt(k.encryptedKey);
    }
    return base;
  });

  return NextResponse.json({ keys: result });
}

// POST /api/keys/external — add or update an external key
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbId = (session.user as Record<string, unknown>).dbId as string;

  let body: { provider?: string; api_key?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const provider = body.provider as Provider;
  const apiKey = body.api_key;

  if (!provider || !ALLOWED_PROVIDERS.includes(provider)) {
    return NextResponse.json(
      { error: `Invalid provider. Allowed: ${ALLOWED_PROVIDERS.join(", ")}` },
      { status: 400 },
    );
  }

  if (!apiKey || typeof apiKey !== "string" || apiKey.length < 10) {
    return NextResponse.json({ error: "API key is required (min 10 chars)" }, { status: 400 });
  }

  const prefix = makePrefix(apiKey);
  const encryptedKey = encrypt(apiKey);

  // Upsert: one key per provider per user
  await prisma.externalKey.upsert({
    where: { userId_provider: { userId: dbId, provider } },
    update: { encryptedKey, prefix },
    create: { userId: dbId, provider, encryptedKey, prefix },
  });

  return NextResponse.json({ provider, prefix });
}

// DELETE /api/keys/external — remove an external key
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbId = (session.user as Record<string, unknown>).dbId as string;
  const url = new URL(req.url);
  const provider = url.searchParams.get("provider");

  if (!provider || !ALLOWED_PROVIDERS.includes(provider as Provider)) {
    return NextResponse.json(
      { error: `Invalid provider. Allowed: ${ALLOWED_PROVIDERS.join(", ")}` },
      { status: 400 },
    );
  }

  await prisma.externalKey.deleteMany({
    where: { userId: dbId, provider },
  });

  return NextResponse.json({ deleted: provider });
}
