"use client";

import { motion } from "framer-motion";
import { Github, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    title: "vllm-i64",
    description:
      "Integer-first token-routed inference engine. Paged KV cache with LRU eviction, continuous batching, and OpenAI-compatible API.",
    tags: ["Inference", "i64", "KV-Cache", "Token-Routing"],
    status: "Active",
    links: {
      github: "https://github.com/Complexity-ML/vllm-i64",
      demo: "/demo?mode=python",
    },
  },
  {
    title: "Pacific-i64",
    description:
      "1.5B parameter language model trained with Complexity-Deep architecture. Mu-guided attention and token-routed experts.",
    tags: ["LLM", "1.5B", "F32", "HuggingFace"],
    status: "Available",
    links: {
      huggingface: "https://huggingface.co/Pacific-Prime",
      demo: "/demo?mode=chat",
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
    title: "OpenReview — Submission",
    description:
      "Our latest submission on OpenReview. Token-Routed MLP with Mu-Guided Dynamics for efficient transformer architectures.",
    tags: ["Paper", "OpenReview", "Peer Review"],
    status: "Active",
    links: {
      paper: "https://openreview.net/forum?id=jZq6EVboC6",
    },
  },
];

const statusStyles: Record<string, string> = {
  Active: "bg-primary/20 text-primary border-primary/30",
  Available: "bg-green-500/20 text-green-400 border-green-500/30",
  Hardware: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Stable: "",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Projects() {
  return (
    <section id="projects" className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 sm:mb-16"
        >
          <p className="text-primary font-mono text-sm mb-2">// PROJECTS</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            What We&apos;re Building
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 gap-4 sm:gap-6"
        >
          {projects.map((project) => (
            <motion.div key={project.title} variants={itemVariants}>
              <Card className="h-full bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-colors group">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg sm:text-xl group-hover:text-primary transition-colors">
                      {project.title}
                    </CardTitle>
                    <Badge
                      variant={project.status === "Stable" ? "outline" : "default"}
                      className={statusStyles[project.status]}
                    >
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm sm:text-base text-muted-foreground">{project.description}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {project.links.github && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                          <Github className="size-4" />
                          GitHub
                        </a>
                      </Button>
                    )}
                    {project.links.pypi && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={project.links.pypi} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="size-4" />
                          PyPI
                        </a>
                      </Button>
                    )}
                    {project.links.huggingface && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={project.links.huggingface} target="_blank" rel="noopener noreferrer">
                          <span className="text-base">🤗</span>
                          HuggingFace
                        </a>
                      </Button>
                    )}
                    {project.links.paper && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={project.links.paper} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="size-4" />
                          OpenReview
                        </a>
                      </Button>
                    )}
                    {project.links.demo && (
                      <Button variant="ghost" size="sm" className="text-primary" asChild>
                        <a href={project.links.demo}>
                          <span className="size-2 rounded-full bg-primary animate-pulse" />
                          Try Live
                        </a>
                      </Button>
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
