import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "rerail — gasless payouts on Stellar",
  description:
    "Set up a grant. Send a link. Get paid — no wallet setup required. Gasless USDC distribution built on Stellar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-[#080808] text-zinc-100">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-600">
          rerail · gasless payouts on Stellar
        </footer>
      </body>
    </html>
  );
}
