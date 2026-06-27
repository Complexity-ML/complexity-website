"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background px-4 py-24 text-foreground sm:px-6">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <p className="font-mono text-sm text-primary">{"// RECOVERABLE ERROR"}</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
          Something went sideways.
        </h1>
        <p className="mt-4 text-muted-foreground">
          The site caught the error instead of leaving you on a blank screen. You can retry the current view or go back home.
        </p>
        {error.digest && (
          <code className="mt-5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            digest: {error.digest}
          </code>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
