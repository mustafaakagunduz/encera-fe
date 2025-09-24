// src/app/page.tsx
'use client';

import CompanyIntroSection from "@/components/home/CompanyIntroSection";
import PropertiesSection from "@/components/home/PropertiesSection";
//deneme
export default function Home() {
    return (
        <main className="min-h-screen">
            <CompanyIntroSection />

            <PropertiesSection />
        </main>
    );
}