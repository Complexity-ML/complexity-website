import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/conversations/[id] — get conversation with messages
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbId = (session.user as Record<string, unknown>).dbId as string;
  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id, userId: dbId },
    include: {
      messages: {
        orderBy: { orderIndex: "asc" },
        select: { role: true, content: true },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ conversation });
}

// PUT /api/conversations/[id] — update title + replace messages
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbId = (session.user as Record<string, unknown>).dbId as string;
  const { id } = await params;

  // Verify ownership
  const existing = await prisma.conversation.findUnique({
    where: { id, userId: dbId },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { title, messages } = await req.json();

  // Replace all messages in a transaction
  await prisma.$transaction([
    prisma.chatMessage.deleteMany({ where: { conversationId: id } }),
    ...(messages as { role: string; content: string }[]).map(
      (msg: { role: string; content: string }, i: number) =>
        prisma.chatMessage.create({
          data: {
            conversationId: id,
            role: msg.role,
            content: msg.content,
            orderIndex: i,
          },
        }),
    ),
    prisma.conversation.update({
      where: { id },
      data: { ...(title ? { title } : {}), updatedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

// DELETE /api/conversations/[id] — delete conversation
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbId = (session.user as Record<string, unknown>).dbId as string;
  const { id } = await params;

  const existing = await prisma.conversation.findUnique({
    where: { id, userId: dbId },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.conversation.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
