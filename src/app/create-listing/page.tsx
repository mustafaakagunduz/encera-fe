// src/app/create-listing/page.tsx
import { CreateListingForm } from '@/components/forms/CreateListingForm';

export default function CreateListingPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <CreateListingForm />
        </div>
    );
}