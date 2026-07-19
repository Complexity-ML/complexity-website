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

interface LaboWorkspacePayload {
  workspace?: Record<string, unknown>;
  customCards?: unknown[];
  training?: Record<string, unknown>;
  tokenizer?: Record<string, unknown>;
}

function safePayload(value: unknown): LaboWorkspacePayload | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const body = value as Record<string, unknown>;
  const payload: LaboWorkspacePayload = {};
  if ("workspace" in body) {
    if (!body.workspace || typeof body.workspace !== "object" || Array.isArray(body.workspace)) return undefined;
    payload.workspace = body.workspace as Record<string, unknown>;
  }
  if ("customCards" in body) {
    if (!Array.isArray(body.customCards) || body.customCards.length > 200) return undefined;
    payload.customCards = body.customCards;
  }
  if ("training" in body) {
    if (!body.training || typeof body.training !== "object" || Array.isArray(body.training)) return undefined;
    payload.training = body.training as Record<string, unknown>;
  }
  if ("tokenizer" in body) {
    if (!body.tokenizer || typeof body.tokenizer !== "object" || Array.isArray(body.tokenizer)) return undefined;
    payload.tokenizer = body.tokenizer as Record<string, unknown>;
  }
  return Object.keys(payload).length > 0 ? payload : undefined;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = currentUserId(session);
  if (!userId) return NextResponse.json({ authenticated: false, workspace: null, customCards: [], training: null, tokenizer: null });

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
  if (!record?.messages[0]) return NextResponse.json({ authenticated: true, workspace: null, customCards: [], training: null, tokenizer: null });

  try {
    const payload = safePayload(JSON.parse(record.messages[0].content) as unknown);
    if (!payload) throw new Error("Invalid stored workspace");
    return NextResponse.json({
      authenticated: true,
      workspace: payload.workspace ?? null,
      customCards: payload.customCards ?? [],
      training: payload.training ?? null,
      tokenizer: payload.tokenizer ?? null,
      updatedAt: record.updatedAt.getTime(),
    });
  } catch {
    return NextResponse.json({ authenticated: true, workspace: null, customCards: [], training: null, tokenizer: null, warning: "The stored workspace could not be restored." });
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

  const workspace = await prisma.conversation.findFirst({
    where: { userId, mode: LABO_WORKSPACE_MODE },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      messages: {
        where: { role: "workspace" },
        orderBy: { orderIndex: "desc" },
        take: 1,
        select: { content: true },
      },
    },
  });
  let workspaceId = workspace?.id;
  let storedPayload: LaboWorkspacePayload = {};
  if (workspace?.messages[0]) {
    try { storedPayload = safePayload(JSON.parse(workspace.messages[0].content) as unknown) ?? {}; } catch { storedPayload = {}; }
  }
  if (!workspaceId) {
    const created = await prisma.conversation.create({
      data: { userId, mode: LABO_WORKSPACE_MODE, title: LABO_WORKSPACE_TITLE },
      select: { id: true },
    });
    workspaceId = created.id;
  }

  const content = JSON.stringify({ ...storedPayload, ...payload });
  await prisma.$transaction([
    prisma.chatMessage.deleteMany({ where: { conversationId: workspaceId } }),
    prisma.chatMessage.create({ data: { conversationId: workspaceId, role: "workspace", content, orderIndex: 0 } }),
    prisma.conversation.update({ where: { id: workspaceId }, data: { updatedAt: new Date() } }),
  ]);
  return NextResponse.json({ saved: true, updatedAt: Date.now() });
}
