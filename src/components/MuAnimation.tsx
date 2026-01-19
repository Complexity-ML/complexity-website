"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  beta: number;
  history: { x: number; y: number }[];
}

export default function MuAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;

    // Set canvas size
    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    // Mu position - fixed at center
    const mu = { x: width / 2, y: height / 2 };

    // Initialize particles with random positions and velocities
    const numParticles = 8;
    particlesRef.current = Array.from({ length: numParticles }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      alpha: 0.88 + Math.random() * 0.08,
      beta: 0.06 + Math.random() * 0.04,
      history: [],
    }));

    const dt = 0.12;
    const gate = 0.5;
    const historyLength = 40;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Update mu to stay centered
      mu.x = width / 2;
      mu.y = height / 2;

      // Draw mu point
      ctx.beginPath();
      ctx.arc(mu.x, mu.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(139, 92, 246, 0.6)";
      ctx.fill();

      // Draw mu label
      ctx.font = "bold 12px monospace";
      ctx.fillStyle = "rgba(139, 92, 246, 0.8)";
      ctx.fillText("μ", mu.x + 10, mu.y + 4);

      // Update and draw particles
      particlesRef.current.forEach((p, i) => {
        const errorX = p.x - mu.x;
        const errorY = p.y - mu.y;

        // INL Dynamics: v = α·v - β·error
        p.vx = p.alpha * p.vx - p.beta * errorX;
        p.vy = p.alpha * p.vy - p.beta * errorY;

        // Clamp velocity
        const maxV = 6;
        p.vx = Math.max(-maxV, Math.min(maxV, p.vx));
        p.vy = Math.max(-maxV, Math.min(maxV, p.vy));

        // h = h + dt·gate·v
        p.x += dt * gate * p.vx;
        p.y += dt * gate * p.vy;

        // Store history
        p.history.push({ x: p.x, y: p.y });
        if (p.history.length > historyLength) {
          p.history.shift();
        }

        // Draw trail with gradient
        if (p.history.length > 1) {
          for (let j = 1; j < p.history.length; j++) {
            const opacity = (j / p.history.length) * 0.3;
            ctx.beginPath();
            ctx.moveTo(p.history[j - 1].x, p.history[j - 1].y);
            ctx.lineTo(p.history[j].x, p.history[j].y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(139, 92, 246, 0.8)";
        ctx.fill();

        // Reset if converged
        const dist = Math.sqrt(errorX * errorX + errorY * errorY);
        if (dist < 8 && Math.abs(p.vx) < 0.3 && Math.abs(p.vy) < 0.3) {
          const edge = Math.floor(Math.random() * 4);
          if (edge === 0) { p.x = 0; p.y = Math.random() * height; }
          else if (edge === 1) { p.x = width; p.y = Math.random() * height; }
          else if (edge === 2) { p.x = Math.random() * width; p.y = 0; }
          else { p.x = Math.random() * width; p.y = height; }
          p.vx = (Math.random() - 0.5) * 4;
          p.vy = (Math.random() - 0.5) * 4;
          p.history = [];
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="relative w-full h-full"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />

      {/* Scrolling equation ticker */}
      <div className="absolute bottom-8 left-0 right-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="flex whitespace-nowrap font-mono text-sm text-primary/30"
        >
          <span className="mx-8">error = h - μ(h)</span>
          <span className="mx-8">•</span>
          <span className="mx-8">v_next = α · v - β · error</span>
          <span className="mx-8">•</span>
          <span className="mx-8">h_next = h + dt · gate · v_next</span>
          <span className="mx-8">•</span>
          <span className="mx-8">μ_contextual = μ_base + μ_proj(h)</span>
          <span className="mx-8">•</span>
          <span className="mx-8">error = h - μ(h)</span>
          <span className="mx-8">•</span>
          <span className="mx-8">v_next = α · v - β · error</span>
          <span className="mx-8">•</span>
          <span className="mx-8">h_next = h + dt · gate · v_next</span>
          <span className="mx-8">•</span>
          <span className="mx-8">μ_contextual = μ_base + μ_proj(h)</span>
          <span className="mx-8">•</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
