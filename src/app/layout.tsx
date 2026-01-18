import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Complexity-ML | Open-Source AI Lab",
  description: "Building efficient transformer architectures with Mu-Guided Dynamics and Token-Routed MLP. Open-source AI research from Paris.",
  keywords: ["AI", "Machine Learning", "Transformers", "LLM", "MoE", "PyTorch", "Open Source"],
  authors: [{ name: "Boris Peyriguere" }],
  openGraph: {
    title: "Complexity-ML | Open-Source AI Lab",
    description: "Building efficient transformer architectures with Mu-Guided Dynamics and Token-Routed MLP.",
    url: "https://complexity-ml.com",
    siteName: "Complexity-ML",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Complexity-ML | Open-Source AI Lab",
    description: "Building efficient transformer architectures with Mu-Guided Dynamics and Token-Routed MLP.",
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
        {children}
      </body>
    </html>
  );
}
