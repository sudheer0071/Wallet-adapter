import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RecoilContextProvider from "./RecoilContextProvider";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wallet Adapter",
  description: "Your safest Wallet Adapter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className}  home h-screen bg-slate-900`}>
        <RecoilContextProvider>
        {children}
        <Footer/>
        </RecoilContextProvider>
        
        </body>
    </html>
  );
}
