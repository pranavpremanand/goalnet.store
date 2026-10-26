import type { Metadata } from "next";
import { Jost, Poppins } from "next/font/google";
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
  title: "Play On | Jerseys for the love of the game",
  description:
    "Football jerseys for the moments, teams, and stories that stay with you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jost.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  );
}
