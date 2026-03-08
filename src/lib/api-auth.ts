import crypto from "crypto";
import { prisma } from "./prisma";

/**
 * Validate a Bearer i64_... API key and return the user ID.
 * Used by proxy routes that authenticate via API key instead of session.
 */
export async function validateApiKey(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const rawKey = authHeader.slice(7);
  if (!rawKey.startsWith("i64_")) return null;

  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    select: { userId: true },
  });

  return apiKey?.userId ?? null;
}
