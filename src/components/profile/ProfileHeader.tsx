'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Edit2, Camera, MapPin, Calendar, Award, Star, Upload } from 'lucide-react';
import { useGetProfileQuery, useUploadProfilePictureMutation, useUploadCoverImageMutation } from '@/store/api/userApi';
import { useUploadProfilePictureMutation as useUploadProfilePictureFile, useUploadCoverImageMutation as useUploadCoverImageFile } from '@/store/api/fileUploadApi';
import ImageUploadModal from '@/components/ui/ImageUploadModal';

const ProfileHeader: React.FC = () => {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [isUploadingProfile, setIsUploadingProfile] = useState(false);
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showCoverModal, setShowCoverModal] = useState(false);

    // Get profile data from API
    const { data: profile, isLoading, error } = useGetProfileQuery();

    // File upload mutations
    const [uploadProfilePictureFile] = useUploadProfilePictureFile();
    const [uploadCoverImageFile] = useUploadCoverImageFile();
    const [updateProfilePicture] = useUploadProfilePictureMutation();
    const [updateCoverImage] = useUploadCoverImageMutation();

    // Handle profile picture upload
    const handleProfilePictureUpload = async (file: File) => {
        try {
            setIsUploadingProfile(true);

            // Upload file to storage
            const uploadResult = await uploadProfilePictureFile(file).unwrap();

            // Update user profile with new URL
            await updateProfilePicture({ profilePictureUrl: uploadResult.fileUrl }).unwrap();
        } catch (error) {
            console.error('Profile picture upload failed:', error);
            throw error;
        } finally {
            setIsUploadingProfile(false);
        }
    };

    // Handle cover image upload
    const handleCoverImageUpload = async (file: File) => {
        try {
            setIsUploadingCover(true);

            // Upload file to storage
            const uploadResult = await uploadCoverImageFile(file).unwrap();

            // Update user profile with new URL
            await updateCoverImage({ coverImageUrl: uploadResult.fileUrl }).unwrap();
        } catch (error) {
            console.error('Cover image upload failed:', error);
            throw error;
        } finally {
            setIsUploadingCover(false);
        }
    };

    // Handle loading state
    if (isLoading) {
        return (
            <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-200/50">
                <div className="p-8 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                    <span className="ml-2">{t('common.loading')}</span>
                </div>
            </div>
        );
    }

    // Handle error state
    if (error || !profile) {
        return (
            <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-200/50">
                <div className="p-8 text-center text-red-600">
                    Failed to load profile data. Please refresh the page.
                </div>
            </div>
        );
    }

    // Create user profile object from API data
    const userProfile = {
        name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || t('profile.unknown-user'),
        email: profile.email || '',
        bio: profile.bio || t('profile.no-bio'),
        location: profile.location || t('profile.location-not-specified'),
        joinDate: profile.createdAt ? new Date(profile.createdAt).getFullYear().toString() : '2024',
        totalListings: 0, // TODO: Get from properties API
        successRate: 95, // TODO: Calculate from actual data
        rating: 4.8, // TODO: Get from reviews API
        profileImage: profile.profilePictureUrl || '',
        coverImage: profile.coverImageUrl || ''
    };

    return (
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/30 backdrop-blur-sm">
            {/* Cover Image Section */}
            <div
                className="h-56 md:h-72 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden"
                style={{
                    backgroundImage: userProfile.coverImage ? `url(${userProfile.coverImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                {/* Modern pattern overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/10"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%236366f1%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%227%22%20cy%3D%227%22%20r%3D%227%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

                {/* Cover Edit Button */}
                <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-6 right-6 bg-white/80 backdrop-blur-md border-white/50 text-slate-700 hover:bg-white/90 shadow-lg transition-all duration-300"
                    onClick={() => setShowCoverModal(true)}
                    disabled={isUploadingCover}
                >
                    {isUploadingCover ? (
                        <Upload className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Camera className="w-4 h-4 mr-2" />
                    )}
                    {isUploadingCover ? t('common.uploading') : t('profile.cover-photo')}
                </Button>

                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-transparent"></div>
            </div>

            {/* Profile Content */}
            <div className="relative px-8 pb-10 -mt-24">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                    {/* Left Side - Profile Image & Basic Info */}
                    <div className="flex flex-col md:flex-row md:items-end gap-8">
                        {/* Profile Image */}
                        <div className="relative">
                            <Avatar className="w-40 h-40 border-6 border-white shadow-2xl ring-4 ring-blue-500/10">
                                <AvatarImage src={userProfile.profileImage} alt={userProfile.name} />
                                <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                                    {userProfile.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>

                            <Button
                                size="sm"
                                className="absolute -bottom-3 -right-3 rounded-full w-10 h-10 p-0 bg-blue-600 hover:bg-blue-700 shadow-lg border-4 border-white transition-all duration-300"
                                onClick={() => setShowProfileModal(true)}
                                disabled={isUploadingProfile}
                            >
                                {isUploadingProfile ? (
                                    <Upload className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Camera className="w-4 h-4" />
                                )}
                            </Button>
                        </div>

                        {/* Basic Info */}
                        <div className="md:mb-6">
                            <div className="flex items-center gap-4 mb-3">
                                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                    {userProfile.name}
                                </h1>
                                <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 px-3 py-1 text-sm font-semibold">
                                    <Award className="w-3 h-3 mr-1" />
                                    {t('profile.expert')}
                                </Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-4 text-lg">
                                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-full">
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                    <span className="font-medium">{userProfile.location}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-full">
                                    <Calendar className="w-5 h-5 text-green-600" />
                                    <span className="font-medium">{userProfile.joinDate} {t('profile.member-since')}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-amber-50 px-3 py-2 rounded-full">
                                    <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                                    <span className="font-bold text-amber-700">{userProfile.rating}</span>
                                </div>
                            </div>

                            <p className="text-slate-600 max-w-2xl leading-relaxed text-lg">
                                {userProfile.bio}
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Edit Button */}
                    <div className="md:mb-6">
                        <Button
                            onClick={() => setIsEditing(!isEditing)}
                            size="lg"
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg font-semibold"
                        >
                            <Edit2 className="w-5 h-5 mr-3" />
                            {t('profile.edit-profile')}
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
                    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 rounded-3xl border border-blue-200/30 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="text-center">
                            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                                {userProfile.totalListings}
                            </div>
                            <div className="text-slate-600 font-semibold text-lg">
                                {t('profile.total-listings')}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-8 rounded-3xl border border-emerald-200/30 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="text-center">
                            <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
                                %{userProfile.successRate}
                            </div>
                            <div className="text-slate-600 font-semibold text-lg">
                                {t('profile.success-rate')}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-8 rounded-3xl border border-amber-200/30 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Star className="w-7 h-7 fill-amber-500 text-amber-500" />
                                <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                    {userProfile.rating}
                                </div>
                            </div>
                            <div className="text-slate-600 font-semibold text-lg">
                                {t('profile.customer-rating')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Modals */}
            <ImageUploadModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                onUpload={handleProfilePictureUpload}
                title={t('profile.upload-profile-picture')}
                description={t('profile.profile-picture-description')}
                aspectRatio="square"
                maxSizeMB={5}
                isUploading={isUploadingProfile}
            />

            <ImageUploadModal
                isOpen={showCoverModal}
                onClose={() => setShowCoverModal(false)}
                onUpload={handleCoverImageUpload}
                title={t('profile.upload-cover-image')}
                description={t('profile.cover-image-description')}
                aspectRatio="wide"
                maxSizeMB={10}
                isUploading={isUploadingCover}
            />
        </div>
    );
};

export default ProfileHeader;