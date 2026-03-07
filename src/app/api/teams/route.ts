import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/teams — get user's teams
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbId = (session.user as Record<string, unknown>).dbId as string;

  const memberships = await prisma.teamMember.findMany({
    where: { userId: dbId },
    include: {
      team: {
        include: {
          owner: { select: { id: true, name: true, email: true, image: true } },
          members: {
            include: {
              user: { select: { id: true, name: true, email: true, image: true } },
            },
          },
        },
      },
    },
  });

  const teams = memberships.map((m) => ({
    ...m.team,
    myRole: m.role,
  }));

  return NextResponse.json({ teams });
}

// POST /api/teams — create a team
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbId = (session.user as Record<string, unknown>).dbId as string;
  const { name } = await req.json();

  if (!name || typeof name !== "string" || name.length > 100) {
    return NextResponse.json({ error: "Invalid team name" }, { status: 400 });
  }

  // Limit: max 3 teams per user
  const ownedCount = await prisma.team.count({ where: { ownerId: dbId } });
  if (ownedCount >= 3) {
    return NextResponse.json({ error: "Max 3 teams per user" }, { status: 400 });
  }

  const team = await prisma.team.create({
    data: {
      name,
      ownerId: dbId,
      members: {
        create: { userId: dbId, role: "OWNER" },
      },
    },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      },
    },
  });

  return NextResponse.json({ team }, { status: 201 });
}
