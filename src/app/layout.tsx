import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.complexity-ai.fr"),
  alternates: { canonical: "./" },
  title: "Complexity-ML | Open-Source AI Lab",
  description: "Building efficient transformer architectures with Mu-Guided Dynamics and Token-Routed MLP. Open-source AI research from Paris.",
  keywords: ["AI", "Machine Learning", "Transformers", "LLM", "MoE", "PyTorch", "Open Source"],
  authors: [{ name: "Boris Peyriguere" }],
  openGraph: {
    title: "Complexity-ML | Open-Source AI Lab",
    description: "Building efficient transformer architectures with Mu-Guided Dynamics and Token-Routed MLP.",
    url: "https://www.complexity-ai.fr",
    siteName: "Complexity-ML",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Complexity-ML | Open-Source AI Lab",
    description: "Building efficient transformer architectures with Mu-Guided Dynamics and Token-Routed MLP.",
  },
  verification: {
    google: "H4DZCSF0al4GA7R-OuD-qMs8Mu2FKzFTJ7G8tlnBx3w",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
