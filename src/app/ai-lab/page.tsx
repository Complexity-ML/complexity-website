"use client";

import { Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DemoShell } from "@/app/demo/DemoShell";

export default function AILabPage() {
  return (
    <Suspense>
      <TooltipProvider>
        <DemoShell />
      </TooltipProvider>
    </Suspense>
  );
}
