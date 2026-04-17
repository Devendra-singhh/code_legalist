import "./globals.css";
import { Inter } from 'next/font/google';
import { Metadata } from "next";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Legal Chat Assistant",
  description: "AI-powered legal assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.className} suppressHydrationWarning={true}>
        <Toaster position="top-center" richColors />
        {children}
      </body>
    </html>
  );
}
