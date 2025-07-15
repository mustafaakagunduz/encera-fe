// src/app/authentication/page.tsx
'use client';

import React, { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import AuthenticationContent from '@/components/auth/AuthenticationContent';

const AuthenticationPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <Card className="shadow-xl">
                    <Suspense fallback={
                        <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
                        </div>
                    }>
                        <AuthenticationContent />
                    </Suspense>
                </Card>
            </div>
        </div>
    );
};

export default AuthenticationPage;