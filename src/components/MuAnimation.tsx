"use client";

import { motion } from "framer-motion";

export default function MuAnimation() {
  return (
    <div className="relative w-full h-full">
      {/* Scrolling equation ticker */}
      <div className="absolute bottom-12 left-0 right-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, x: ["0%", "-50%"] }}
          transition={{
            opacity: { duration: 1, delay: 0.5 },
            x: { duration: 25, repeat: Infinity, ease: "linear" }
          }}
          className="flex whitespace-nowrap font-mono text-lg md:text-xl text-primary font-medium tracking-wide"
        >
          <span className="mx-6">error = h − μ(h)</span>
          <span className="mx-4 text-primary/40">•</span>
          <span className="mx-6">v′ = α·v − β·error</span>
          <span className="mx-4 text-primary/40">•</span>
          <span className="mx-6">h′ = h + Δt·gate·v′</span>
          <span className="mx-4 text-primary/40">•</span>
          <span className="mx-6">μ(h) = μ_base + W_μ·h</span>
          <span className="mx-4 text-primary/40">•</span>
          <span className="mx-6">error = h − μ(h)</span>
          <span className="mx-4 text-primary/40">•</span>
          <span className="mx-6">v′ = α·v − β·error</span>
          <span className="mx-4 text-primary/40">•</span>
          <span className="mx-6">h′ = h + Δt·gate·v′</span>
          <span className="mx-4 text-primary/40">•</span>
          <span className="mx-6">μ(h) = μ_base + W_μ·h</span>
          <span className="mx-4 text-primary/40">•</span>
        </motion.div>
      </div>
    </div>
  );
}
