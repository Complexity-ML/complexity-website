"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const equations = [
  "error = h − μ(h)",
  "v′ = α·v − β·error",
  "h′ = h + Δt·gate·v′",
  "μ(h) = μ_base + W_μ·h",
];

function EquationStrip() {
  return (
    <>
      {equations.map((eq, i) => (
        <span key={i} className="flex items-center">
          <span className="mx-6">{eq}</span>
          <span className="text-primary/40">•</span>
        </span>
      ))}
    </>
  );
}

export default function MuAnimation() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId: number;
    let position = 0;
    const speed = 0.5; // pixels per frame

    const animate = () => {
      position += speed;
      // Reset when we've scrolled half (since we have 4 copies, 50% = 2 copies)
      const halfWidth = el.scrollWidth / 2;
      if (position >= halfWidth) {
        position = 0;
      }
      el.style.transform = `translateX(-${position}px)`;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Scrolling equation ticker */}
      <div className="absolute bottom-12 left-0 right-0 overflow-hidden pointer-events-none">
        <motion.div
          ref={scrollRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex whitespace-nowrap font-mono text-lg md:text-xl text-primary font-medium tracking-wide"
        >
          <EquationStrip />
          <EquationStrip />
          <EquationStrip />
          <EquationStrip />
        </motion.div>
      </div>
    </div>
  );
}
