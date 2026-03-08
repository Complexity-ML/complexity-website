import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/crypto";
import crypto from "crypto";

function generateRawKey(): string {
  return `i64_${crypto.randomBytes(24).toString("hex")}`;
}

function hashKey(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

// GET /api/keys — get key info (prefix only, or full key with ?reveal=true)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbId = (session.user as Record<string, unknown>).dbId as string;

  const existing = await prisma.apiKey.findFirst({
    where: { userId: dbId },
    select: { prefix: true, encryptedKey: true, createdAt: true },
  });

  if (!existing) {
    return NextResponse.json({ has_key: false });
  }

  const url = new URL(req.url);
  if (url.searchParams.get("reveal") === "true") {
    if (!existing.encryptedKey) {
      return NextResponse.json({
        has_key: true,
        error: "Legacy key — please regenerate to enable reveal.",
        prefix: existing.prefix,
        created_at: existing.createdAt,
      });
    }
    const apiKey = decrypt(existing.encryptedKey);
    return NextResponse.json({
      has_key: true,
      api_key: apiKey,
      prefix: existing.prefix,
      created_at: existing.createdAt,
    });
  }

  return NextResponse.json({
    has_key: true,
    prefix: existing.prefix,
    created_at: existing.createdAt,
  });
}

// POST /api/keys — generate or regenerate key
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
      encryptedKey: encrypt(rawKey),
      prefix,
    },
  });

  return NextResponse.json({
    api_key: rawKey,
    prefix,
  });
}
