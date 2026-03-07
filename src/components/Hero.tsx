"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Github, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const GridBackground = dynamic(() => import("./GridBackground"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 -z-10 bg-background" />,
});

const MuAnimation = dynamic(() => import("./MuAnimation"), {
  ssr: false,
  loading: () => null,
});

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <GridBackground />

      <div className="absolute inset-0 z-0">
        <MuAnimation />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="font-mono text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8"
          >
            48.8566° N, 2.3522° E
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6 sm:mb-8"
          >
            <Badge className="gap-2 px-4 py-2 text-sm bg-primary/10 text-primary border-primary/30">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              OPEN-SOURCE AI LAB
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-6"
          >
            <span className="text-primary">//</span> COMPLEXITY
            <br />
            <span className="text-muted-foreground">MACHINE LEARNING</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 sm:mb-12 px-2"
          >
            Building efficient transformer architectures with{" "}
            <span className="text-primary">Mu-Guided Dynamics</span> and{" "}
            <span className="text-primary">Token-Routed MLP</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4 sm:px-0"
          >
            <Button size="lg" asChild>
              <a href="https://github.com/Complexity-ML" target="_blank" rel="noopener noreferrer">
                <Github className="size-5" />
                GitHub
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="https://doi.org/10.5281/zenodo.18293026" target="_blank" rel="noopener noreferrer">
                <BookOpen className="size-5" />
                Paper
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:block"
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <span className="text-xs font-mono">SCROLL</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-8 bg-gradient-to-b from-muted-foreground to-transparent"
          />
        </div>
      </motion.div>
    </section>
  );
}
