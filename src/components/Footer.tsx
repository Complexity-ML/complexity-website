"use client";

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border/50">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
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
              <li>
                <a
                  href="https://github.com/Complexity-ML"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://huggingface.co/Pacific-Prime"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  HuggingFace
                </a>
              </li>
              <li>
                <a
                  href="https://pypi.org/project/complexity-deep/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  PyPI
                </a>
              </li>
              <li>
                <a
                  href="https://doi.org/10.5281/zenodo.18293026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Paper (Zenodo)
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">License</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">
                Code: CC BY-NC 4.0
              </li>
              <li className="text-muted-foreground">
                Research & Education: Free
              </li>
              <li>
                <a
                  href="https://github.com/Complexity-ML/complexity-deep/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Commercial Licensing →
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 Complexity-ML. Open Science AI Lab.
          </p>
          <p className="text-sm text-muted-foreground font-mono">
            Paris, France • 48.8566° N, 2.3522° E
          </p>
        </div>
      </div>
    </footer>
  );
}
