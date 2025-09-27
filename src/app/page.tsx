// src/app/page.tsx
'use client';

import HomeSection from "@/components/home/HomeSection";

export default function Home() {
    return (
        <main
            className="min-h-screen bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/company-intro-bg.webp')" }}
        >
            <HomeSection />
        </main>
    );
}
