'use client';

import React from 'react';
import AccountSettings from '@/components/profile/AccountSettings';

const SettingsPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AccountSettings />
            </div>
        </div>
    );
};

export default SettingsPage;