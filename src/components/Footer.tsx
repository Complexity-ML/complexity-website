"use client";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="py-8 sm:py-12 px-4 sm:px-6 border-t border-border/50">
      <div className="container mx-auto max-w-6xl">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-primary font-mono text-lg">//</span>
              <span className="font-bold text-lg">COMPLEXITY</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-md">
              Open-source AI lab building efficient transformer architectures
              with Mu-Guided Dynamics and Token-Routed MLP.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "GitHub", href: "https://github.com/Complexity-ML" },
                { label: "HuggingFace", href: "https://huggingface.co/Pacific-i64" },
                { label: "PyPI", href: "https://pypi.org/project/complexity-deep/" },
                { label: "Paper (Zenodo)", href: "https://doi.org/10.5281/zenodo.18293026" },
              ].map((link) => (
                <li key={link.label}>
                  <Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-primary text-sm" asChild>
                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                      {link.label}
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">License</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">Code: CC BY-NC 4.0</li>
              <li className="text-muted-foreground">Research & Education: Free</li>
              <li>
                <Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-primary text-sm" asChild>
                  <a href="https://github.com/Complexity-ML/complexity-deep/issues" target="_blank" rel="noopener noreferrer">
                    Commercial Licensing &rarr;
                  </a>
                </Button>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6 sm:my-8 opacity-50" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
          <p className="text-xs sm:text-sm text-muted-foreground">
            &copy; 2026 Complexity-ML. Open Science AI Lab.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground font-mono">
            Paris, France &bull; 48.8566&deg; N, 2.3522&deg; E
          </p>
        </div>
      </div>
    </footer>
  );
}
