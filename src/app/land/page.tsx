// src/app/land/page.tsx
import React, { Suspense } from 'react';
import { PropertyType } from '@/store/api/propertyApi';
import { PropertyListingPage } from '@/components/property/PropertyListingPage';
import { generateSEOMetadata } from '@/components/seo/SEOHead';

export const metadata = generateSEOMetadata({
    title: 'Arsa İlanları - Satılık Arazi ve Parseller',
    description: 'En güncel arsa ilanları. Satılık arazi, parsel, tarla ilanları. Güvenilir arsa alım satım ilanları ve detaylı bilgiler.',
    keywords: 'arsa, arazi, parsel, tarla, satılık arsa, satılık arazi, imareye açık arsa',
    url: 'https://encera.com.tr/land',
});

function LandPageContent() {
    return (
        <PropertyListingPage
            propertyType={PropertyType.LAND}
            pageTitle="navbar.land"
            fallbackTitle="Arsa"
            linkPrefix="/land"
        />
    );
}

export default function LandPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LandPageContent />
        </Suspense>
    );
}