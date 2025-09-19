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
    Eye
} from 'lucide-react';
import Link from 'next/link';

interface PublicProfilePageProps {
    userId: number;
}

export const PublicProfilePage: React.FC<PublicProfilePageProps> = ({ userId }) => {
    const { t, isReady } = useAppTranslation();
    const { user } = useAuth();
    const router = useRouter();

    // Mock data - Bu gerçek API'den gelecek
    const profileUser = {
        id: userId,
        firstName: userId === 1 ? 'Encera' : 'Ahmet',
        lastName: userId === 1 ? '' : 'Yılmaz',
        email: userId === 1 ? 'info@encera.com' : 'ahmet@example.com',
        phoneNumber: userId === 1 ? '535 602 1168' : '532 123 4567',
        verified: userId === 1,
        joinDate: '2023-01-15',
        totalListings: 15,
        activeListings: 12,
        averageRating: 4.6,
        totalReviews: 23
    };

    const isEncera = userId === 1 || profileUser.firstName === 'Encera';

    // Mock listings data
    const userListings = [
        {
            id: 1,
            title: 'Şaşırtıcı Manzaralı 3+1 Daire',
            price: 2500000,
            city: 'İstanbul',
            district: 'Beşiktaş',
            neighborhood: 'Ortaköy',
            listingType: 'SALE',
            propertyType: 'RESIDENTIAL',
            viewCount: 245,
            createdAt: '2024-01-15T10:30:00Z',
            featured: true
        },
        {
            id: 2,
            title: 'Modern Ofis Alanı',
            price: 25000,
            city: 'İstanbul',
            district: 'Şişli',
            neighborhood: 'Mecidiyeköy',
            listingType: 'RENT',
            propertyType: 'COMMERCIAL',
            viewCount: 156,
            createdAt: '2024-01-10T14:20:00Z',
            featured: false
        }
    ];

    // Comments state
    const [newComment, setNewComment] = React.useState('');
    const [newRating, setNewRating] = React.useState(5);

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement comment API call
        console.log('Comment for user:', userId, 'Comment:', newComment, 'Rating:', newRating);
        setNewComment('');
        setNewRating(5);
    };

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
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            {/* Profile Header */}
                            <div className="text-center mb-6">
                                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <UserIcon className="w-12 h-12 text-gray-400" />
                                </div>

                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <h1 className="text-xl font-bold text-gray-900">
                                        {isEncera ? 'Encera' : `${profileUser.firstName} ${profileUser.lastName}`}
                                    </h1>
                                    {isEncera && (
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
                                                    star <= Math.floor(profileUser.averageRating)
                                                        ? 'text-yellow-400 fill-current'
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 ml-1">
                                        {profileUser.averageRating}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        ({profileUser.totalReviews} değerlendirme)
                                    </span>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                        {formatDate(profileUser.joinDate)} tarihinde katıldı
                                    </span>
                                </div>

                                <div className="flex items-center">
                                    <Building className="w-4 h-4 mr-3 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                        {profileUser.totalListings} ilan • {profileUser.activeListings} aktif
                                    </span>
                                </div>

                                <div className="flex items-center">
                                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                        {profileUser.phoneNumber}
                                    </span>
                                </div>

                                <div className="flex items-center">
                                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                        {profileUser.email}
                                    </span>
                                </div>
                            </div>

                            {/* Contact Button */}
                            <a
                                href={`tel:${profileUser.phoneNumber.replace(/\s/g, '')}`}
                                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                                <Phone className="w-4 h-4 mr-2" />
                                {isReady ? 'Ara' : 'Call'}
                            </a>
                        </div>

                        {/* Reviews Form - Only for logged in users */}
                        {user && user.id !== userId && (
                            <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            placeholder={isReady ? 'Deneyiminizi paylaşın...' : 'Share your experience...'}
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                                    >
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        {isReady ? 'Değerlendirme Gönder' : 'Submit Review'}
                                    </button>
                                </form>
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
                                {userListings.map((listing) => (
                                    <Link
                                        key={listing.id}
                                        href={`/house/${listing.id}`}
                                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                                {listing.title}
                                            </h3>
                                            {listing.featured && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    ⭐ VIP
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center text-gray-600 text-sm mb-2">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            <span>
                                                {listing.neighborhood}, {listing.district}, {listing.city}
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
                                ))}
                            </div>

                            {userListings.length === 0 && (
                                <div className="text-center text-gray-500 py-8">
                                    {isReady ? 'Henüz aktif ilan bulunmuyor.' : 'No active listings yet.'}
                                </div>
                            )}
                        </div>

                        {/* Reviews */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                {isReady ? 'Değerlendirmeler' : 'Reviews'}
                            </h2>

                            <div className="space-y-4">
                                {/* Sample Review */}
                                <div className="border-b border-gray-100 pb-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">Mehmet Öz</div>
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`w-3 h-3 ${
                                                                star <= 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                    <span className="text-xs text-gray-500 ml-1">5/5</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500">1 hafta önce</div>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Çok profesyonel ve güvenilir. İlan süreci boyunca çok yardımcı oldu.
                                    </p>
                                </div>

                                <div className="border-b border-gray-100 pb-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">Ayşe Kara</div>
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`w-3 h-3 ${
                                                                star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                    <span className="text-xs text-gray-500 ml-1">4/5</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500">2 hafta önce</div>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        İlanları çok detaylı ve doğru bilgilerle hazırlanmış. Tavsiye ederim.
                                    </p>
                                </div>
                            </div>

                            {profileUser.totalReviews > 2 && (
                                <div className="text-center mt-4">
                                    <button className="text-blue-600 text-sm hover:text-blue-700 transition-colors">
                                        Tüm değerlendirmeleri görüntüle ({profileUser.totalReviews})
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