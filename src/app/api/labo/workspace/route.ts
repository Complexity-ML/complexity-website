import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { LABO_WORKSPACE_MODE, LABO_WORKSPACE_TITLE, MAX_LABO_WORKSPACE_BYTES } from "@/lib/labo-workspace";
import { prisma } from "@/lib/prisma";

function currentUserId(session: unknown): string | undefined {
  if (!session || typeof session !== "object") return undefined;
  const user = (session as { user?: unknown }).user;
  if (!user || typeof user !== "object") return undefined;
  const value = (user as Record<string, unknown>).dbId;
  return typeof value === "string" ? value : undefined;
}

function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  return !origin || origin === new URL(req.url).origin;
}

function safePayload(value: unknown): { workspace: Record<string, unknown>; customCards: unknown[] } | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const body = value as Record<string, unknown>;
  if (!body.workspace || typeof body.workspace !== "object" || Array.isArray(body.workspace)) return undefined;
  if (!Array.isArray(body.customCards) || body.customCards.length > 200) return undefined;
  return { workspace: body.workspace as Record<string, unknown>, customCards: body.customCards };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = currentUserId(session);
  if (!userId) return NextResponse.json({ authenticated: false, workspace: null, customCards: [] });

  const record = await prisma.conversation.findFirst({
    where: { userId, mode: LABO_WORKSPACE_MODE },
    orderBy: { updatedAt: "desc" },
    select: {
      updatedAt: true,
      messages: {
        where: { role: "workspace" },
        orderBy: { orderIndex: "desc" },
        take: 1,
        select: { content: true },
      },
    },
  });
  if (!record?.messages[0]) return NextResponse.json({ authenticated: true, workspace: null, customCards: [] });

  try {
    const payload = safePayload(JSON.parse(record.messages[0].content) as unknown);
    if (!payload) throw new Error("Invalid stored workspace");
    return NextResponse.json({ authenticated: true, ...payload, updatedAt: record.updatedAt.getTime() });
  } catch {
    return NextResponse.json({ authenticated: true, workspace: null, customCards: [], warning: "The stored workspace could not be restored." });
  }
}

export async function PUT(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const session = await getServerSession(authOptions);
  const userId = currentUserId(session);
  if (!userId) return NextResponse.json({ error: "Sign in to save this private workspace." }, { status: 401 });

  const raw = await req.text();
  if (Buffer.byteLength(raw) > MAX_LABO_WORKSPACE_BYTES) return NextResponse.json({ error: "The LABO workspace is too large." }, { status: 413 });
  let payload: ReturnType<typeof safePayload>;
  try { payload = safePayload(JSON.parse(raw) as unknown); } catch { payload = undefined; }
  if (!payload) return NextResponse.json({ error: "Invalid LABO workspace." }, { status: 400 });

  let workspace = await prisma.conversation.findFirst({
    where: { userId, mode: LABO_WORKSPACE_MODE },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });
  if (!workspace) {
    workspace = await prisma.conversation.create({
      data: { userId, mode: LABO_WORKSPACE_MODE, title: LABO_WORKSPACE_TITLE },
      select: { id: true },
    });
  }

  const content = JSON.stringify(payload);
  await prisma.$transaction([
    prisma.chatMessage.deleteMany({ where: { conversationId: workspace.id } }),
    prisma.chatMessage.create({ data: { conversationId: workspace.id, role: "workspace", content, orderIndex: 0 } }),
    prisma.conversation.update({ where: { id: workspace.id }, data: { updatedAt: new Date() } }),
  ]);
  return NextResponse.json({ saved: true, updatedAt: Date.now() });
}
