import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

function generateApiKey(userId: string, secret: string): string {
  const hash = crypto
    .createHmac("sha256", secret)
    .update(userId)
    .digest("hex")
    .slice(0, 40);
  return `sk-i64-${hash}`;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as Record<string, unknown>).id as string;
  const secret = process.env.NEXTAUTH_SECRET || "fallback";
  const apiKey = generateApiKey(userId, secret);

  return NextResponse.json({
    api_key: apiKey,
    user_id: userId,
    prefix: apiKey.slice(0, 14) + "...",
  });
}
