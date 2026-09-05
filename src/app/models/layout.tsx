import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Models — Complexity ML",
  description:
    "The released TR-HASH MoE 200M and 100M Agentic assistants, TR-HASH Vision v8, and the 492.1M/20B-token first pretrain — every checkpoint with its real numbers.",
  keywords: ["TR-Hash", "model releases", "MoE", "Agentic SFT", "object detection", "Complexity ML"],
  openGraph: {
    title: "Models — Complexity ML",
    description:
      "The released TR-HASH MoE 200M and 100M Agentic assistants, TR-HASH Vision v8, and the 492.1M/20B-token first pretrain.",
    url: "https://www.complexity-ai.fr/models",
    siteName: "Complexity ML",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Models — Complexity ML",
    description:
      "The released TR-HASH MoE 200M and 100M Agentic assistants, TR-HASH Vision v8, and the 492.1M/20B-token first pretrain.",
  },
  alternates: {
    canonical: "https://www.complexity-ai.fr/models",
  },
};

export default function ModelsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
