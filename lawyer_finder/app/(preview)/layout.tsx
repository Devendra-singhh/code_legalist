import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "Lawyer Directory | Code Legalist",
  description: "Find the right legal representation with AI-powered search across India's top advocates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark selection:bg-indigo-500/30">
      <body suppressHydrationWarning className="antialiased bg-zinc-950 text-zinc-100">
        {children}
      </body>
    </html>
  );
}
