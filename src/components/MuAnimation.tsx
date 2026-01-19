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
  const muRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    // Initialize mu at center
    muRef.current = { x: width / 2, y: height / 2 };

    // Initialize particles with random positions and velocities
    const numParticles = 12;
    particlesRef.current = Array.from({ length: numParticles }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      alpha: 0.85 + Math.random() * 0.1, // Inertia [0.85, 0.95]
      beta: 0.08 + Math.random() * 0.04, // Correction [0.08, 0.12]
      history: [],
    }));

    const dt = 0.15;
    const gate = 0.6;
    const historyLength = 50;

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const mu = muRef.current;

      // Draw mu point (equilibrium)
      ctx.beginPath();
      ctx.arc(mu.x, mu.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(139, 92, 246, 0.8)"; // Primary color
      ctx.fill();

      // Draw mu label
      ctx.font = "bold 14px monospace";
      ctx.fillStyle = "rgba(139, 92, 246, 1)";
      ctx.fillText("μ", mu.x + 12, mu.y + 5);

      // Update and draw particles
      particlesRef.current.forEach((p, i) => {
        // INL Dynamics equations
        const errorX = p.x - mu.x;
        const errorY = p.y - mu.y;

        // v_next = alpha * v - beta * error
        p.vx = p.alpha * p.vx - p.beta * errorX;
        p.vy = p.alpha * p.vy - p.beta * errorY;

        // Clamp velocity
        const maxV = 8;
        p.vx = Math.max(-maxV, Math.min(maxV, p.vx));
        p.vy = Math.max(-maxV, Math.min(maxV, p.vy));

        // h_next = h + dt * gate * v_next
        p.x += dt * gate * p.vx;
        p.y += dt * gate * p.vy;

        // Store history for trail
        p.history.push({ x: p.x, y: p.y });
        if (p.history.length > historyLength) {
          p.history.shift();
        }

        // Draw trail
        if (p.history.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.history[0].x, p.history[0].y);
          for (let j = 1; j < p.history.length; j++) {
            ctx.lineTo(p.history[j].x, p.history[j].y);
          }
          ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 + (i / numParticles) * 0.2})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${0.6 + (i / numParticles) * 0.4})`;
        ctx.fill();

        // Reset particle if too close to mu (to keep animation interesting)
        const dist = Math.sqrt(errorX * errorX + errorY * errorY);
        if (dist < 5 && Math.abs(p.vx) < 0.5 && Math.abs(p.vy) < 0.5) {
          // Respawn at random edge
          const edge = Math.floor(Math.random() * 4);
          if (edge === 0) { p.x = 0; p.y = Math.random() * height; }
          else if (edge === 1) { p.x = width; p.y = Math.random() * height; }
          else if (edge === 2) { p.x = Math.random() * width; p.y = 0; }
          else { p.x = Math.random() * width; p.y = height; }
          p.vx = (Math.random() - 0.5) * 6;
          p.vy = (Math.random() - 0.5) * 6;
          p.history = [];
        }
      });

      // Draw convergence lines to mu (subtle)
      particlesRef.current.forEach((p) => {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mu.x, mu.y);
        ctx.strokeStyle = "rgba(139, 92, 246, 0.05)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Move mu with mouse
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      muRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
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
        className="w-full h-full cursor-crosshair"
        style={{ touchAction: "none" }}
      />
      {/* Equation overlay */}
      <div className="absolute bottom-4 left-4 font-mono text-xs text-muted-foreground/50 pointer-events-none">
        <div>v = α·v - β·(h - μ)</div>
        <div>h = h + dt·gate·v</div>
      </div>
      <div className="absolute top-4 right-4 font-mono text-xs text-muted-foreground/50 pointer-events-none">
        move mouse to control μ
      </div>
    </motion.div>
  );
}
