import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nexy — Discover What You Both Really Want",
  description: "The app that helps couples communicate desires without awkward conversations. Private. Judgment-free. AI-powered.",
  keywords: ["couples app", "relationship", "intimacy", "communication", "desires", "matching"],
  openGraph: {
    title: "Nexy — Discover What You Both Really Want",
    description: "The app that helps couples communicate desires without awkward conversations. Private. Judgment-free. AI-powered.",
    url: "https://nexy.life",
    siteName: "Nexy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexy — Discover What You Both Really Want",
    description: "The app that helps couples communicate desires without awkward conversations.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakarta.variable} ${playfair.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
