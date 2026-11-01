import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "InvoiceMint — Create invoices. Keep every record.",
  description:
    "Lightweight, decentralized Web3 invoicing application for freelancers and businesses on Botchain.",
  icons: [
    { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0b0c0e] text-zinc-100 min-h-screen selection:bg-purple-900/60 selection:text-purple-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

