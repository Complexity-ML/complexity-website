"use client";

import { Suspense } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Github, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import LogoMark from "@/components/LogoMark";

export default function SignInPage() {
  return <Suspense><SignInContent /></Suspense>;
}

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[#080a0e] lg:grid-cols-[0.9fr_1.1fr]">
      <div className="hairline-grid pointer-events-none absolute inset-0 opacity-25" />

      <section className="relative hidden border-r border-white/[0.07] p-10 lg:flex lg:flex-col xl:p-14">
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-[0.08em]">
          <LogoMark className="size-10" />
          COMPLEXITY
        </Link>
        <div className="my-auto max-w-xl py-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/70">workspace.access</p>
          <h1 className="mt-5 text-balance text-5xl font-semibold leading-[0.96] tracking-[-0.055em] xl:text-7xl">Your research workspace, partitioned.</h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-white/45">Manage model access, external providers and private workspace configuration from one secure surface.</p>
        </div>
        <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.16em] text-white/25">
          <ShieldCheck className="size-4 text-emerald-300/65" />
          OAuth authentication · isolated data
        </div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center p-4 sm:p-8 lg:p-12">
        <Link href="/" className="absolute left-4 top-5 flex items-center gap-2 text-xs text-white/38 transition-colors hover:text-white sm:left-8 sm:top-8 lg:hidden">
          <ArrowLeft className="size-3.5" /> Home
        </Link>
        <div className="lab-surface w-full max-w-md overflow-hidden rounded-2xl">
          <div className="border-b border-white/[0.07] p-6 sm:p-8">
            <span className="grid size-11 place-items-center rounded-xl border border-primary/25 bg-primary/[0.08] text-primary"><LockKeyhole className="size-5" /></span>
            <p className="mt-7 font-mono text-[9px] uppercase tracking-[0.2em] text-white/28">authenticated workspace</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Sign in to continue</h2>
            <p className="mt-3 text-sm leading-6 text-white/42">Choose the identity provider attached to your Complexity workspace.</p>
          </div>

          <div className="space-y-3 p-6 sm:p-8">
            <Button variant="outline" className="h-12 w-full justify-start border-white/10 bg-white/[0.025] px-4 hover:bg-white/[0.06]" onClick={() => signIn("github", { callbackUrl })}>
              <Github className="mr-2 size-5" /> Continue with GitHub
            </Button>
            <Button variant="outline" className="h-12 w-full justify-start border-white/10 bg-white/[0.025] px-4 hover:bg-white/[0.06]" onClick={() => signIn("google", { callbackUrl })}>
              <svg className="mr-2 size-5" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </Button>
            <p className="pt-3 text-center text-[10px] leading-5 text-white/32">
              Authentication is handled by the selected OAuth provider. Complexity never receives your password. Your provider identifier, name, email and avatar are used to create your account and operate the service. Read the <Link href="/privacy" className="text-white/60 underline underline-offset-2 hover:text-white">privacy notice</Link>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
