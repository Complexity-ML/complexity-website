import { cn } from "@/lib/utils";

export default function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-xl border border-emerald-300/25 bg-emerald-300/[0.075] text-emerald-200 shadow-[inset_0_0_18px_rgba(52,211,153,.05)]",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-[55%]" fill="none">
        <path d="M6 6 12 12 18 6M6 18l6-6 6 6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" opacity=".72" />
        <circle cx="6" cy="6" r="2" fill="currentColor" />
        <circle cx="18" cy="6" r="2" fill="#7dd3fc" />
        <circle cx="12" cy="12" r="2.35" fill="#c4b5fd" />
        <circle cx="6" cy="18" r="2" fill="#fcd34d" />
        <circle cx="18" cy="18" r="2" fill="#f9a8d4" />
      </svg>
    </span>
  );
}
