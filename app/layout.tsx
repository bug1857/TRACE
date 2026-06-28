import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

import { LazyMotion, domAnimation } from "framer-motion";

export const metadata: Metadata = {
  title: "TRACE. — Enterprise Process Mining & ESG Intelligence",
  description: "Process & Carbon Intelligence Platform for real-time compliance, carbon tracking, and operational efficiency.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LazyMotion features={domAnimation} strict>
          <Providers>
            {children}
          </Providers>
        </LazyMotion>
      </body>
    </html>
  );
}
