"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, Github, LogIn, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "/demo", label: "Demo", highlight: true },
  { href: "#projects", label: "Projects" },
  { href: "#publications", label: "Publications" },
  { href: "#about", label: "About" },
];

export default function Navigation() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-lg border-b border-border/50" : ""
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-primary font-mono text-lg">//</span>
            <span className="font-bold text-lg">COMPLEXITY</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  link.highlight
                    ? "text-primary font-medium hover:text-primary/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <a href="https://github.com/Complexity-ML" target="_blank" rel="noopener noreferrer">
                <Github className="size-5" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a href="https://huggingface.co/Pacific-Prime" target="_blank" rel="noopener noreferrer">
                <span className="text-lg">🤗</span>
              </a>
            </Button>

            {/* Auth */}
            {session?.user ? (
              <div className="hidden sm:flex items-center gap-2">
                {session.user.image && (
                  <Image
                    src={session.user.image}
                    alt=""
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                )}
                <span className="text-sm text-muted-foreground max-w-[120px] truncate">
                  {session.user.name}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut()}
                  title="Sign out"
                >
                  <LogOut className="size-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signIn()}
                className="hidden sm:flex gap-1.5"
              >
                <LogIn className="size-4" />
                Sign in
              </Button>
            )}

            {/* Mobile hamburger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <span className="text-primary font-mono">//</span>
                    COMPLEXITY
                  </SheetTitle>
                </SheetHeader>
                <Separator />
                <nav className="flex flex-col gap-1 px-4">
                  {NAV_LINKS.map((link) => (
                    <SheetClose key={link.href} asChild>
                      <Button
                        variant={link.highlight ? "default" : "ghost"}
                        className="justify-start"
                        asChild
                      >
                        <Link href={link.href}>{link.label}</Link>
                      </Button>
                    </SheetClose>
                  ))}
                  <Separator className="my-2" />
                  {session?.user ? (
                    <div className="flex items-center gap-2 px-2 py-1">
                      {session.user.image && (
                        <Image
                          src={session.user.image}
                          alt=""
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      )}
                      <span className="text-sm truncate flex-1">
                        {session.user.name}
                      </span>
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => signOut()}
                        >
                          <LogOut className="size-4" />
                        </Button>
                      </SheetClose>
                    </div>
                  ) : (
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        className="justify-start gap-2"
                        onClick={() => signIn()}
                      >
                        <LogIn className="size-4" />
                        Sign in
                      </Button>
                    </SheetClose>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
