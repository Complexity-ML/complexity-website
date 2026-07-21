import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { LABO_WORKSPACE_MODE, MAX_LABO_WORKSPACE_BYTES } from "@/lib/labo-workspace";
import { prisma } from "@/lib/prisma";

type JsonObject = Record<string, unknown>;

interface LaboPreferencesPatch {
  theme?: "labo-dark" | "complexity-spectrum";
  language?: "en" | "fr";
}

interface LaboWorkspacePayload {
  workspace?: JsonObject;
  customCards?: unknown[];
  training?: JsonObject;
  tokenizer?: JsonObject;
  preferences?: LaboPreferencesPatch;
}

function currentUserId(session: unknown): string | undefined {
  if (!session || typeof session !== "object") return undefined;
  const user = (session as { user?: unknown }).user;
  if (!user || typeof user !== "object") return undefined;
  const value = (user as Record<string, unknown>).dbId;
  return typeof value === "string" && value ? value : undefined;
}

function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  return !origin || origin === new URL(req.url).origin;
}

function object(value: unknown): JsonObject | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonObject
    : undefined;
}

function preferences(value: unknown): LaboPreferencesPatch | undefined {
  const record = object(value);
  if (!record) return undefined;
  const appearance = object(record.appearance) ?? record;
  const result: LaboPreferencesPatch = {};
  if (appearance.theme === "labo-dark" || appearance.theme === "complexity-spectrum") {
    result.theme = appearance.theme;
  }
  if (appearance.language === "en" || appearance.language === "fr") {
    result.language = appearance.language;
  }
  return Object.keys(result).length ? result : undefined;
}

function safePayload(value: unknown): LaboWorkspacePayload | undefined {
  const body = object(value);
  if (!body) return undefined;
  const payload: LaboWorkspacePayload = {};

  if ("workspace" in body) {
    const workspace = object(body.workspace);
    if (!workspace) return undefined;
    payload.workspace = workspace;
  }
  if ("customCards" in body) {
    if (!Array.isArray(body.customCards) || body.customCards.length > 200) return undefined;
    payload.customCards = body.customCards;
  }
  if ("training" in body) {
    const training = object(body.training);
    if (!training) return undefined;
    payload.training = training;
  }
  if ("tokenizer" in body) {
    const tokenizer = object(body.tokenizer);
    if (!tokenizer) return undefined;
    payload.tokenizer = tokenizer;
  }
  if ("settings" in body) {
    const patch = preferences(body.settings);
    if (!patch) return undefined;
    payload.preferences = patch;
  }

  return Object.keys(payload).length ? payload : undefined;
}

async function legacyPayload(userId: string): Promise<LaboWorkspacePayload | undefined> {
  const record = await prisma.conversation.findFirst({
    where: { userId, mode: LABO_WORKSPACE_MODE },
    orderBy: { updatedAt: "desc" },
    select: {
      messages: {
        where: { role: "workspace" },
        orderBy: { orderIndex: "desc" },
        take: 1,
        select: { content: true },
      },
    },
  });
  const content = record?.messages[0]?.content;
  if (!content) return undefined;
  try {
    return safePayload(JSON.parse(content) as unknown);
  } catch {
    return undefined;
  }
}

async function migrateLegacyWorkspace(userId: string): Promise<void> {
  const [model, training, tokenizer, userPreferences] = await Promise.all([
    prisma.laboModelWorkspace.findUnique({ where: { userId }, select: { id: true } }),
    prisma.laboTrainingState.findUnique({ where: { userId }, select: { id: true } }),
    prisma.laboTokenizerState.findUnique({ where: { userId }, select: { id: true } }),
    prisma.laboPreferences.findUnique({ where: { userId }, select: { id: true } }),
  ]);
  if (model && training && tokenizer && userPreferences) return;

  const legacy = await legacyPayload(userId);
  if (!legacy) return;
  const writes: Prisma.PrismaPromise<unknown>[] = [];

  if (!model && (legacy.workspace || legacy.customCards)) {
    writes.push(prisma.laboModelWorkspace.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        workspace: legacy.workspace as Prisma.InputJsonValue | undefined,
        customCards: legacy.customCards as Prisma.InputJsonValue | undefined,
      },
    }));
  }
  if (!training && legacy.training) {
    writes.push(prisma.laboTrainingState.upsert({
      where: { userId },
      update: {},
      create: { userId, state: legacy.training as Prisma.InputJsonValue },
    }));
  }
  if (!tokenizer && legacy.tokenizer) {
    writes.push(prisma.laboTokenizerState.upsert({
      where: { userId },
      update: {},
      create: { userId, state: legacy.tokenizer as Prisma.InputJsonValue },
    }));
  }
  if (!userPreferences && legacy.preferences) {
    writes.push(prisma.laboPreferences.upsert({
      where: { userId },
      update: {},
      create: { userId, ...legacy.preferences },
    }));
  }
  if (writes.length) await prisma.$transaction(writes);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = currentUserId(session);
  if (!userId) {
    return NextResponse.json({
      authenticated: false,
      workspace: null,
      customCards: [],
      training: null,
      tokenizer: null,
      settings: null,
    });
  }

  await migrateLegacyWorkspace(userId);
  const [model, training, tokenizer, userPreferences] = await Promise.all([
    prisma.laboModelWorkspace.findUnique({ where: { userId } }),
    prisma.laboTrainingState.findUnique({ where: { userId } }),
    prisma.laboTokenizerState.findUnique({ where: { userId } }),
    prisma.laboPreferences.findUnique({ where: { userId } }),
  ]);
  const updatedAt = Math.max(
    model?.updatedAt.getTime() ?? 0,
    training?.updatedAt.getTime() ?? 0,
    tokenizer?.updatedAt.getTime() ?? 0,
    userPreferences?.updatedAt.getTime() ?? 0,
  );

  return NextResponse.json({
    authenticated: true,
    workspace: model?.workspace ?? null,
    customCards: model?.customCards ?? [],
    training: training?.state ?? null,
    tokenizer: tokenizer?.state ?? null,
    settings: userPreferences ? {
      appearance: {
        ...(userPreferences.theme ? { theme: userPreferences.theme } : {}),
        ...(userPreferences.language ? { language: userPreferences.language } : {}),
      },
    } : null,
    updatedAt: updatedAt || undefined,
  });
}

export async function PUT(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const session = await getServerSession(authOptions);
  const userId = currentUserId(session);
  if (!userId) return NextResponse.json({ error: "Sign in to save this private workspace." }, { status: 401 });

  const raw = await req.text();
  if (Buffer.byteLength(raw) > MAX_LABO_WORKSPACE_BYTES) {
    return NextResponse.json({ error: "The LABO workspace is too large." }, { status: 413 });
  }
  let payload: LaboWorkspacePayload | undefined;
  try {
    payload = safePayload(JSON.parse(raw) as unknown);
  } catch {
    payload = undefined;
  }
  if (!payload) return NextResponse.json({ error: "Invalid LABO workspace." }, { status: 400 });

  await migrateLegacyWorkspace(userId);
  const writes: Prisma.PrismaPromise<unknown>[] = [];
  if (payload.workspace || payload.customCards) {
    const update: Prisma.LaboModelWorkspaceUpdateInput = {};
    if (payload.workspace) update.workspace = payload.workspace as Prisma.InputJsonValue;
    if (payload.customCards) update.customCards = payload.customCards as Prisma.InputJsonValue;
    writes.push(prisma.laboModelWorkspace.upsert({
      where: { userId },
      update,
      create: {
        userId,
        workspace: payload.workspace as Prisma.InputJsonValue | undefined,
        customCards: payload.customCards as Prisma.InputJsonValue | undefined,
      },
    }));
  }
  if (payload.training) {
    writes.push(prisma.laboTrainingState.upsert({
      where: { userId },
      update: { state: payload.training as Prisma.InputJsonValue },
      create: { userId, state: payload.training as Prisma.InputJsonValue },
    }));
  }
  if (payload.tokenizer) {
    writes.push(prisma.laboTokenizerState.upsert({
      where: { userId },
      update: { state: payload.tokenizer as Prisma.InputJsonValue },
      create: { userId, state: payload.tokenizer as Prisma.InputJsonValue },
    }));
  }
  if (payload.preferences) {
    writes.push(prisma.laboPreferences.upsert({
      where: { userId },
      update: payload.preferences,
      create: { userId, ...payload.preferences },
    }));
  }
  await prisma.$transaction(writes);
  return NextResponse.json({ saved: true, updatedAt: Date.now() });
}
