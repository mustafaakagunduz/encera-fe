// src/components/property/PropertyDetail.tsx
'use client';

import React from 'react';
import { useGetPropertyByIdQuery, useDeletePropertyMutation, PropertyResponse, ListingType, PropertyType } from '@/store/api/propertyApi';
import { useToggleFavoriteMutation, useGetFavoriteStatusQuery } from '@/store/api/favoriteApi';
import { useAddCommentMutation, useGetCommentsByPropertyQuery, useGetPropertyRatingQuery, useDeleteCommentMutation } from '@/store/api/commentApi';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Eye,
    Edit,
    Trash2,
    MapPin,
    Tag,
    TrendingUp,
    Calendar,
    Square,
    Car,
    Shield,
    Briefcase,
    Home,
    Coffee,
    Image as ImageIcon,
    Phone,
    User as UserIcon,
    Heart,
    CheckCircle,
    Star,
    MessageCircle,
    MessageSquare,
    Trash
} from 'lucide-react';
import Link from 'next/link';
import { PropertyImageGallery } from '@/components/ui/property-image-gallery';

interface PropertyDetailProps {
    propertyId: number;
}

export const PropertyDetail: React.FC<PropertyDetailProps> = ({ propertyId }) => {
    const { t, isReady } = useAppTranslation();
    const { user } = useAuth();
    const router = useRouter();

    // Debug auth state
    React.useEffect(() => {
        console.log('Auth state in PropertyDetail:', { user });
    }, [user]);
    const { data: property, isLoading, error } = useGetPropertyByIdQuery(propertyId);
    const [deleteProperty] = useDeletePropertyMutation();

    // Kullanıcının bu ilanın sahibi olup olmadığını kontrol et
    const isOwner = Boolean(user && property && user.id === property.owner.id);

    // Favorites
    const { data: favoriteStatus } = useGetFavoriteStatusQuery(propertyId, {
        skip: !user || isOwner
    });
    const [toggleFavorite, { isLoading: isToggling }] = useToggleFavoriteMutation();

    // Comments state
    const [newComment, setNewComment] = React.useState('');
    const [newRating, setNewRating] = React.useState(5);

    // Comment API hooks
    const { data: commentsData, isLoading: commentsLoading, refetch: refetchComments } = useGetCommentsByPropertyQuery(
        { propertyId, page: 0, size: 10 },
        { skip: !propertyId }
    );
    const { data: ratingData } = useGetPropertyRatingQuery(propertyId, { skip: !propertyId });
    const [addComment, { isLoading: isSubmittingComment }] = useAddCommentMutation();
    const [deleteComment] = useDeleteCommentMutation();

    const handleDelete = async () => {
        if (window.confirm(isReady ? t('my-listings.actions.delete-confirm') : 'Bu ilanı silmek istediğinizden emin misiniz?')) {
            try {
                await deleteProperty(propertyId).unwrap();
                router.push('/my-listings');
            } catch (error) {
                console.error('Silme hatası:', error);
            }
        }
    };

    const handleFavoriteToggle = async () => {
        if (!user) {
            console.log('User not logged in');
            return;
        }

        console.log('User logged in:', user);
        console.log('User ID:', user.id);

        try {
            await toggleFavorite(propertyId).unwrap();
        } catch (error) {
            console.error('Favorilere ekleme/çıkarma hatası:', error);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newComment.trim() || newComment.trim().length < 10) return;

        try {
            await addComment({
                propertyId,
                rating: newRating,
                comment: newComment.trim()
            }).unwrap();

            setNewComment('');
            setNewRating(5);
            refetchComments();
        } catch (error) {
            console.error('Yorum eklenirken hata oluştu:', error);
        }
    };

    const isEncera = property?.owner?.firstName === 'Encera' || property?.pappSellable;

    const handleCommentDelete = async (commentId: number) => {
        if (window.confirm(isReady ? t('property-detail.comments.delete-confirm') : 'Bu yorumu silmek istediğinizden emin misiniz?')) {
            try {
                await deleteComment(commentId).unwrap();
                refetchComments();
            } catch (error) {
                console.error('Yorum silinirken hata oluştu:', error);
            }
        }
    };

    const getStatusText = (property: PropertyResponse) => {
        if (!property.active) {
            return isReady ? t('my-listings.status.inactive') : 'Pasif';
        }
        if (!property.approved) {
            return isReady ? t('my-listings.status.pending') : 'Onay Bekliyor';
        }
        return isReady ? t('my-listings.status.approved') : 'Onaylandı';
    };

    const getStatusColor = (property: PropertyResponse) => {
        if (!property.active) return 'bg-gray-100 text-gray-800';
        if (!property.approved) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
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
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-lg font-medium mb-2">
                        {isReady ? 'İlan bulunamadı' : 'Property not found'}
                    </div>
                    <div className="text-gray-600">
                        {isReady ? 'Bu ilan mevcut değil veya kaldırılmış olabilir.' : 'This property may not exist or has been removed.'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header with back button and actions */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {isReady ? t('property-detail.back-to-listings') : 'İlanlara Geri Dön'}
                    </button>

                    <div className="flex items-center gap-3">
                        {/* Favorites Button - Tüm kullanıcılar için (ilan sahibi hariç) */}
                        {!isOwner && user && (
                            <button
                                onClick={handleFavoriteToggle}
                                disabled={isToggling}
                                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                    favoriteStatus?.isFavorited
                                        ? 'text-red-600 bg-red-50 border border-red-200 hover:bg-red-100'
                                        : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                                } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Heart className={`w-4 h-4 mr-2 ${favoriteStatus?.isFavorited ? 'fill-current' : ''}`} />
                                {isToggling
                                    ? (isReady ? t('common.submitting') : 'İşleniyor...')
                                    : favoriteStatus?.isFavorited
                                        ? (isReady ? t('property-detail.remove-from-favorites') : 'Favorilerden Çıkar')
                                        : (isReady ? t('property-detail.add-to-favorites') : 'Favorilere Ekle')
                                }
                            </button>
                        )}

                        {/* Action Buttons - Sadece ilan sahibi görür */}
                        {isOwner && (
                            <>
                                <Link
                                    href={`/create-listing?edit=${property.id}`}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    {isReady ? t('my-listings.actions.edit') : 'Düzenle'}
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {isReady ? t('my-listings.actions.delete') : 'Sil'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                    {/* Left Column - Image Gallery */}
                    <div className="lg:col-span-2">
                        <PropertyImageGallery
                            images={property.imageUrls || []}
                            primaryImageUrl={property.primaryImageUrl}
                            title={property.title}
                        />
                    </div>

                    {/* Right Column - Property Info */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            {/* Status Badge - Sadece ilan sahibi görür */}
                            {isOwner && (
                                <div className="mb-6">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(property)}`}>
                                        {getStatusText(property)}
                                    </span>
                                </div>
                            )}

                            {/* Price Section */}
                            <div className="mb-8">
                                <div className="text-4xl font-bold text-gray-900 mb-2">
                                    {formatPrice(property.price)}
                                </div>
                                {property.negotiable && (
                                    <div className="text-sm text-orange-600 font-medium">
                                        {isReady ? t('property-detail.negotiable') : 'Pazarlık yapılabilir'}
                                    </div>
                                )}
                            </div>

                            {/* Title and Tags */}
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                                    {property.title}
                                </h1>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                                        {getListingTypeText(property.listingType)}
                                    </span>
                                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded">
                                        {getPropertyTypeText(property.propertyType)}
                                    </span>
                                    {property.featured && (
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded">
                                            ⭐ VIP
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Location */}
                            <div className="mb-6 pb-6 border-b border-gray-100">
                                <div className="flex items-start">
                                    <MapPin className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-gray-900 mb-1">Konum</div>
                                        <div className="text-gray-600">
                                            {property.neighborhood}, {property.district}, {property.city}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Key Features */}
                            <div className="mb-6 pb-6 border-b border-gray-100">
                                <div className="font-medium text-gray-900 mb-4">Özellikler</div>
                                <div className="space-y-4">
                                    {property.grossArea && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Square className="w-4 h-4 mr-3 text-gray-400" />
                                                <span className="text-gray-600">Brüt Alan</span>
                                            </div>
                                            <span className="font-medium text-gray-900">{property.grossArea} m²</span>
                                        </div>
                                    )}
                                    {property.roomConfiguration && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Home className="w-4 h-4 mr-3 text-gray-400" />
                                                <span className="text-gray-600">Oda Sayısı</span>
                                            </div>
                                            <span className="font-medium text-gray-900">
                                                {property.roomConfiguration.roomCount}+{property.roomConfiguration.hallCount}
                                            </span>
                                        </div>
                                    )}
                                    {property.netArea && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Square className="w-4 h-4 mr-3 text-gray-400" />
                                                <span className="text-gray-600">Net Alan</span>
                                            </div>
                                            <span className="font-medium text-gray-900">{property.netArea} m²</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="text-sm text-gray-500">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                        <Eye className="w-4 h-4 mr-2" />
                                        <span>{property.viewCount} görüntülenme</span>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span>{formatDate(property.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Contact Info - Full width below */}
                {!isOwner && (
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Contact Details */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-6 text-lg">İletişim Bilgileri</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                                            <UserIcon className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <div className="font-medium text-gray-900">
                                                    {isEncera ? 'Encera' : `${property.owner.firstName} ${property.owner.lastName}`}
                                                </div>
                                                {isEncera && (
                                                    <CheckCircle className="w-4 h-4 text-blue-500" />
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500">İlan Sahibi</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                                            <Phone className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {isEncera ? '535 602 1168' : property.owner.phoneNumber || 'Telefon bulunamadı'}
                                            </div>
                                            <div className="text-sm text-gray-500">Telefon Numarası</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-6 text-lg">İletişime Geç</h3>

                                <div className="space-y-4">
                                    <a
                                        href={`tel:${isEncera ? '5356021168' : property.owner.phoneNumber}`}
                                        className="w-full inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg"
                                    >
                                        <Phone className="w-4 h-4 mr-2" />
                                        Hemen Ara
                                    </a>

                                    <Link
                                        href={`/messages?userId=${property.owner.id}&propertyId=${propertyId}`}
                                        className="w-full inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg"
                                    >
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Mesaj Gönder
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Property Details Section */}
                <div className="mt-12 pt-8 border-t border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">İlan Detayları</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Left Column - Basic Info */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-6">Temel Bilgiler</h3>
                            <div className="space-y-4">
                                {property.roomConfiguration?.bathroomCount && (
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Banyo Sayısı</span>
                                        <span className="font-medium text-gray-900">{property.roomConfiguration.bathroomCount}</span>
                                    </div>
                                )}
                                {property.monthlyFee && (
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Aidat</span>
                                        <span className="font-medium text-gray-900">{formatPrice(property.monthlyFee)}</span>
                                    </div>
                                )}
                                {property.deposit && (
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Depozito</span>
                                        <span className="font-medium text-gray-900">{formatPrice(property.deposit)}</span>
                                    </div>
                                )}
                                {property.buildingAge !== undefined && (
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Bina Yaşı</span>
                                        <span className="font-medium text-gray-900">{property.buildingAge} yıl</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Features */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-6">Özellikler</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {property.elevator && (
                                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                                        <Briefcase className="w-4 h-4 mr-2 text-green-600" />
                                        <span className="text-sm text-green-800 font-medium">Asansör</span>
                                    </div>
                                )}
                                {property.parking && (
                                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                                        <Car className="w-4 h-4 mr-2 text-green-600" />
                                        <span className="text-sm text-green-800 font-medium">Otopark</span>
                                    </div>
                                )}
                                {property.balcony && (
                                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                                        <Home className="w-4 h-4 mr-2 text-green-600" />
                                        <span className="text-sm text-green-800 font-medium">Balkon</span>
                                    </div>
                                )}
                                {property.security && (
                                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                                        <Shield className="w-4 h-4 mr-2 text-green-600" />
                                        <span className="text-sm text-green-800 font-medium">Güvenlik</span>
                                    </div>
                                )}
                                {property.furnished && (
                                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                                        <Coffee className="w-4 h-4 mr-2 text-green-600" />
                                        <span className="text-sm text-green-800 font-medium">Eşyalı</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {property.description && (
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Açıklama</h3>
                            <div className="bg-gray-50 rounded-lg p-6">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {property.description}
                                </p>
                            </div>
                        </div>
                    )}

                </div>

                {/* Comments and Rating Section */}
                {!isOwner && user && (
                    <div className="mt-12 pt-8 border-t border-gray-100">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                                <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Yorum ve Değerlendirme
                            </h2>
                        </div>

                        {/* Add Comment Form */}
                        <form onSubmit={handleCommentSubmit} className="space-y-8">
                            {/* Rating Section */}
                            <div>
                                <label className="block text-lg font-semibold text-gray-900 mb-4">
                                    Değerlendirme
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setNewRating(star)}
                                                className={`w-8 h-8 transition-all duration-200 hover:scale-110 ${
                                                    star <= newRating
                                                        ? 'text-amber-400 hover:text-amber-500'
                                                        : 'text-gray-300 hover:text-amber-300'
                                                }`}
                                            >
                                                <Star className={`w-8 h-8 ${star <= newRating ? 'fill-current' : ''}`} />
                                            </button>
                                        ))}
                                    </div>
                                    <div className="ml-4 px-3 py-1 bg-amber-50 rounded-full">
                                        <span className="text-sm font-medium text-amber-700">
                                            {newRating}/5 Yıldız
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Comment Section */}
                            <div>
                                <label className="block text-lg font-semibold text-gray-900 mb-4">
                                    Yorumunuz
                                </label>
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                                    placeholder="İlan hakkındaki düşüncelerinizi detaylıca paylaşın..."
                                    required
                                />
                                <div className="text-sm text-gray-500 mt-2">
                                    {newComment.length}/1000 karakter {newComment.length < 10 && '(en az 10 karakter gerekli)'}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmittingComment || !newComment.trim() || newComment.trim().length < 10}
                                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <MessageCircle className="w-5 h-5 mr-2 inline" />
                                {isSubmittingComment ? 'Gönderiliyor...' : 'Yorum Ekle'}
                            </button>
                        </form>

                        {/* Comments List */}
                        <div className="mt-12">
                            <div className="flex items-center gap-2 mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Diğer Yorumlar
                                </h3>
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                                    {commentsData?.totalElements || 0} yorum
                                </span>
                                {ratingData && ratingData.totalComments > 0 && (
                                    <div className="flex items-center gap-1 ml-2">
                                        <Star className="w-4 h-4 text-amber-400 fill-current" />
                                        <span className="text-sm font-medium text-gray-700">
                                            {ratingData.averageRating.toFixed(1)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {commentsLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                </div>
                            ) : commentsData && commentsData.content.length > 0 ? (
                                <div className="space-y-6">
                                    {commentsData.content.map((comment) => (
                                        <div key={comment.id} className="pb-6 border-b border-gray-100 last:border-b-0">
                                            <div className="flex items-start gap-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-semibold text-sm">
                                                            {comment.userFirstName.charAt(0)}{comment.userLastName.charAt(0)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <h5 className="font-semibold text-gray-900">
                                                                {comment.userFirstName} {comment.userLastName}
                                                            </h5>
                                                            <div className="flex items-center gap-1">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star
                                                                        key={star}
                                                                        className={`w-4 h-4 ${
                                                                            star <= comment.rating ? 'text-amber-400 fill-current' : 'text-gray-300'
                                                                        }`}
                                                                    />
                                                                ))}
                                                                <span className="text-sm text-gray-500 ml-1">{comment.rating}.0</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-500">
                                                                {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
                                                            </span>
                                                            {user && user.id === comment.userId && (
                                                                <button
                                                                    onClick={() => handleCommentDelete(comment.id)}
                                                                    className="text-red-500 hover:text-red-700 transition-colors p-1"
                                                                    title="Sil"
                                                                >
                                                                    <Trash className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-700 leading-relaxed">
                                                        {comment.comment}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="inline-flex items-center gap-2 text-gray-500">
                                        <MessageCircle className="w-4 h-4" />
                                        <span className="text-sm font-medium">
                                            Henüz yorum bulunmuyor.
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Property Owner Link */}
                {!isOwner && (
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                    <UserIcon className="w-6 h-6 text-gray-600" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="font-medium text-gray-900">
                                            {isEncera ? 'Encera' : `${property.owner.firstName} ${property.owner.lastName}`}
                                        </div>
                                        {isEncera && (
                                            <CheckCircle className="w-4 h-4 text-blue-500" />
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500">Gayrimenkul Uzmanı</div>
                                </div>
                            </div>

                            <Link
                                href={`/profile/${property.owner.id}`}
                                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                Profili Görüntüle →
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};