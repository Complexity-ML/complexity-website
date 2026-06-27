export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <div className="relative size-12 rounded-full border border-primary/25">
          <div className="absolute inset-1 rounded-full border border-primary/40 border-t-primary animate-spin" />
          <div className="absolute inset-4 rounded-full bg-primary shadow-[0_0_24px_rgba(74,222,128,0.5)]" />
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Loading Complexity
        </p>
      </div>
    </main>
  );
}
