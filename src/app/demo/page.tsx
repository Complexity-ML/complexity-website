"use client";

import { Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DemoShell } from "./DemoShell";

export default function DemoPage() {
  return (
    <Suspense>
      <TooltipProvider>
        <DemoShell />
      </TooltipProvider>
    </Suspense>
  );
}
