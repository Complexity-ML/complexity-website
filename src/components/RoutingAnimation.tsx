"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const equations = [
  "(e₁, e₂) = route_table[layer, token_id]",
  "MLP(x,t) = Shared(x) + Expert_e₁(x) + Expert_e₂(x)",
  "slots(e, layer) = 16,000 / 64,000",
  "P_active = P_shared + 2·P_expert",
  "route_table[layer] is persisted",
  "L_eval(19.923B tokens) = 2.661519",
];

function EquationStrip() {
  return (
    <>
      {equations.map((eq) => (
        <span key={eq} className="flex items-center">
          <span className="mx-6">{eq}</span>
          <span className="text-primary/40">•</span>
        </span>
      ))}
    </>
  );
}

export default function RoutingAnimation() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      el.style.transform = "translateX(0)";
      return;
    }

    let animationId: number;
    let position = 0;
    const speed = 0.28;

    const animate = () => {
      position += speed;
      const halfWidth = el.scrollWidth / 2;
      if (position >= halfWidth) position = 0;
      el.style.transform = `translateX(-${position}px)`;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="relative w-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_18%,black_82%,transparent)]">
      <motion.div
        ref={scrollRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="flex whitespace-nowrap font-mono text-xs font-medium tracking-wide text-primary/35 sm:text-sm md:text-base"
      >
        <EquationStrip />
        <EquationStrip />
        <EquationStrip />
        <EquationStrip />
      </motion.div>
    </div>
  );
}
