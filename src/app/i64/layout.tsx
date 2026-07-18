import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dense vs i64 — Complexity ML',
  description:
    'Compare dense transformer architectures against deterministic token-identity routing, shared experts, and Token-Routed MLP.',
  keywords: [
    'transformer architecture',
    'token routing',
    'efficient LLM',
    'i64',
            'Complexity ML',
    'dense vs sparse',
  ],
  openGraph: {
    title: 'Dense vs i64 — Complexity ML',
    description:
      'Token-routed MLP with deterministic token-identity routing and a shared lexical expert.',
    url: 'https://www.complexity-ai.fr/i64',
    siteName: 'Complexity ML',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dense vs i64 — Complexity ML',
    description:
      'Token-routed MLP with deterministic token-identity routing and a shared lexical expert.',
  },
  alternates: {
    canonical: 'https://www.complexity-ai.fr/i64',
  },
}

export default function I64Layout({ children }: { children: React.ReactNode }) {
  return children
}
