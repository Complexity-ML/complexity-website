"use client";

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
  return (
    <div className="relative w-full h-full">
      {/* Scrolling equation ticker - CSS animation for seamless loop */}
      <div className="absolute bottom-12 left-0 right-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex whitespace-nowrap font-mono text-lg md:text-xl text-primary font-medium tracking-wide animate-scroll"
        >
          <EquationStrip />
          <EquationStrip />
          <EquationStrip />
          <EquationStrip />
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
