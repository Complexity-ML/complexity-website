import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_CONVERSATIONS = 10;

// GET /api/conversations — list user's conversations (no messages, just metadata)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbId = (session.user as Record<string, unknown>).dbId as string;

  const conversations = await prisma.conversation.findMany({
    where: { userId: dbId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      mode: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ conversations });
}

// POST /api/conversations — create a new conversation
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbId = (session.user as Record<string, unknown>).dbId as string;

  // Enforce limit
  const count = await prisma.conversation.count({ where: { userId: dbId } });
  if (count >= MAX_CONVERSATIONS) {
    return NextResponse.json(
      { error: `Maximum ${MAX_CONVERSATIONS} conversations. Delete one first.` },
      { status: 400 },
    );
  }

  const { mode = "python" } = await req.json();

  const conversation = await prisma.conversation.create({
    data: { userId: dbId, mode },
    select: { id: true, title: true, mode: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({ conversation }, { status: 201 });
}
