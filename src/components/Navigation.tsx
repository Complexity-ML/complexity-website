"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github, Menu, MessageSquare, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import LogoMark from "@/components/LogoMark";

const NAV_LINKS = [
  { href: "/#research", label: "Research" },
  { href: "/#projects", label: "Projects" },
  { href: "/#benchmark", label: "Benchmarks" },
  { href: "/i64", label: "Architecture" },
  { href: "/labo-ai", label: "LABO AI", accent: true },
];

export default function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    const route = href.split("#")[0] || "/";
    return route !== "/" && pathname === route;
  };

  return (
    <motion.header
      initial={false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="fixed inset-x-0 top-0 z-50 px-2 pt-2 sm:px-4 sm:pt-3"
    >
      <div
        className={cn(
          "mx-auto flex h-14 max-w-[132rem] items-center rounded-2xl border px-3 transition-all duration-300 sm:h-16 sm:px-4",
          scrolled
            ? "border-white/10 bg-[#0a0c11]/88 shadow-[0_18px_70px_rgba(0,0,0,.38)] backdrop-blur-2xl"
            : "border-white/[0.07] bg-[#0a0c11]/55 backdrop-blur-xl",
        )}
      >
        <Link href="/" className="group flex min-w-0 items-center gap-2.5 sm:gap-3">
          <LogoMark className="size-8 rounded-lg transition-colors group-hover:bg-emerald-300/[0.12] sm:size-9" />
          <span className="hidden text-sm font-semibold tracking-[0.08em] text-white sm:inline">
            COMPLEXITY
          </span>
        </Link>

        <nav className="mx-auto hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-xs font-medium text-white/52 transition-colors hover:bg-white/[0.055] hover:text-white",
                isActive(link.href) && "bg-white/[0.07] text-white",
                link.accent && "text-violet-300 hover:text-violet-200",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="hidden text-white/55 hover:text-white sm:inline-flex" asChild>
            <a href="https://github.com/Complexity-ML" target="_blank" rel="noopener noreferrer" aria-label="Complexity-ML on GitHub">
              <Github className="size-4" />
            </a>
          </Button>
          <Button size="sm" className="hidden h-9 bg-white px-4 text-black hover:bg-white/85 md:inline-flex" asChild>
            <Link href="/demo">
              <MessageSquare className="size-3.5" />
              Open demo
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(21rem,90vw)] border-white/10 bg-[#0b0d12] p-0">
              <SheetHeader className="border-b border-white/10 p-5">
                <SheetTitle className="flex items-center gap-3 text-left">
                  <LogoMark className="size-9 rounded-lg" />
                  COMPLEXITY
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-4">
                {NAV_LINKS.map((link) => (
                  <SheetClose key={link.href} asChild>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-4 py-3 text-sm text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white",
                        isActive(link.href) && "bg-white/[0.07] text-white",
                      )}
                    >
                      {link.label}
                      {link.accent && <Sparkles className="size-4 text-violet-300" />}
                    </Link>
                  </SheetClose>
                ))}
                <Separator className="my-3" />
                <SheetClose asChild>
                  <Button className="justify-center bg-white text-black hover:bg-white/85" asChild>
                    <Link href="/demo">
                      <MessageSquare className="size-4" />
                      Open demo
                    </Link>
                  </Button>
                </SheetClose>
                <Button variant="outline" className="mt-2 border-white/10" asChild>
                  <a href="https://github.com/Complexity-ML" target="_blank" rel="noopener noreferrer">
                    <Github className="size-4" />
                    GitHub
                  </a>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
