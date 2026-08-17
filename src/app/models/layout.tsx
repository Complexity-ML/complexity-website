import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Models — Complexity ML",
  description:
    "TR-HASH Vision v8, the 492.1M/20B-token first pretrain, and the 200M/130B-token run currently in progress — every checkpoint with its real numbers.",
  keywords: ["TR-Hash", "model releases", "MoE", "object detection", "Complexity ML"],
  openGraph: {
    title: "Models — Complexity ML",
    description:
      "TR-HASH Vision v8, the 492.1M/20B-token first pretrain, and the 200M/130B-token run currently in progress.",
    url: "https://www.complexity-ai.fr/models",
    siteName: "Complexity ML",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Models — Complexity ML",
    description:
      "TR-HASH Vision v8, the 492.1M/20B-token first pretrain, and the 200M/130B-token run currently in progress.",
  },
  alternates: {
    canonical: "https://www.complexity-ai.fr/models",
  },
};

export default function ModelsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
