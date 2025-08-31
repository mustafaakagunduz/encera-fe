// src/app/create-listing/page.tsx
import { Suspense } from 'react';
import { CreateListingForm } from '@/components/forms/CreateListingForm';

function CreateListingFormWrapper() {
    return <CreateListingForm />;
}

export default function CreateListingPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Suspense fallback={<div className="flex justify-center items-center min-h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>}>
                <CreateListingFormWrapper />
            </Suspense>
        </div>
    );
}