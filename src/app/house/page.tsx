// src/app/house/page.tsx
'use client';

import React, { Suspense } from 'react';
import { PropertyType } from '@/store/api/propertyApi';
import { PropertyListingPage } from '@/components/property/PropertyListingPage';

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