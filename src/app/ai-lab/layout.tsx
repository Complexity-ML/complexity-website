import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI LAB | Complexity",
  description: "A visual AI workspace for token-routed inference, model comparison, inspectable stickers and live execution logs.",
};

export default function AILabLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
