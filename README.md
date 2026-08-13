# Complexity website

Public Next.js site for Complexity-ML research, model tooling, hosted papers,
benchmarks, LABO AI, and the public inference demo.

## Local development

```bash
npm ci
cp .env.example .env.local
npm run dev
```

The site runs at <http://localhost:3000>.

## Validation

```bash
npm run lint
npm run build
```

The production build applies the tracked Prisma migration, regenerates the
client, and builds Next.js. It therefore requires the deployment database
variables used by the linked Vercel project.

## Research publication

Hosted PDFs live under `public/papers/`. A publication update must keep these
surfaces synchronized:

- `src/components/Publications.tsx` for title, abstract-length summary and
  citation;
- `src/components/ResearchStory.tsx` for claims and limitations;
- `src/components/Hero.tsx`, `Footer.tsx`, and `src/app/i64/page.tsx` for the
  canonical PDF link;
- `src/components/Benchmark.tsx` for experiment context;
- `src/app/layout.tsx` for public metadata.

Current public paper:

```text
public/papers/tr-hash-deterministic-token-id-routing.pdf
```

The earlier token-identity-routing manuscript remains available as a
historical artifact and interactive-study companion.

## Deployment

Production is hosted at <https://www.complexity-ai.fr>. The `main` branch is
the release branch used by the connected deployment project. Before pushing,
verify the PDF locally, run lint and the production build, and review the Git
diff for unsupported research claims or accidental environment files.
