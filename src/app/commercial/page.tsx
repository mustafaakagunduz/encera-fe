// src/app/commercial/page.tsx
import React, { Suspense } from 'react';
import { PropertyType } from '@/store/api/propertyApi';
import { PropertyListingPage } from '@/components/property/PropertyListingPage';
import { generateSEOMetadata } from '@/components/seo/SEOHead';

export const metadata = generateSEOMetadata({
    title: 'İş Yeri İlanları - Satılık ve Kiralık Ofis, Dükkan, Mağaza',
    description: 'En güncel iş yeri ilanları. Satılık ve kiralık ofis, dükkan, mağaza, fabrika ilanları. Güvenilir ticari emlak ilanları.',
    keywords: 'iş yeri, ofis, dükkan, mağaza, fabrika, satılık ofis, kiralık ofis, ticari emlak',
    url: 'https://encera.com.tr/commercial',
});

function CommercialPageContent() {
    return (
        <PropertyListingPage
            propertyType={PropertyType.COMMERCIAL}
            pageTitle="navbar.jobs"
            fallbackTitle="İş Yeri"
            linkPrefix="/commercial"
        />
    );
}

export default function CommercialPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CommercialPageContent />
        </Suspense>
    );
}