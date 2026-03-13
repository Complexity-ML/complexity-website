import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dense vs i64 — Complexity ML',
  description:
    'Why brute-forcing compute is no longer the answer. Compare dense transformer architectures against i64 — token-routed MLP, Mu-Guided Dynamics, and CGGR kernels.',
  keywords: [
    'transformer architecture',
    'token routing',
    'efficient LLM',
    'i64',
    'Mu-Guided Dynamics',
    'CGGR kernels',
    'Complexity ML',
    'dense vs sparse',
  ],
  openGraph: {
    title: 'Dense vs i64 — Complexity ML',
    description:
      'Token-routed MLP, Mu-Guided Dynamics, and CGGR kernels. A new approach to efficient transformer architectures.',
    url: 'https://complexity-ai.fr/i64',
    siteName: 'Complexity ML',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dense vs i64 — Complexity ML',
    description:
      'Token-routed MLP, Mu-Guided Dynamics, and CGGR kernels. A new approach to efficient transformer architectures.',
  },
  alternates: {
    canonical: 'https://complexity-ai.fr/i64',
  },
}

export default function I64Layout({ children }: { children: React.ReactNode }) {
  return children
}
