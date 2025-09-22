// src/components/profile/PublicProfilePage.tsx
'use client';

import React from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    User as UserIcon,
    CheckCircle,
    Star,
    MessageCircle,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Building,
    Eye,
    Flag
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ComplaintButton } from '@/components/ui/complaint-button';
import Link from 'next/link';
import {
    useGetUserByIdQuery,
    useGetProfileReviewsQuery,
    useGetReviewStatsQuery,
    useCreateReviewMutation
} from '@/store/api/userApi';
import { useGetAllPropertiesQuery } from '@/store/api/propertyApi';

interface PublicProfilePageProps {
    userId: number;
}

export const PublicProfilePage: React.FC<PublicProfilePageProps> = ({ userId }) => {
    const { t, isReady } = useAppTranslation();
    const { user } = useAuth();
    const router = useRouter();

    // Backend API calls
    const { data: profileUser, isLoading: profileLoading } = useGetUserByIdQuery(userId);
    const { data: reviews, isLoading: reviewsLoading } = useGetProfileReviewsQuery(userId);
    const { data: reviewStats, isLoading: statsLoading } = useGetReviewStatsQuery(userId);
    const { data: propertiesData, isLoading: propertiesLoading } = useGetAllPropertiesQuery({ page: 0, size: 50 });

    const [createReview] = useCreateReviewMutation();

    // Comments state
    const [newComment, setNewComment] = React.useState('');
    const [newRating, setNewRating] = React.useState(5);
    const [reviewError, setReviewError] = React.useState('');

    const isEncera = profileUser?.firstName === 'Encera';

    // Kullanıcının daha önce bu profile yorum yapıp yapmadığını kontrol et
    const userHasReviewed = React.useMemo(() => {
        if (!user || !reviews) return false;
        return reviews.some(review => review.authorId === user.id.toString());
    }, [user, reviews]);

    // Filter properties by owner - Encera için özel koşul
    const userListings = React.useMemo(() => {
        if (!propertiesData?.content || !profileUser) return [];

        // PropertySummaryResponse'da owner field'ı olmadığı için şimdilik tüm property'leri göster
        // TODO: API response'una owner field'ı eklenmeli veya farklı endpoint kullanılmalı
        return propertiesData.content;
    }, [propertiesData, profileUser, isEncera]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setReviewError('');

        // Frontend validation
        if (!newComment.trim()) {
            setReviewError('Yorum boş olamaz');
            return;
        }

        if (newComment.trim().length < 10) {
            setReviewError('Yorum en az 10 karakter olmalıdır');
            return;
        }

        try {
            await createReview({
                profileOwnerId: userId,
                rating: newRating,
                comment: newComment.trim()
            }).unwrap();

            setNewComment('');
            setNewRating(5);
            setReviewError('');
            alert('Değerlendirmeniz başarıyla kaydedildi!');
        } catch (error: any) {
            console.error('Error creating review:', error);

            // Backend hata mesajlarını kullanıcı dostu hale getir
            let errorMessage = 'Bir hata oluştu';

            if (error?.data?.error) {
                const backendError = error.data.error;
                if (backendError.includes('already reviewed')) {
                    errorMessage = 'Bu profile daha önce değerlendirme yapmışsınız';
                } else if (backendError.includes('your own profile')) {
                    errorMessage = 'Kendi profilinize değerlendirme yapamazsınız';
                } else if (backendError.includes('10 and 1000 characters')) {
                    errorMessage = 'Yorum 10-1000 karakter arasında olmalıdır';
                } else {
                    errorMessage = backendError;
                }
            }

            setReviewError(errorMessage);
        }
    };

    if (profileLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Profil yükleniyor...</div>
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Kullanıcı bulunamadı</div>
            </div>
        );
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header with back button */}
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {isReady ? t('common.back') : 'Geri'}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            {/* Cover Image */}
                            <div
                                className="h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 relative"
                                style={{
                                    backgroundImage: profileUser.coverImageUrl ? `url(${profileUser.coverImageUrl})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                {!profileUser.coverImageUrl && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-600/20"></div>
                                )}
                            </div>

                            {/* Profile Header */}
                            <div className="text-center p-6 -mt-12 relative">
                                <Avatar className="w-24 h-24 mx-auto border-4 border-white shadow-lg">
                                    <AvatarImage src={profileUser.profilePictureUrl || ''} alt={`${profileUser.firstName} ${profileUser.lastName}`} />
                                    <AvatarFallback className="bg-blue-600 text-white text-xl font-bold">
                                        {profileUser.firstName[0]}{profileUser.lastName[0]}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <h1 className="text-xl font-bold text-gray-900">
                                        {isEncera ? 'Encera' : `${profileUser.firstName} ${profileUser.lastName}`}
                                    </h1>
                                    {(isEncera || profileUser.isVerified) && (
                                        <CheckCircle className="w-5 h-5 text-blue-500" />
                                    )}
                                </div>

                                <p className="text-gray-600">
                                    {isReady ? 'Gayrimenkul Uzmanı' : 'Real Estate Professional'}
                                </p>

                                {/* Rating */}
                                <div className="flex items-center justify-center gap-1 mt-3">
                                    <div className="flex items-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-4 h-4 ${
                                                    star <= Math.floor(reviewStats?.averageRating || 0)
                                                        ? 'text-yellow-400 fill-current'
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 ml-1">
                                        {reviewStats?.averageRating?.toFixed(1) || '0.0'}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        ({reviewStats?.totalReviews || 0} değerlendirme)
                                    </span>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-3 mb-6 mt-4">
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                        {formatDate(profileUser.createdAt)} tarihinde katıldı
                                    </span>
                                </div>

                                <div className="flex items-center">
                                    <Building className="w-4 h-4 mr-3 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                        {userListings.length} ilan • {userListings.length} aktif
                                    </span>
                                </div>

                                {profileUser.phoneNumber && (
                                    <div className="flex items-center">
                                        <Phone className="w-4 h-4 mr-3 text-gray-400" />
                                        <span className="text-sm text-gray-600">
                                            {profileUser.phoneNumber}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center">
                                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                        {profileUser.email}
                                    </span>
                                </div>
                            </div>

                            {/* Contact and Report Buttons */}
                            <div className="mt-6 space-y-3">
                                {profileUser.phoneNumber && (
                                    <a
                                        href={`tel:${profileUser.phoneNumber.replace(/\s/g, '')}`}
                                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                    >
                                        <Phone className="w-4 h-4 mr-2" />
                                        {isReady ? 'Ara' : 'Call'}
                                    </a>
                                )}

                                {/* Complaint Button - Only for logged in users viewing other profiles */}
                                {user && user.id !== userId && (
                                    <ComplaintButton
                                        type="PROFILE"
                                        targetId={userId}
                                        targetTitle={`${profileUser.firstName} ${profileUser.lastName}`}
                                        buttonText="Profili Şikayet Et"
                                        className="w-full justify-center"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Reviews Form - Only for logged in users who haven't reviewed yet */}
                        {user && user.id !== userId && (
                            <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
                                {userHasReviewed ? (
                                    <div className="text-center py-6">
                                        <div className="text-green-600 mb-2">
                                            ✓ Değerlendirme Tamamlandı
                                        </div>
                                        <p className="text-gray-600 text-sm">
                                            Bu kullanıcı hakkında daha önce değerlendirme yapmışsınız.
                                        </p>
                                        <p className="text-gray-500 text-xs mt-1">
                                            Her kullanıcı için sadece bir değerlendirme yapabilirsiniz.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="font-medium text-gray-900 mb-4">
                                            {isReady ? 'Değerlendirme Yap' : 'Leave a Review'}
                                        </h3>

                                <form onSubmit={handleCommentSubmit} className="space-y-4">
                                    {/* Rating */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {isReady ? 'Puan' : 'Rating'}
                                        </label>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setNewRating(star)}
                                                    className={`w-6 h-6 ${
                                                        star <= newRating ? 'text-yellow-400' : 'text-gray-300'
                                                    } hover:text-yellow-400 transition-colors`}
                                                >
                                                    <Star className={`w-6 h-6 ${star <= newRating ? 'fill-current' : ''}`} />
                                                </button>
                                            ))}
                                            <span className="ml-2 text-sm text-gray-600">
                                                {newRating}/5
                                            </span>
                                        </div>
                                    </div>

                                    {/* Comment */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {isReady ? 'Yorumunuz' : 'Your Review'}
                                        </label>
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            rows={3}
                                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                                reviewError ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder={isReady ? 'Deneyiminizi paylaşın...' : 'Share your experience...'}
                                            required
                                        />
                                        <div className="flex justify-between items-center mt-1">
                                            <div className={`text-xs ${
                                                newComment.length < 10 ? 'text-red-500' : 'text-gray-500'
                                            }`}>
                                                {newComment.length}/1000 karakter {newComment.length < 10 && '(en az 10 karakter gerekli)'}
                                            </div>
                                        </div>
                                        {reviewError && (
                                            <div className="text-red-500 text-sm mt-1">
                                                {reviewError}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={newComment.trim().length < 10}
                                        className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md transition-colors ${
                                            newComment.trim().length < 10
                                                ? 'text-gray-500 bg-gray-300 cursor-not-allowed'
                                                : 'text-white bg-green-600 hover:bg-green-700'
                                        }`}
                                    >
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        {isReady ? 'Değerlendirme Gönder' : 'Submit Review'}
                                    </button>
                                </form>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* User Listings */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                {isReady ? 'Aktif İlanlar' : 'Active Listings'}
                            </h2>

                            <div className="grid gap-4">
                                {propertiesLoading ? (
                                    <div className="text-center py-8 text-gray-500">
                                        İlanlar yükleniyor...
                                    </div>
                                ) : userListings.length > 0 ? (
                                    userListings.map((listing) => (
                                        <Link
                                            key={listing.id}
                                            href={`/house/${listing.id}`}
                                            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                                    {listing.title}
                                                </h3>
                                                <div className="flex gap-2">
                                                    {listing.pappSellable && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                            ENCERA
                                                        </span>
                                                    )}
                                                    {listing.featured && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                            ⭐ VIP
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center text-gray-600 text-sm mb-2">
                                                <MapPin className="w-4 h-4 mr-1" />
                                                <span>
                                                    {listing.district}, {listing.city}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {formatPrice(listing.price)}
                                                </div>
                                                <div className="flex items-center text-gray-500 text-sm">
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    <span>{listing.viewCount}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mt-2">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {listing.listingType === 'SALE' ? 'Satılık' : 'Kiralık'}
                                                </span>
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    {listing.propertyType === 'RESIDENTIAL' ? 'Konut' : 'İş Yeri'}
                                                </span>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500 py-8">
                                        {isReady ? 'Henüz aktif ilan bulunmuyor.' : 'No active listings yet.'}
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Reviews */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                {isReady ? 'Değerlendirmeler' : 'Reviews'}
                            </h2>

                            <div className="space-y-4">
                                {reviewsLoading ? (
                                    <div className="text-center py-8 text-gray-500">
                                        Değerlendirmeler yükleniyor...
                                    </div>
                                ) : reviews && reviews.length > 0 ? (
                                    reviews.slice(0, 5).map((review) => (
                                        <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarImage src={review.authorAvatar || ''} alt={review.authorName} />
                                                        <AvatarFallback className="bg-gray-600 text-white text-sm">
                                                            {review.authorName.split(' ').map(n => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {review.authorName}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star
                                                                    key={star}
                                                                    className={`w-3 h-3 ${
                                                                        star <= review.rating
                                                                            ? 'text-yellow-400 fill-current'
                                                                            : 'text-gray-300'
                                                                    }`}
                                                                />
                                                            ))}
                                                            <span className="text-xs text-gray-500 ml-1">
                                                                {review.rating}/5
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(review.createdAt).toLocaleDateString('tr-TR', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {review.comment}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        Henüz değerlendirme bulunmuyor.
                                    </div>
                                )}
                            </div>

                            {reviews && reviews.length > 5 && (
                                <div className="text-center mt-4">
                                    <button className="text-blue-600 text-sm hover:text-blue-700 transition-colors">
                                        Tüm değerlendirmeleri görüntüle ({reviewStats?.totalReviews || reviews.length})
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};