"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const projects = [
  {
    title: "Complexity-Deep",
    description:
      "Token-Routed MLP with Mu-Guided Dynamics. Deterministic expert routing + PID-inspired control for efficient transformers.",
    tags: ["PyTorch", "Triton", "MoE", "LLM"],
    status: "Active",
    links: {
      github: "https://github.com/Complexity-ML/complexity-deep",
      pypi: "https://pypi.org/project/complexity-deep/",
    },
  },
  {
    title: "Mu-Inference",
    description:
      "High-performance inference engine for Complexity models. KV cache, continuous batching, and OpenAI-compatible API.",
    tags: ["Inference", "FastAPI", "KV-Cache", "Serving"],
    status: "Active",
    links: {
      github: "https://github.com/Complexity-ML/complexity-inference",
      pypi: "https://pypi.org/project/mu-inference/",
    },
  },
  {
    title: "Pacific-Prime",
    description:
      "1.5B parameter language model trained with Complexity-Deep architecture. Mu-guided attention and token-routed experts.",
    tags: ["LLM", "1.5B", "BF16", "HuggingFace"],
    status: "Training",
    links: {
      huggingface: "https://huggingface.co/Pacific-Prime/pacific-prime",
    },
  },
  {
    title: "Complexity Framework",
    description:
      "Base transformer architecture library. Foundation for all Complexity models with modern attention patterns.",
    tags: ["PyTorch", "GQA", "RoPE", "FlashAttention"],
    status: "Stable",
    links: {
      github: "https://github.com/Complexity-ML/complexity-framework",
      pypi: "https://pypi.org/project/complexity-framework/",
    },
  },
  {
    title: "CGGR Kernels",
    description:
      "Contiguous Group GEMM Routing - Triton kernels achieving 5-6x speedup for expert routing operations.",
    tags: ["Triton", "CUDA", "Optimization"],
    status: "Active",
    links: {
      github: "https://github.com/Complexity-ML/complexity-deep",
    },
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function Projects() {
  return (
    <section id="projects" className="py-24 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-primary font-mono text-sm mb-2">// PROJECTS</p>
          <h2 className="text-3xl md:text-4xl font-bold">
            What We&apos;re Building
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6"
        >
          {projects.map((project) => (
            <motion.div key={project.title} variants={itemVariants}>
              <Card className="h-full bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-colors group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {project.title}
                    </CardTitle>
                    <Badge
                      variant={
                        project.status === "Active"
                          ? "default"
                          : project.status === "Training"
                          ? "secondary"
                          : "outline"
                      }
                      className={
                        project.status === "Active"
                          ? "bg-primary/20 text-primary border-primary/30"
                          : project.status === "Training"
                          ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          : ""
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{project.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-2">
                    {project.links.github && (
                      <a
                        href={project.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        GitHub
                      </a>
                    )}
                    {project.links.pypi && (
                      <a
                        href={project.links.pypi}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0L1.75 6v12L12 24l10.25-6V6L12 0zm-1.775 18l-4.9-2.85v-5.7L10.225 12v6zm1.55-7.2L6.875 8l4.9-2.85L16.675 8l-4.9 2.8zm6.45 4.35l-4.9 2.85v-6l4.9-2.85v6z"/>
                        </svg>
                        PyPI
                      </a>
                    )}
                    {project.links.huggingface && (
                      <a
                        href={project.links.huggingface}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                      >
                        <span className="text-lg">🤗</span>
                        HuggingFace
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
