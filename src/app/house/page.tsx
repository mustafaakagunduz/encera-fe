// src/app/house/page.tsx
import React, { Suspense } from 'react';
import { PropertyType } from '@/store/api/propertyApi';
import { PropertyListingPage } from '@/components/property/PropertyListingPage';
import { generateSEOMetadata } from '@/components/seo/SEOHead';

export const metadata = generateSEOMetadata({
    title: 'Konut İlanları - Satılık ve Kiralık Daireler, Evler',
    description: 'En güncel konut ilanları. Satılık ve kiralık daire, ev, villa ilanları. Güvenilir emlak ilanları ve detaylı bilgiler.',
    keywords: 'konut, daire, ev, villa, satılık daire, kiralık daire, satılık ev, kiralık ev',
    url: 'https://encera.com.tr/house',
});

function HousePageContent() {
    return (
        <PropertyListingPage
            propertyType={PropertyType.RESIDENTIAL}
            pageTitle="navbar.listings"
            fallbackTitle="Konut"
            linkPrefix="/house"
        />
    );
}

export default function HousePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HousePageContent />
        </Suspense>
    );
}