// src/app/commercial/page.tsx
'use client';

import React, { Suspense } from 'react';
import { PropertyType } from '@/store/api/propertyApi';
import { PropertyListingPage } from '@/components/property/PropertyListingPage';

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