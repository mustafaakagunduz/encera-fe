// src/components/favorites/FavoritesPage.tsx
'use client';

import React from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useGetUserFavoritesQuery, useRemoveFavoriteMutation } from '@/store/api/favoriteApi';
import { PropertyResponse, ListingType, PropertyType } from '@/store/api/propertyApi';
import {
    Heart,
    MapPin,
    Eye,
    X,
    Home,
    ArrowLeft,
    Calendar,
    Building,
    Tag
} from 'lucide-react';
import Link from 'next/link';

export const FavoritesPage: React.FC = () => {
    const { t, isReady } = useAppTranslation();
    const { user } = useAuth();
    const router = useRouter();

    const [page, setPage] = React.useState(0);
    const { data: favoritesData, isLoading, error, refetch } = useGetUserFavoritesQuery(
        { page, size: 12 },
        { skip: !user }
    );
    const [removeFavorite] = useRemoveFavoriteMutation();

    // Redirect if not logged in
    React.useEffect(() => {
        if (!user) {
            router.push('/authentication');
        }
    }, [user, router]);

    const handleRemoveFavorite = async (propertyId: number) => {
        try {
            await removeFavorite(propertyId).unwrap();
        } catch (error) {
            console.error('Favorilerden kaldırma hatası:', error);
        }
    };

    const getListingTypeText = (type: ListingType) => {
        switch (type) {
            case ListingType.SALE:
                return isReady ? t('my-listings.listing-types.SALE') : 'Satılık';
            case ListingType.RENT:
                return isReady ? t('my-listings.listing-types.RENT') : 'Kiralık';
            default:
                return type;
        }
    };

    const getPropertyTypeText = (type: PropertyType) => {
        switch (type) {
            case PropertyType.RESIDENTIAL:
                return isReady ? t('my-listings.property-types.RESIDENTIAL') : 'Konut';
            case PropertyType.COMMERCIAL:
                return isReady ? t('my-listings.property-types.COMMERCIAL') : 'İş Yeri';
            case PropertyType.LAND:
                return isReady ? t('my-listings.property-types.LAND') : 'Arsa';
            case PropertyType.DAILY_RENTAL:
                return isReady ? t('my-listings.property-types.DAILY_RENTAL') : 'Günlük Kiralık';
            default:
                return type;
        }
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

    if (!user) {
        return null; // Will redirect in useEffect
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-lg font-medium mb-2">
                        {isReady ? 'Favoriler yüklenemedi' : 'Failed to load favorites'}
                    </div>
                    <button
                        onClick={() => refetch()}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        {isReady ? 'Tekrar dene' : 'Try again'}
                    </button>
                </div>
            </div>
        );
    }

    const favorites = favoritesData?.content || [];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors mr-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {isReady ? t('common.back') : 'Geri'}
                        </button>

                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <Heart className="w-6 h-6 mr-3 text-red-500" />
                                {isReady ? 'Favorilerim' : 'My Favorites'}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {favorites.length} {isReady ? 'favori ilan' : 'favorite properties'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Favorites Grid */}
                {favorites.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                        <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {isReady ? 'Henüz favori ilan yok' : 'No favorite properties yet'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {isReady
                                ? 'Beğendiğiniz ilanları favorilere ekleyerek buradan kolayca erişebilirsiniz.'
                                : 'Add properties to your favorites to easily access them here.'
                            }
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            {isReady ? 'İlanları Keşfet' : 'Explore Properties'}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favorites.map((property) => (
                            <div
                                key={property.id}
                                className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                            >
                                {/* Property Image */}
                                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                    {property.primaryImageUrl || (property.imageUrls && property.imageUrls.length > 0) ? (
                                        <img
                                            src={property.primaryImageUrl || property.imageUrls?.[0]}
                                            alt={property.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                                                if (fallback) {
                                                    fallback.style.display = 'flex';
                                                }
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className="fallback-icon absolute inset-0 flex items-center justify-center"
                                        style={{
                                            display: (property.primaryImageUrl || (property.imageUrls && property.imageUrls.length > 0)) ? 'none' : 'flex'
                                        }}
                                    >
                                        <Building className="w-12 h-12 text-gray-300" />
                                    </div>

                                    {/* Remove from favorites button */}
                                    <button
                                        onClick={() => handleRemoveFavorite(property.id)}
                                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                                        title="Favorilerden kaldır"
                                    >
                                        <X className="w-4 h-4 text-gray-600" />
                                    </button>

                                    {/* Featured badge */}
                                    {property.featured && (
                                        <div className="absolute top-2 left-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                ⭐ VIP
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Property Info */}
                                <div className="p-4">
                                    <Link href={`/house/${property.id}`} className="block">
                                        <h3 className="font-medium text-gray-900 hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                                            {property.title}
                                        </h3>

                                        {/* Location */}
                                        <div className="flex items-center text-gray-600 text-sm mb-3">
                                            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                                            <span className="truncate">
                                                {property.neighborhood}, {property.district}
                                            </span>
                                        </div>

                                        {/* Price */}
                                        <div className="text-lg font-bold text-gray-900 mb-3">
                                            {formatPrice(property.price)}
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {getListingTypeText(property.listingType)}
                                            </span>
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                {getPropertyTypeText(property.propertyType)}
                                            </span>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Eye className="w-4 h-4 mr-1" />
                                                <span>{property.viewCount}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                <span>{formatDate(property.createdAt)}</span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {favoritesData && favoritesData.totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(Math.max(0, page - 1))}
                                disabled={page === 0}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isReady ? 'Önceki' : 'Previous'}
                            </button>

                            <span className="px-3 py-2 text-sm text-gray-600">
                                {page + 1} / {favoritesData.totalPages}
                            </span>

                            <button
                                onClick={() => setPage(Math.min(favoritesData.totalPages - 1, page + 1))}
                                disabled={page >= favoritesData.totalPages - 1}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isReady ? 'Sonraki' : 'Next'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};