"use client";

import Link from "next/link";
import { House } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AILabExitButton() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href="/"
          aria-label="Back to Complexity"
          className="absolute bottom-4 left-3.5 z-30 flex size-9 items-center justify-center rounded-[10px] border border-[#40516d] bg-[#1b2433]/96 text-[#aebcd0] shadow-[0_7px_20px_rgba(0,0,0,.16)] backdrop-blur-xl transition-all hover:-translate-y-px hover:border-[#66799a] hover:bg-[#253146] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70 max-md:left-2"
        >
          <House className="size-4" aria-hidden="true" />
        </Link>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={8}
        className="border border-[#40516d] bg-[#1b2433] text-[10px] text-[#e8eef7]"
      >
        Back to Complexity
      </TooltipContent>
    </Tooltip>
  );
}
