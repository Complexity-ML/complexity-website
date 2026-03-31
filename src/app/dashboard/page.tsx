"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Settings, ArrowRight, BookOpen, Github } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your Complexity ML dashboard.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/settings"
          className="group p-5 rounded-lg border border-border hover:border-primary/50 transition-colors space-y-3"
        >
          <div className="flex items-center justify-between">
            <Settings className="size-5 text-primary" />
            <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <p className="font-medium">Settings</p>
            <p className="text-xs text-muted-foreground">
              Manage your account and preferences
            </p>
          </div>
        </Link>

        <a
          href="https://openreview.net/forum?id=jZq6EVboC6"
          target="_blank"
          rel="noopener noreferrer"
          className="group p-5 rounded-lg border border-border hover:border-primary/50 transition-colors space-y-3"
        >
          <div className="flex items-center justify-between">
            <BookOpen className="size-5 text-primary" />
            <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <p className="font-medium">Paper (TMLR)</p>
            <p className="text-xs text-muted-foreground">
              Read our submission on OpenReview
            </p>
          </div>
        </a>

        <a
          href="https://github.com/Complexity-ML"
          target="_blank"
          rel="noopener noreferrer"
          className="group p-5 rounded-lg border border-border hover:border-primary/50 transition-colors space-y-3"
        >
          <div className="flex items-center justify-between">
            <Github className="size-5 text-primary" />
            <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <p className="font-medium">GitHub</p>
            <p className="text-xs text-muted-foreground">
              Source code and repositories
            </p>
          </div>
        </a>
      </div>
    </div>
  );
}
