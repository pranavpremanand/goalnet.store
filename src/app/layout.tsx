import type { Metadata } from "next";
import { Jost, Poppins } from "next/font/google";
import { LocalCartProvider } from "@/components/common/LocalCartProvider";
import { SessionSync } from "@/components/common/SessionSync";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GoalNet | Jerseys for the love of the game",
  description:
    "Football jerseys for the moments, teams, and stories that stay with you.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jost.variable} ${poppins.variable}`}>
      <body><LocalCartProvider><SessionSync />{children}</LocalCartProvider></body>
    </html>
  );
}
