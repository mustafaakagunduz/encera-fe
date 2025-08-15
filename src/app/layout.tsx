// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
// import '@/lib/i18n'; // Bu satırı kaldırın

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "PAPP - Emlak İlanları",
    description: "Emlak sektöründe dijital dönüşüm için PAPP",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
            <Navbar />
            <main className="min-h-screen">
                {children}
            </main>
            <Footer />
        </Providers>
        </body>
        </html>
    );
}