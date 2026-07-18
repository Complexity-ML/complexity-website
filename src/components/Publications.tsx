"use client";

import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const publications = [
  {
    title: "Token identity provides a fixed routing signal for residual experts in language models",
    authors: "Anonymous",
    venue: "Research manuscript",
    year: "2026",
    doi: null,
    url: "/papers/token-identity-routing-residual-experts.pdf",
    abstract: "We test whether token identity alone can allocate narrow residual expert capacity while a shared dense MLP preserves contextual processing. The manuscript reports a matched 306.5M-parameter, 8B-token comparison, standard task evaluations, and learned-router controls.",
  },
];

export default function Publications() {
  return (
    <section id="publications" className="py-16 sm:py-24 px-4 sm:px-6 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 sm:mb-16"
        >
          <p className="text-primary font-mono text-sm mb-2">{"// PUBLICATIONS"}</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Research</h2>
        </motion.div>

        <div className="space-y-4 sm:space-y-6">
          {publications.map((pub, index) => (
            <motion.div
              key={pub.url}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-4 sm:gap-6">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-xl font-semibold mb-2 hover:text-primary transition-colors">
                        <a href={pub.url} target="_blank" rel="noopener noreferrer">
                          {pub.title}
                        </a>
                      </h3>
                      <p className="text-muted-foreground text-sm mb-2">{pub.authors}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                        {pub.venue} &bull; {pub.year}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 sm:line-clamp-none">
                        {pub.abstract}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button size="sm" asChild>
                        <a href={pub.url} target="_blank" rel="noopener noreferrer">
                          <BookOpen className="size-4" />
                          Read Paper
                        </a>
                      </Button>
                      {pub.doi && (
                        <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">
                          DOI: {pub.doi}
                        </span>
                      )}
                      {!pub.doi && (
                        <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">
                          Hosted PDF
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 sm:mt-12"
        >
          <h3 className="text-lg font-semibold mb-4">Cite Our Work</h3>
          <Card className="overflow-hidden">
            <CardContent className="p-3 sm:p-4">
              <pre className="text-xs sm:text-sm font-mono text-muted-foreground overflow-x-auto">
{`@article{
anonymous2026tokenidentity,
title={Token identity provides a fixed routing signal for residual experts in language models},
author={Anonymous},
journal={Research manuscript},
year={2026},
url={https://www.complexity-ai.fr/papers/token-identity-routing-residual-experts.pdf},
note={Double-anonymized manuscript}
}`}
              </pre>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
