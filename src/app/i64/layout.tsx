import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dense vs i64 — Complexity ML',
  description:
    'Why brute-forcing compute is no longer the answer. Compare dense transformer architectures against deterministic lexical routing, shared experts, and Zipf-balanced Token-Routed MLP.',
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
      'Token-routed MLP with deterministic lexical routing, Zipf-balanced bin-packing, and a shared lexical expert.',
    url: 'https://www.complexity-ai.fr/i64',
    siteName: 'Complexity ML',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dense vs i64 — Complexity ML',
    description:
      'Token-routed MLP with deterministic lexical routing, Zipf-balanced bin-packing, and a shared lexical expert.',
  },
  alternates: {
    canonical: 'https://www.complexity-ai.fr/i64',
  },
}

export default function I64Layout({ children }: { children: React.ReactNode }) {
  return children
}
