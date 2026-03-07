"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Users, UserPlus, Crown, Copy, Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Member {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
}

const ROLE_LABELS: Record<Member["role"], string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

export default function TeamPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const userId = (user as Record<string, unknown> | undefined)?.id as string | undefined;

  const [inviteEmail, setInviteEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  // Current user as the only member (until DB is wired)
  const members: Member[] = [
    {
      id: userId ?? "unknown",
      name: user?.name ?? "You",
      email: user?.email ?? "",
      image: user?.image ?? undefined,
      role: "owner",
      joinedAt: new Date().toISOString().split("T")[0],
    },
  ];

  const teamId = userId ? `team_${userId.split("::")[1]?.slice(0, 8) ?? userId.slice(0, 8)}` : "—";

  const copyTeamId = () => {
    navigator.clipboard.writeText(teamId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    // TODO: wire to API when DB is ready
    setInviteSent(true);
    setInviteEmail("");
    setTimeout(() => setInviteSent(false), 3000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Team</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your team members and shared access.
        </p>
      </div>

      {/* Team info */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between bg-card/50">
          <div className="flex items-center gap-3">
            <Users className="size-4 text-primary" />
            <div>
              <p className="text-sm font-medium">{user?.name}&apos;s team</p>
              <p className="text-xs text-muted-foreground">
                {members.length} / 10 members
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              {teamId}
            </Badge>
            <Button variant="ghost" size="icon" className="size-7" onClick={copyTeamId}>
              {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Members list */}
        <div className="divide-y divide-border">
          {members.map((member) => (
            <div key={member.id} className="px-5 py-3 flex items-center gap-4">
              {member.image ? (
                <Image
                  src={member.image}
                  alt=""
                  width={36}
                  height={36}
                  className="rounded-full"
                />
              ) : (
                <div className="size-9 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-sm font-medium">{member.name[0]}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{member.name}</p>
                  {member.role === "owner" && <Crown className="size-3.5 text-yellow-500" />}
                </div>
                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {ROLE_LABELS[member.role]}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Invite */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="px-5 py-4 bg-card/50 border-b border-border flex items-center gap-2">
          <UserPlus className="size-4" />
          <p className="text-sm font-medium">Invite member</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Invite up to 10 members to your team. They&apos;ll share access to the team API key and usage dashboard.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 border border-border rounded-md px-3 py-2">
              <Mail className="size-4 text-muted-foreground shrink-0" />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                placeholder="colleague@company.com"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
              />
            </div>
            <Button onClick={handleInvite} disabled={!inviteEmail.trim()} size="sm" className="gap-1.5">
              <UserPlus className="size-4" />
              Invite
            </Button>
          </div>
          {inviteSent && (
            <p className="text-xs text-green-500 font-medium">
              Invitation will be sent when the team feature is fully deployed.
            </p>
          )}
        </div>
      </div>

      {/* Permissions */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="px-5 py-4 bg-card/50 border-b border-border">
          <p className="text-sm font-medium">Roles & permissions</p>
        </div>
        <div className="px-5 py-4">
          <div className="grid grid-cols-4 gap-y-2 text-xs">
            <div className="font-medium text-muted-foreground">Permission</div>
            <div className="font-medium text-muted-foreground text-center">Owner</div>
            <div className="font-medium text-muted-foreground text-center">Admin</div>
            <div className="font-medium text-muted-foreground text-center">Member</div>

            <Separator className="col-span-4 my-1" />

            {[
              { perm: "Use chat & API", owner: true, admin: true, member: true },
              { perm: "View usage stats", owner: true, admin: true, member: true },
              { perm: "View API keys", owner: true, admin: true, member: false },
              { perm: "Invite members", owner: true, admin: true, member: false },
              { perm: "Remove members", owner: true, admin: false, member: false },
              { perm: "Delete team", owner: true, admin: false, member: false },
            ].map((row) => (
              <div key={row.perm} className="contents">
                <div className="py-1">{row.perm}</div>
                <div className="py-1 text-center">{row.owner ? "✓" : "—"}</div>
                <div className="py-1 text-center">{row.admin ? "✓" : "—"}</div>
                <div className="py-1 text-center">{row.member ? "✓" : "—"}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
