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
    const isOwner = user && property && user.id === property.owner.id;

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
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                <div className={`grid gap-6 mb-6 ${
                    isOwner 
                        ? 'grid-cols-1 lg:grid-cols-2' 
                        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`}>

                    {/* Image Gallery - Left Side */}
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                            <div className="text-center text-gray-500">
                                <ImageIcon className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                                <p className="text-sm">
                                    {isReady ? 'Görsel yüklenmedi' : 'No image uploaded'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Property Info - Right Side */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        {/* Status Badge - Sadece ilan sahibi görür */}
                        {isOwner && (
                            <div className="mb-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(property)}`}>
                                    {getStatusText(property)}
                                </span>
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            {property.title}
                        </h1>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {getListingTypeText(property.listingType)}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                {getPropertyTypeText(property.propertyType)}
                            </span>
                            {property.featured && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                    ⭐ VIP
                                </span>
                            )}
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                            <div className="text-3xl font-bold text-gray-900">
                                {formatPrice(property.price)}
                            </div>
                            {property.negotiable && (
                                <div className="text-sm text-orange-600 font-medium mt-1">
                                    {isReady ? t('property-detail.negotiable') : 'Pazarlık yapılabilir'}
                                </div>
                            )}
                        </div>

                        {/* Location */}
                        <div className="flex items-center text-gray-600 mb-6">
                            <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                            <span>
                                {property.neighborhood}, {property.district}, {property.city}
                            </span>
                        </div>

                        {/* Key Features */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {property.grossArea && (
                                <div className="flex items-center">
                                    <Square className="w-5 h-5 mr-3 text-gray-400" />
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">
                                            {property.grossArea} m²
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {isReady ? 'Brüt Alan' : 'Gross Area'}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {property.roomConfiguration && (
                                <div className="flex items-center">
                                    <Home className="w-5 h-5 mr-3 text-gray-400" />
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">
                                            {property.roomConfiguration.roomCount}+{property.roomConfiguration.hallCount}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {isReady ? 'Oda Sayısı' : 'Room Count'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* View Count and Date */}
                        <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                            <div className="flex items-center">
                                <Eye className="w-4 h-4 mr-1" />
                                <span>{property.viewCount} {isReady ? t('property-detail.view-count') : 'görüntülenme'}</span>
                            </div>
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>{formatDate(property.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info - Ilan sahibi değilse iletişim bilgilerini göster */}
                    {!isOwner && (
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="font-medium text-gray-900 mb-4">
                                {isReady ? t('property-detail.contact') : 'İletişim'}
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <UserIcon className="w-5 h-5 mr-3 text-gray-400" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-medium text-gray-900">
                                                {isEncera ? 'Encera' : `${property.owner.firstName} ${property.owner.lastName}`}
                                            </div>
                                            {isEncera && (
                                                <CheckCircle className="w-4 h-4 text-blue-500" />
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {isReady ? 'İlan Sahibi' : 'Property Owner'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <Phone className="w-5 h-5 mr-3 text-gray-400" />
                                    <div>
                                        <div className="text-lg font-semibold text-gray-900 mb-1">
                                            {isEncera ? '535 602 1168' : property.owner.phoneNumber || 'Telefon bulunamadı'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {isReady ? 'Telefon' : 'Phone'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <a
                                    href={`tel:${isEncera ? '5356021168' : property.owner.phoneNumber}`}
                                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                >
                                    <Phone className="w-4 h-4 mr-2" />
                                    {isReady ? t('property-detail.call') : 'Ara'}
                                </a>

                                <Link
                                    href={`/messages?userId=${property.owner.id}&propertyId=${propertyId}`}
                                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    {isReady ? t('property-detail.send-message') : 'Mesaj Gönder'}
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="grid grid-cols-1 gap-6">

                    {/* Property Details */}
                    <div>
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                                {/* Basic Info */}
                                <div className="space-y-3">
                                    <h3 className="font-medium text-gray-900">
                                        {isReady ? 'Temel Bilgiler' : 'Basic Information'}
                                    </h3>

                                    {property.netArea && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 text-sm">{isReady ? 'Net Alan' : 'Net Area'}:</span>
                                            <span className="font-medium text-sm">{property.netArea} m²</span>
                                        </div>
                                    )}

                                    {property.roomConfiguration?.bathroomCount && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 text-sm">{isReady ? 'Banyo Sayısı' : 'Bathroom Count'}:</span>
                                            <span className="font-medium text-sm">{property.roomConfiguration.bathroomCount}</span>
                                        </div>
                                    )}

                                    {property.monthlyFee && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 text-sm">{isReady ? 'Aidat' : 'Monthly Fee'}:</span>
                                            <span className="font-medium text-sm">{formatPrice(property.monthlyFee)}</span>
                                        </div>
                                    )}

                                    {property.deposit && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 text-sm">{isReady ? 'Depozito' : 'Deposit'}:</span>
                                            <span className="font-medium text-sm">{formatPrice(property.deposit)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Features */}
                                <div className="space-y-3">
                                    <h3 className="font-medium text-gray-900">
                                        {isReady ? t('property-detail.features') : 'Özellikler'}
                                    </h3>

                                    <div className="space-y-2">
                                        {property.elevator && (
                                            <div className="flex items-center text-green-600">
                                                <Briefcase className="w-4 h-4 mr-2" />
                                                <span className="text-sm">{isReady ? 'Asansör' : 'Elevator'}</span>
                                            </div>
                                        )}
                                        {property.parking && (
                                            <div className="flex items-center text-green-600">
                                                <Car className="w-4 h-4 mr-2" />
                                                <span className="text-sm">{isReady ? 'Otopark' : 'Parking'}</span>
                                            </div>
                                        )}
                                        {property.balcony && (
                                            <div className="flex items-center text-green-600">
                                                <Home className="w-4 h-4 mr-2" />
                                                <span className="text-sm">{isReady ? 'Balkon' : 'Balcony'}</span>
                                            </div>
                                        )}
                                        {property.security && (
                                            <div className="flex items-center text-green-600">
                                                <Shield className="w-4 h-4 mr-2" />
                                                <span className="text-sm">{isReady ? 'Güvenlik' : 'Security'}</span>
                                            </div>
                                        )}
                                        {property.furnished && (
                                            <div className="flex items-center text-green-600">
                                                <Coffee className="w-4 h-4 mr-2" />
                                                <span className="text-sm">{isReady ? 'Eşyalı' : 'Furnished'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {property.description && (
                                <div className="mt-6 pt-6 border-t border-gray-200 w-full max-w-full overflow-hidden">
                                    <h3 className="font-medium text-gray-900 mb-3">
                                        {isReady ? t('property-detail.description') : 'Açıklama'}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed break-words overflow-wrap-anywhere whitespace-pre-wrap w-full">
                                        {property.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Comments and Rating Section */}
                    {!isOwner && user && (
                        <div className="bg-gradient-to-br from-white via-slate-50 to-white rounded-xl shadow-lg border border-slate-200/60 p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                                    <MessageCircle className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {isReady ? t('property-detail.comments.title') : 'Yorum ve Değerlendirme'}
                                </h3>
                            </div>

                            {/* Add Comment Form */}
                            <form onSubmit={handleCommentSubmit} className="space-y-6">
                                {/* Rating Section */}
                                <div className="bg-white rounded-lg p-6 border border-slate-200">
                                    <label className="block text-sm font-semibold text-gray-800 mb-4">
                                        {isReady ? 'Değerlendirme' : 'Your Rating'}
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
                                                {newRating}/5 {isReady ? 'Yıldız' : 'Stars'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Comment Section */}
                                <div className="bg-white rounded-lg p-6 border border-slate-200">
                                    <label className="block text-sm font-semibold text-gray-800 mb-4">
                                        {isReady ? t('property-detail.comments.your-comment') : 'Yorumunuz'}
                                    </label>
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                                        placeholder={isReady ? t('property-detail.comments.comment-placeholder') : 'İlan hakkındaki düşüncelerinizi detaylıca paylaşın...'}
                                        required
                                    />
                                    <div className="text-sm text-slate-500 mt-1">
                                        {newComment.length}/1000 {isReady ? t('property-detail.comments.char-count') : 'karakter'} {newComment.length < 10 && `(${isReady ? t('property-detail.comments.min-chars') : 'en az 10 karakter gerekli'})`}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmittingComment || !newComment.trim() || newComment.trim().length < 10}
                                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-500/30 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    <MessageCircle className="w-5 h-5 mr-2" />
                                    {isSubmittingComment
                                        ? (isReady ? t('property-detail.comments.submitting') : 'Gönderiliyor...')
                                        : (isReady ? t('property-detail.comments.submit-comment') : 'Yorum Ekle')
                                    }
                                </button>
                            </form>

                            {/* Comments List */}
                            <div className="mt-10">
                                <div className="flex items-center gap-2 mb-6">
                                    <h4 className="text-lg font-semibold text-gray-900">
                                        {isReady ? t('property-detail.comments.title') : 'Diğer Yorumlar'}
                                    </h4>
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                        {commentsData?.totalElements || 0} {isReady ? 'yorum' : 'yorum'}
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
                                    <div className="space-y-4">
                                        {commentsData.content.map((comment) => (
                                            <div key={comment.id} className="bg-white rounded-lg p-6 border border-slate-200 hover:shadow-md transition-shadow duration-200">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                            <span className="text-white font-semibold text-sm">
                                                                {comment.userFirstName.charAt(0)}{comment.userLastName.charAt(0)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-3">
                                                                <h5 className="text-sm font-semibold text-gray-900">
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
                                                                    <span className="text-xs text-gray-500 ml-1 font-medium">{comment.rating}.0</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-gray-500 font-medium">
                                                                    {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
                                                                </span>
                                                                {user && user.id === comment.userId && (
                                                                    <button
                                                                        onClick={() => handleCommentDelete(comment.id)}
                                                                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                                                                        title={isReady ? t('property-detail.comments.delete') : 'Sil'}
                                                                    >
                                                                        <Trash className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-700 leading-relaxed">
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
                                                {isReady ? 'Henüz yorum bulunmuyor.' : 'No reviews yet.'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Property Owner Link */}
                    {!isOwner && (
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="font-medium text-gray-900 mb-4">
                                {isReady ? 'İlan Sahibi Hakkında' : 'About Property Owner'}
                            </h3>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <UserIcon className="w-8 h-8 text-gray-400" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="font-medium text-gray-900">
                                                {isEncera ? 'Encera' : `${property.owner.firstName} ${property.owner.lastName}`}
                                            </div>
                                            {isEncera && (
                                                <CheckCircle className="w-4 h-4 text-blue-500" />
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {isReady ? 'Gayrimenkul Uzmanı' : 'Real Estate Professional'}
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href={`/profile/${property.owner.id}`}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                                >
                                    {isReady ? 'Profili Görüntüle' : 'View Profile'}
                                </Link>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};