'use client';

import { useLanguage } from "@/context/LanguageContext";
import HeroSection from "@/components/hero/HeroSection";
import PricingSection from "@/components/pricing-section/PricingSection";

export default function Home() {
    const { t } = useLanguage();

    return (
        <main>


            <HeroSection />
            <PricingSection />



        </main>
    );
}