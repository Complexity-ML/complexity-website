"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const publications = [
  {
    title: "Layer-Native Safety Clamping: Representation Engineering for Jailbreak-Resistant LLMs",
    authors: "Boris Peyriguere",
    venue: "Zenodo",
    year: "2025",
    doi: "10.5281/zenodo.18359832",
    url: "https://zenodo.org/records/18359832",
    abstract: "We propose Layer-Native Safety Clamping, a representation engineering approach that operates directly within the model's activation space. By learning harm directions and clamping activations, our method provides safety guarantees that cannot be bypassed through prompt manipulation.",
  },
  {
    title: "Complexity-Deep: Token-Routed MLP with Mu-Guided Dynamics for Efficient Transformer Architectures",
    authors: "Boris Peyriguere",
    venue: "Zenodo",
    year: "2025",
    doi: "10.5281/zenodo.18293026",
    url: "https://doi.org/10.5281/zenodo.18293026",
    abstract: "We present Complexity-Deep, a novel transformer architecture that combines deterministic token-routed MLP with mu-guided dynamics for efficient and stable training.",
  },
];

export default function Publications() {
  return (
    <section id="publications" className="py-24 px-6 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-primary font-mono text-sm mb-2">// PUBLICATIONS</p>
          <h2 className="text-3xl md:text-4xl font-bold">Research</h2>
        </motion.div>

        <div className="space-y-6">
          {publications.map((pub, index) => (
            <motion.div
              key={pub.doi}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
                        <a href={pub.url} target="_blank" rel="noopener noreferrer">
                          {pub.title}
                        </a>
                      </h3>
                      <p className="text-muted-foreground mb-2">{pub.authors}</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {pub.venue} • {pub.year}
                      </p>
                      <p className="text-sm text-muted-foreground">{pub.abstract}</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <a
                        href={pub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Read Paper
                      </a>
                      <div className="text-xs text-muted-foreground font-mono">
                        DOI: {pub.doi}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Citation box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12"
        >
          <h3 className="text-lg font-semibold mb-4">Cite Our Work</h3>
          <div className="bg-card rounded-lg p-4 font-mono text-sm overflow-x-auto border border-border">
            <pre className="text-muted-foreground">
{`@software{peyriguere2026complexity,
  author       = {Peyriguere, Boris},
  title        = {Complexity-Deep: Token-Routed MLP with
                  Mu-Guided Dynamics for Efficient
                  Transformer Architectures},
  year         = 2026,
  publisher    = {Zenodo},
  doi          = {10.5281/zenodo.18293026},
  url          = {https://doi.org/10.5281/zenodo.18293026}
}`}
            </pre>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
