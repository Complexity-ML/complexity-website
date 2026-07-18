"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { FlaskConical, Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import LogoMark from "@/components/LogoMark";

const NAV = [
  { href: "/dashboard/settings", label: "My account", icon: Settings },
  { href: "/labo-ai/live", label: "Open LABO AI", icon: FlaskConical },
];

function WorkspaceNav({ pathname, close = false }: { pathname: string; close?: boolean }) {
  return (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const active = pathname === item.href;
        const content = (
          <Link
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
              active ? "border border-primary/15 bg-primary/[0.07] text-primary" : "border border-transparent text-white/42 hover:bg-white/[0.04] hover:text-white",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
        return close ? <SheetClose key={item.href} asChild>{content}</SheetClose> : <div key={item.href}>{content}</div>;
      })}
    </nav>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") signIn(undefined, { callbackUrl: pathname });
  }, [status, pathname]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="grid min-h-screen place-items-center bg-[#080a0e]">
        <div className="text-center">
          <div className="mx-auto size-10 animate-spin rounded-full border border-primary/20 border-t-primary" />
          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">opening workspace</p>
        </div>
      </div>
    );
  }

  const user = session?.user;

  return (
    <div className="min-h-screen bg-[#080a0e] lg:grid lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-white/[0.07] bg-[#0a0c11] lg:flex">
        <div className="border-b border-white/[0.07] p-5">
          <Link href="/" className="flex items-center gap-3">
            <LogoMark className="size-9 rounded-lg" />
            <div>
              <p className="text-sm font-semibold tracking-[0.06em]">COMPLEXITY</p>
              <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.18em] text-white/24">account</p>
            </div>
          </Link>
        </div>
        <div className="flex-1 p-3">
          <p className="mb-3 px-3 pt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/22">Account</p>
          <WorkspaceNav pathname={pathname} />
        </div>
        <div className="border-t border-white/[0.07] p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.025] p-3">
            {user?.image ? <Image src={user.image} alt="" width={32} height={32} className="rounded-lg" /> : <div className="size-8 rounded-lg bg-white/[0.06]" />}
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">{user?.name}</p>
              <p className="mt-0.5 truncate text-[10px] text-white/28">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/[0.07] bg-[#080a0e]/90 px-4 backdrop-blur-xl sm:px-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2.5 text-sm font-semibold tracking-[0.06em]"><LogoMark className="size-8 rounded-lg" /> COMPLEXITY</Link>
          <Sheet>
            <SheetTrigger asChild><Button variant="ghost" size="icon"><Menu className="size-5" /></Button></SheetTrigger>
            <SheetContent side="right" className="w-[min(21rem,90vw)] border-white/10 bg-[#0a0c11] p-0">
              <SheetHeader className="border-b border-white/[0.07] p-5"><SheetTitle>My account</SheetTitle></SheetHeader>
              <div className="p-4"><WorkspaceNav pathname={pathname} close /></div>
            </SheetContent>
          </Sheet>
        </header>

        <main className="min-h-screen">
          <div className="mx-auto w-full max-w-[110rem] px-4 py-7 sm:px-6 sm:py-9 lg:px-8 xl:px-12 xl:py-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
