// src/app/page.tsx
'use client';

import CompanyIntroSection from "@/components/home/CompanyIntroSection";
import PropertiesSection from "@/components/home/PropertiesSection";

export default function Home() {
    return (
        <main className="min-h-screen">
            <CompanyIntroSection />
            <PropertiesSection />
        </main>
    );
}