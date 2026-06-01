import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bharosa Bhai | Tumhara Personal Financial Dost",
  description: "2-minute financial test lo aur jaan lo tumhari financial life kitni strong hai. Plan your wealth securely with Bharosa Bhai.",
  openGraph: {
    title: "Bharosa Bhai | Tumhara Personal Financial Dost",
    description: "2-minute financial test lo aur jaan lo tumhari financial life kitni strong hai. Plan your wealth securely with Bharosa Bhai.",
    type: "website",
  }
};

import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ChatWidget } from "@/components/shared/ChatWidget";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#0E0E0E] text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
