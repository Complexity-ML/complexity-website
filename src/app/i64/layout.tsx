import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TR-HASH MoE 200M Architecture — Complexity ML',
  description:
    'Explore the released TR-HASH MoE 200M architecture: multi-hash token-ID routing, fixed top-2 residual experts, a shared SwiGLU path, GQA, and the full-SFT lineage.',
  keywords: [
    'transformer architecture',
    'token routing',
    'efficient LLM',
    'i64',
            'Complexity ML',
    'dense vs sparse',
  ],
  openGraph: {
    title: 'TR-HASH MoE 200M Architecture — Complexity ML',
    description:
      'The released 201.2M-parameter language model with deterministic multi-hash top-2 routing and an always-on shared SwiGLU path.',
    url: 'https://www.complexity-ai.fr/i64',
    siteName: 'Complexity ML',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TR-HASH MoE 200M Architecture — Complexity ML',
    description:
      'The released 201.2M-parameter language model with deterministic multi-hash top-2 routing and an always-on shared SwiGLU path.',
  },
  alternates: {
    canonical: 'https://www.complexity-ai.fr/i64',
  },
}

export default function I64Layout({ children }: { children: React.ReactNode }) {
  return children
}
