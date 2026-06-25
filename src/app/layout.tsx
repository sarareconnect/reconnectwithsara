import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    default: "Sara — Referral Landing Page Platform",
    template: "%s · Sara",
  },
  description:
    "Multi-location referral landing page management for enterprise businesses.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <NextTopLoader
          color="#0f172a"
          height={3}
          showSpinner={false}
          shadow="0 0 10px #0f172a,0 0 5px #0f172a"
        />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
