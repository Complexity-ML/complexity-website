import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/teams/members — invite a member by email
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbId = (session.user as Record<string, unknown>).dbId as string;
  const { teamId, email, role = "MEMBER" } = await req.json();

  if (!teamId || !email) {
    return NextResponse.json({ error: "teamId and email required" }, { status: 400 });
  }

  // Check caller is owner or admin
  const callerMembership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: dbId } },
  });
  if (!callerMembership || !["OWNER", "ADMIN"].includes(callerMembership.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Check team size (max 10)
  const memberCount = await prisma.teamMember.count({ where: { teamId } });
  if (memberCount >= 10) {
    return NextResponse.json({ error: "Team is full (max 10 members)" }, { status: 400 });
  }

  // Find user by email
  const invitee = await prisma.user.findUnique({ where: { email } });
  if (!invitee) {
    return NextResponse.json({ error: "User not found — they need to sign up first" }, { status: 404 });
  }

  // Check not already a member
  const existing = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: invitee.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Already a member" }, { status: 409 });
  }

  const validRoles = ["ADMIN", "MEMBER"] as const;
  const memberRole = validRoles.includes(role as typeof validRoles[number]) ? role : "MEMBER";

  const member = await prisma.teamMember.create({
    data: { teamId, userId: invitee.id, role: memberRole },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  return NextResponse.json({ member }, { status: 201 });
}

// DELETE /api/teams/members — remove a member
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbId = (session.user as Record<string, unknown>).dbId as string;
  const { teamId, userId } = await req.json();

  if (!teamId || !userId) {
    return NextResponse.json({ error: "teamId and userId required" }, { status: 400 });
  }

  // Check caller is owner
  const callerMembership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: dbId } },
  });
  if (!callerMembership || callerMembership.role !== "OWNER") {
    return NextResponse.json({ error: "Only the owner can remove members" }, { status: 403 });
  }

  // Can't remove yourself (owner)
  if (userId === dbId) {
    return NextResponse.json({ error: "Owner cannot leave — delete the team instead" }, { status: 400 });
  }

  await prisma.teamMember.delete({
    where: { teamId_userId: { teamId, userId } },
  });

  return NextResponse.json({ ok: true });
}
