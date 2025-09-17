'use client';

import React from 'react';
import ProfileHeader from './ProfileHeader';
import AccountSettings from './AccountSettings';
import UserListings from './UserListings';
import ProfileReviews from './ProfileReviews';

const ProfilePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
                {/* Hero/Profile Header Section */}
                <ProfileHeader />

                {/* Reviews & Comments Section */}
                <ProfileReviews isOwnProfile={true} profileOwnerId="1" />

                {/* Settings & Account Management Section */}
                <AccountSettings />

                {/* User Listings Flow Section */}
                <UserListings />
            </div>
        </div>
    );
};

export default ProfilePage;