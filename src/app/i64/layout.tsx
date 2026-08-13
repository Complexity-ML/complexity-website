import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TR-Hash 500M — Complexity ML',
  description:
    'Explore the audited TR-Hash 500M architecture, deterministic token-ID routes, shared residual experts, and 20B-token pretraining record.',
  keywords: [
    'transformer architecture',
    'token routing',
    'efficient LLM',
    'i64',
            'Complexity ML',
    'dense vs sparse',
  ],
  openGraph: {
    title: 'TR-Hash 500M — Complexity ML',
    description:
      'A 492.1M-parameter language model with deterministic token-ID routing and an always-on shared SwiGLU path.',
    url: 'https://www.complexity-ai.fr/i64',
    siteName: 'Complexity ML',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TR-Hash 500M — Complexity ML',
    description:
      'A 492.1M-parameter language model with deterministic token-ID routing and an always-on shared SwiGLU path.',
  },
  alternates: {
    canonical: 'https://www.complexity-ai.fr/i64',
  },
}

export default function I64Layout({ children }: { children: React.ReactNode }) {
  return children
}
