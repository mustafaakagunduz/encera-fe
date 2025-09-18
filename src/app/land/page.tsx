// src/app/land/page.tsx
'use client';

import React, { Suspense } from 'react';
import { PropertyType } from '@/store/api/propertyApi';
import { PropertyListingPage } from '@/components/property/PropertyListingPage';

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