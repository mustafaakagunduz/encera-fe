// src/app/page.tsx
'use client';

import { useAppTranslation } from "@/hooks/useAppTranslation";
import HeroSection from "@/components/hero/HeroSection";
import PricingSection from "@/components/pricing-section/PricingSection";

export default function Home() {
    const { t } = useAppTranslation();

    return (
        <main>
            <HeroSection />
            <PricingSection />
        </main>
    );
}