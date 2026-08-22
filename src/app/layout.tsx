import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  title: "Complexity-ML | Open-Source AI Lab",
  description: "Building inspectable transformer architectures with deterministic TR-Hash routing, shared experts and open-source model tooling. Independent AI research from Paris.",
  keywords: ["AI", "Machine Learning", "Transformers", "LLM", "MoE", "PyTorch", "Open Source"],
  authors: [{ name: "Boris Peyriguere" }],
  openGraph: {
    title: "Complexity-ML | Open-Source AI Lab",
    description: "Deterministic TR-Hash routing, shared residual experts and open-source transformer tooling.",
    url: "https://www.complexity-ai.fr",
    siteName: "Complexity-ML",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Complexity-ML | Open-Source AI Lab",
    description: "Deterministic TR-Hash routing, shared residual experts and open-source transformer tooling.",
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
