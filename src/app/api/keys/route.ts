import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function generateRawKey(): string {
  return `i64_${crypto.randomBytes(24).toString("hex")}`;
}

function hashKey(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

// GET /api/keys — get current key prefix (never returns full key)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbId = (session.user as Record<string, unknown>).dbId as string;

  const existing = await prisma.apiKey.findFirst({
    where: { userId: dbId },
    select: { prefix: true, createdAt: true },
  });

  if (!existing) {
    return NextResponse.json({ has_key: false });
  }

  return NextResponse.json({
    has_key: true,
    prefix: existing.prefix,
    created_at: existing.createdAt,
  });
}

// POST /api/keys — generate or regenerate key (returns full key ONCE)
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbId = (session.user as Record<string, unknown>).dbId as string;

  // Delete old key(s) for this user
  await prisma.apiKey.deleteMany({ where: { userId: dbId } });

  // Generate new key
  const rawKey = generateRawKey();
  const prefix = rawKey.slice(0, 12) + "...";

  await prisma.apiKey.create({
    data: {
      userId: dbId,
      keyHash: hashKey(rawKey),
      prefix,
    },
  });

  // Return full key — this is the only time it's visible
  return NextResponse.json({
    api_key: rawKey,
    prefix,
    message: "Save this key — it won't be shown again.",
  });
}
