import "./globals.css";
import { Metadata } from "next";
import { Viewport } from "next";

export const metadata: Metadata = {
  title: "Code Legalist | AI Legal Consultant for India",
  description:
    "AI-powered legal assistant specialising in Indian law. Get instant answers on your rights, statutes, procedures, and more.",
  keywords: ["Indian law", "legal assistant", "AI lawyer", "legal advice India", "IPC", "CrPC"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fafb" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
