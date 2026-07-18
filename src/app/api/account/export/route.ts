import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as Record<string, unknown> | undefined)?.dbId as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      accounts: { select: { provider: true, providerAccountId: true, type: true } },
      apiKeys: { select: { id: true, prefix: true, createdAt: true } },
      externalKeys: { select: { id: true, provider: true, prefix: true, createdAt: true } },
      ownedTeams: { select: { id: true, name: true, createdAt: true } },
      teamMembers: { select: { role: true, joinedAt: true, team: { select: { id: true, name: true } } } },
      conversations: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          title: true,
          mode: true,
          createdAt: true,
          updatedAt: true,
          messages: {
            orderBy: { orderIndex: "asc" },
            select: { role: true, content: true, orderIndex: true, createdAt: true },
          },
        },
      },
    },
  });

  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const payload = JSON.stringify({
    exportedAt: new Date().toISOString(),
    service: "Complexity / LABO AI",
    notice: "OAuth tokens, password-equivalent secrets, encrypted key material and session tokens are intentionally excluded.",
    account,
  }, null, 2);

  return new NextResponse(payload, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="complexity-account-export.json"',
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
