'use client';

import React from 'react';
import { PublicProfilePage } from '@/components/profile/PublicProfilePage';
import { ENCERA_CONFIG } from '@/utils/profileHelpers';

const EnceraprofilePage = () => {
    // Backend'deki Encera hesabının ID'si (admin1@example.com)
    return <PublicProfilePage userId={ENCERA_CONFIG.USER_ID} />;
};

export default EnceraprofilePage;