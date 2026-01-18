"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-primary font-mono text-sm mb-2">// ABOUT</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Our Mission</h2>

          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-muted-foreground text-lg leading-relaxed">
              Complexity-ML is dedicated to developing efficient and innovative transformer
              architectures. Our research focuses on making large language models more
              accessible through novel routing mechanisms and dynamics-inspired control systems.
            </p>
          </div>
        </motion.div>

        {/* Key Innovations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-2xl">
              μ
            </div>
            <h3 className="text-xl font-semibold">Mu-Guided Dynamics</h3>
            <p className="text-muted-foreground">
              PID-inspired control mechanism that maintains context across layers through
              velocity and mu accumulation.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Token-Routed MLP</h3>
            <p className="text-muted-foreground">
              Deterministic expert routing based on token identity. Perfect load balance
              without routing collapse.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">CGGR Kernels</h3>
            <p className="text-muted-foreground">
              Custom Triton kernels for contiguous group GEMM routing. 5-6x speedup
              over naive implementations.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
