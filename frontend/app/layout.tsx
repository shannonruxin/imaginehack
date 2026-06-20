import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "ImagineHack",
  description: "Sales intelligence for life insurance advisors",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <nav className="border-b px-6 py-3 flex gap-6 items-center text-sm font-medium">
          <Link href="/" className="text-base font-semibold tracking-tight">ImagineHack</Link>
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          <Link href="/clients" className="text-muted-foreground hover:text-foreground transition-colors">Clients</Link>
          <Link href="/projects" className="text-muted-foreground hover:text-foreground transition-colors">Projects</Link>
        </nav>
        <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
