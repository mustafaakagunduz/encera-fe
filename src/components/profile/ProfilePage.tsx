'use client';

import React from 'react';
import ProfileHeader from './ProfileHeader';
import UserListings from './UserListings';
import ProfileReviews from './ProfileReviews';
import { useGetProfileQuery } from '@/store/api/userApi';

const ProfilePage: React.FC = () => {
    const { data: profile } = useGetProfileQuery();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10">
            <div className="w-full">
                {/* Hero/Profile Header Section */}
                <ProfileHeader />

                {/* Reviews & Comments Section */}
                {profile?.id && (
                    <ProfileReviews isOwnProfile={true} profileOwnerId={profile.id} />
                )}

                {/* User Listings Flow Section */}
                <UserListings />
            </div>
        </div>
    );
};

export default ProfilePage;