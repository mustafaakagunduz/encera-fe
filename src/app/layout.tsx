// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { WebsiteStructuredData, OrganizationStructuredData } from "@/components/seo/StructuredData";
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
    title: "ENCERA - Emlak İlanları",
    description: "Emlak sektöründe dijital dönüşüm için PAPP. En güncel emlak ilanları, satılık ve kiralık daire, ev, işyeri ilanları.",
    keywords: "emlak, gayrimenkul, satılık, kiralık, daire, ev, villa, işyeri, arsa, encera, papp",
    authors: [{ name: "PAPP Group" }],
    creator: "PAPP Group",
    publisher: "ENCERA",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        type: 'website',
        locale: 'tr_TR',
        url: 'https://encera.com.tr',
        siteName: 'ENCERA',
        title: 'ENCERA - Emlak İlanları',
        description: 'Emlak sektöründe dijital dönüşüm için PAPP. En güncel emlak ilanları, satılık ve kiralık daire, ev, işyeri ilanları.',
        images: [
            {
                url: 'https://encera.com.tr/images/og-default.jpg',
                width: 1200,
                height: 630,
                alt: 'ENCERA - Emlak İlanları',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'ENCERA - Emlak İlanları',
        description: 'Emlak sektöründe dijital dönüşüm için PAPP. En güncel emlak ilanları, satılık ve kiralık daire, ev, işyeri ilanları.',
        images: ['https://encera.com.tr/images/og-default.jpg'],
        creator: '@encera_emlak',
    },
    alternates: {
        canonical: 'https://encera.com.tr',
        languages: {
            'tr': 'https://encera.com.tr',
            'en': 'https://encera.com.tr/en',
        },
    },
    verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
};
//deneme
export default function RootLayout({
    children,   
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="tr">
        <head>
            <WebsiteStructuredData />
            <OrganizationStructuredData
                organization={{
                    name: "ENCERA",
                    url: "https://encera.com.tr",
                    logo: "https://encera.com.tr/images/logo.png",
                    description: "Emlak sektöründe dijital dönüşüm için PAPP. En güncel emlak ilanları, satılık ve kiralık daire, ev, işyeri ilanları."
                }}
            />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <Providers>
                <Navbar />
                {children}
                <Footer />
            </Providers>
        </body>
        </html>
    );
}