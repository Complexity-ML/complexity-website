import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-5 sm:mb-14 sm:gap-6 lg:flex-row lg:items-end lg:justify-between",
        align === "center" && "mx-auto max-w-3xl text-center lg:block",
        className,
      )}
    >
      <div className={cn("max-w-3xl", align === "center" && "mx-auto")}> 
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.26em] text-primary/85">
          <span className="mr-2 text-primary/35">[</span>
          {eyebrow}
          <span className="ml-2 text-primary/35">]</span>
        </p>
        <h2 className="text-balance text-3xl font-semibold tracking-[-0.045em] sm:text-4xl lg:text-5xl xl:text-[3.5rem] xl:leading-[1.02]">
          {title}
        </h2>
        {description && (
          <div className="mt-4 max-w-2xl text-pretty text-sm leading-7 text-muted-foreground sm:text-base">
            {description}
          </div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
