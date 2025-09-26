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
    Trash,
    Flag
} from 'lucide-react';
import Link from 'next/link';
import { PropertyImageGallery } from '@/components/ui/property-image-gallery';
import { ComplaintButton } from '@/components/ui/complaint-button';
import { getProfileUrl, isEnceraUser, ENCERA_CONFIG } from '@/utils/profileHelpers';

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

        if (!user) return;

        if (!newComment.trim() || newComment.trim().length < 10) {
            alert(isReady ? t('property-detail.min-10-chars') : 'En az 10 karakter girmelisiniz.');
            return;
        }

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

    const isEncera = property?.owner ? isEnceraUser(property.owner) || property?.pappSellable : false;

    // Kullanıcının daha önce bu ilana yorum yapıp yapmadığını kontrol et
    const userHasCommented = React.useMemo(() => {
        if (!user || !commentsData?.content) return false;
        return commentsData.content.some(comment => comment.userId === user.id);
    }, [user, commentsData]);

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

    const getHeatingTypeText = (heatingType: string) => {
        if (!isReady) {
            // Fallback Turkish translations when translations are not ready
            const fallbackTranslations: { [key: string]: string } = {
                'none': 'Yok',
                'stove': 'Soba',
                'natural-gas-stove': 'Doğalgaz Sobası',
                'floor-heating': 'Yerden Isıtma',
                'central': 'Merkezi',
                'central-share': 'Merkezi (Pay Ölçer)',
                'combi-natural-gas': 'Kombi (Doğalgaz)',
                'combi-electric': 'Kombi (Elektrikli)',
                'underfloor-heating': 'Yerden Isıtma',
                'air-conditioning': 'Klima',
                'fancoil': 'Fancoil',
                'solar-energy': 'Güneş Enerjisi',
                'electric-radiator': 'Elektrikli Radyatör',
                'geothermal': 'Jeotermal',
                'fireplace': 'Şömine',
                'vrv': 'VRV Sistem',
                'heat-pump': 'Isı Pompası'
            };
            return fallbackTranslations[heatingType] || heatingType;
        }

        return t(`heating.options.${heatingType}`, { defaultValue: heatingType });
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

                        {/* Complaint Button - Tüm kullanıcılar için (ilan sahibi hariç) */}
                        {!isOwner && user && (
                            <ComplaintButton
                                type="PROPERTY"
                                targetId={propertyId}
                                targetTitle={property.title}
                                buttonText="Şikayet Et"
                            />
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
                                        <div className="font-medium text-gray-900 mb-1">{isReady ? t('property-detail.location') : 'Konum'}</div>
                                        <div className="text-gray-600">
                                            {property.neighborhood}, {property.district}, {property.city}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Key Features */}
                            <div className="mb-6 pb-6 border-b border-gray-100">
                                <div className="font-medium text-gray-900 mb-4">{isReady ? t('property-detail.key-features') : 'Temel Özellikler'}</div>
                                <div className="space-y-4">
                                    {property.grossArea && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Square className="w-4 h-4 mr-3 text-gray-400" />
                                                <span className="text-gray-600">{isReady ? t('property-detail.gross-area') : 'Brüt Alan'}</span>
                                            </div>
                                            <span className="font-medium text-gray-900">{property.grossArea} m²</span>
                                        </div>
                                    )}
                                    {property.netArea && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Square className="w-4 h-4 mr-3 text-gray-400" />
                                                <span className="text-gray-600">{isReady ? t('property-detail.net-area') : 'Net Alan'}</span>
                                            </div>
                                            <span className="font-medium text-gray-900">{property.netArea} m²</span>
                                        </div>
                                    )}
                                    {property.roomConfiguration && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Home className="w-4 h-4 mr-3 text-gray-400" />
                                                <span className="text-gray-600">{isReady ? t('property-detail.room-count') : 'Oda Sayısı'}</span>
                                            </div>
                                            <span className="font-medium text-gray-900">
                                                {property.roomConfiguration.roomCount}+{property.roomConfiguration.hallCount}
                                            </span>
                                        </div>
                                    )}
                                    {(property.bathroomCount !== undefined && property.bathroomCount !== null) && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Coffee className="w-4 h-4 mr-3 text-gray-400" />
                                                <span className="text-gray-600">{isReady ? t('property-detail.bathroom-count') : 'Banyo Sayısı'}</span>
                                            </div>
                                            <span className="font-medium text-gray-900">{property.bathroomCount}</span>
                                        </div>
                                    )}
                                    {(property.buildingAge !== undefined && property.buildingAge !== null) && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                                                <span className="text-gray-600">{isReady ? t('property-detail.building-age') : 'Bina Yaşı'}</span>
                                            </div>
                                            <span className="font-medium text-gray-900">{property.buildingAge} {isReady ? t('property-detail.years-old') : 'yıl'}</span>
                                        </div>
                                    )}
                                    {(property.currentFloor !== undefined && property.currentFloor !== null) && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <TrendingUp className="w-4 h-4 mr-3 text-gray-400" />
                                                <span className="text-gray-600">{isReady ? t('property-detail.current-floor') : 'Bulunduğu Kat'}</span>
                                            </div>
                                            <span className="font-medium text-gray-900">{property.currentFloor}. {isReady ? t('property-detail.floor') : 'kat'}</span>
                                        </div>
                                    )}
                                    {(property.totalFloors !== undefined && property.totalFloors !== null) && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <TrendingUp className="w-4 h-4 mr-3 text-gray-400" />
                                                <span className="text-gray-600">{isReady ? t('property-detail.total-floors') : 'Toplam Kat'}</span>
                                            </div>
                                            <span className="font-medium text-gray-900">{property.totalFloors} {isReady ? t('property-detail.floors') : 'kat'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="text-sm text-gray-500">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                        <Eye className="w-4 h-4 mr-2" />
                                        <span>{property.viewCount} {isReady ? t('property-detail.view-count') : 'görüntülenme'}</span>
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
                <div className="mt-8 pt-8 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Contact Details */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-6 text-lg">
                                {isOwner ? (isReady ? t('property-detail.listing-info') : 'İlan Bilgileri') : (isReady ? t('property-detail.contact-info') : 'İletişim Bilgileri')}
                            </h3>

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
                                            {isOwner && (
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                                    {isReady ? t('property-detail.you') : 'Siz'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500">{isReady ? t('property-detail.listing-owner') : 'İlan Sahibi'}</div>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                                        <Phone className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {isEncera ? ENCERA_CONFIG.PHONE : property.owner.phoneNumber || (isReady ? t('property-detail.phone-not-found') : 'Telefon bulunamadı')}
                                        </div>
                                        <div className="text-sm text-gray-500">{isReady ? t('property-detail.phone-number') : 'Telefon Numarası'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-6 text-lg">
                                {isOwner ? (isReady ? t('property-detail.listing-management') : 'İlan Yönetimi') : (isReady ? t('property-detail.get-in-touch') : 'İletişime Geç')}
                            </h3>

                            <div className="space-y-4">
                                {!isOwner ? (
                                    <>
                                        <a
                                            href={`tel:${isEncera ? ENCERA_CONFIG.PHONE : property.owner.phoneNumber}`}
                                            className="w-full inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg"
                                        >
                                            <Phone className="w-4 h-4 mr-2" />
                                            {isReady ? t('property-detail.call-now') : 'Hemen Ara'}
                                        </a>

                                        <Link
                                            href={`/messages?userId=${isEncera ? ENCERA_CONFIG.USER_ID : property.owner.id}&propertyId=${propertyId}`}
                                            className="w-full inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg"
                                        >
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            {isReady ? t('property-detail.send-message') : 'Mesaj Gönder'}
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/my-listings"
                                            className="w-full inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors rounded-lg border border-blue-200"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            {isReady ? t('property-detail.all-my-listings') : 'Tüm İlanlarım'}
                                        </Link>

                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="text-sm text-gray-600">
                                                {isReady ? t('property-detail.owner-note') : 'Bu sizin ilanınız. Düzenlemek veya silmek için yukarıdaki butonları kullanabilirsiniz.'}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Property Details Section */}
                <div className="mt-12 pt-8 border-t border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">{isReady ? t('property-detail.property-details') : 'İlan Detayları'}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Left Column - Basic Info */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-6">{isReady ? t('property-detail.basic-info') : 'Temel Bilgiler'}</h3>
                            <div className="space-y-4">
                                {property.listingType && (
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">{isReady ? t('property-detail.listing-type') : 'İlan Türü'}</span>
                                        <span className="font-medium text-gray-900">{getListingTypeText(property.listingType)}</span>
                                    </div>
                                )}
                                {property.propertyType && (
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">{isReady ? t('property-detail.property-type') : 'Emlak Türü'}</span>
                                        <span className="font-medium text-gray-900">{getPropertyTypeText(property.propertyType)}</span>
                                    </div>
                                )}
                                {property.grossArea && (
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">{isReady ? t('property-detail.gross-area') : 'Brüt Alan'}</span>
                                        <span className="font-medium text-gray-900">{property.grossArea} m²</span>
                                    </div>
                                )}
                                {property.netArea && (
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">{isReady ? t('property-detail.net-area') : 'Net Alan'}</span>
                                        <span className="font-medium text-gray-900">{property.netArea} m²</span>
                                    </div>
                                )}
                                {property.roomConfiguration && (
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">{isReady ? t('property-detail.room-count') : 'Oda Sayısı'}</span>
                                        <span className="font-medium text-gray-900">
                                            {property.roomConfiguration.roomCount}+{property.roomConfiguration.hallCount}
                                        </span>
                                    </div>
                                )}
                                {property.bathroomCount !== undefined && property.bathroomCount !== null && (
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">{isReady ? t('property-detail.bathroom-count') : 'Banyo Sayısı'}</span>
                                        <span className="font-medium text-gray-900">{property.bathroomCount}</span>
                                    </div>
                                )}
                                {property.buildingAge !== undefined && property.buildingAge !== null && (
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">{isReady ? t('property-detail.building-age') : 'Bina Yaşı'}</span>
                                        <span className="font-medium text-gray-900">{property.buildingAge} {isReady ? t('property-detail.years-old') : 'yıl'}</span>
                                    </div>
                                )}
                                {property.totalFloors !== undefined && property.totalFloors !== null && (
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">{isReady ? t('property-detail.total-floors') : 'Toplam Kat Sayısı'}</span>
                                        <span className="font-medium text-gray-900">{property.totalFloors} {isReady ? t('property-detail.floors') : 'kat'}</span>
                                    </div>
                                )}
                                {property.currentFloor !== undefined && property.currentFloor !== null && (
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">{isReady ? t('property-detail.current-floor') : 'Bulunduğu Kat'}</span>
                                        <span className="font-medium text-gray-900">{property.currentFloor}. {isReady ? t('property-detail.floor') : 'kat'}</span>
                                    </div>
                                )}
                                {property.heatingTypes && property.heatingTypes.length > 0 && (
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">{isReady ? t('property-detail.heating-type') : 'Isıtma Türü'}</span>
                                        <span className="font-medium text-gray-900">
                                            {property.heatingTypes.map(getHeatingTypeText).join(', ')}
                                        </span>
                                    </div>
                                )}
                                {property.monthlyFee && property.monthlyFee > 0 && (
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">{isReady ? t('property-detail.monthly-fee') : 'Aidat'}</span>
                                        <span className="font-medium text-gray-900">{formatPrice(property.monthlyFee)}</span>
                                    </div>
                                )}
                                {property.deposit && property.deposit > 0 && (
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">{isReady ? t('property-detail.deposit') : 'Depozito'}</span>
                                        <span className="font-medium text-gray-900">{formatPrice(property.deposit)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Features */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-6">{isReady ? t('property-detail.features') : 'Özellikler'}</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {property.elevator && (
                                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                                        <Briefcase className="w-4 h-4 mr-2 text-green-600" />
                                        <span className="text-sm text-green-800 font-medium">{isReady ? t('property-detail.elevator') : 'Asansör'}</span>
                                    </div>
                                )}
                                {property.parking && (
                                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                                        <Car className="w-4 h-4 mr-2 text-green-600" />
                                        <span className="text-sm text-green-800 font-medium">{isReady ? t('property-detail.parking') : 'Otopark'}</span>
                                    </div>
                                )}
                                {property.balcony && (
                                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                                        <Home className="w-4 h-4 mr-2 text-green-600" />
                                        <span className="text-sm text-green-800 font-medium">{isReady ? t('property-detail.balcony') : 'Balkon'}</span>
                                    </div>
                                )}
                                {property.security && (
                                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                                        <Shield className="w-4 h-4 mr-2 text-green-600" />
                                        <span className="text-sm text-green-800 font-medium">{isReady ? t('property-detail.security') : 'Güvenlik'}</span>
                                    </div>
                                )}
                                {property.furnished && (
                                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                                        <Coffee className="w-4 h-4 mr-2 text-green-600" />
                                        <span className="text-sm text-green-800 font-medium">{isReady ? t('property-detail.furnished') : 'Eşyalı'}</span>
                                    </div>
                                )}
                                {property.featured && (
                                    <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                                        <Star className="w-4 h-4 mr-2 text-yellow-600" />
                                        <span className="text-sm text-yellow-800 font-medium">{isReady ? t('property-detail.vip-listing') : 'VIP İlan'}</span>
                                    </div>
                                )}
                                {property.pappSellable && (
                                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                                        <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                                        <span className="text-sm text-blue-800 font-medium">{isReady ? t('property-detail.encera-guaranteed') : 'Encera Garantili'}</span>
                                    </div>
                                )}
                                {!property.elevator && !property.parking && !property.balcony && !property.security && !property.furnished && !property.featured && !property.pappSellable && (
                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-600">{isReady ? t('property-detail.no-special-features') : 'Özel özellik bulunmuyor'}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {property.description && (
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">{isReady ? t('property-detail.description') : 'Açıklama'}</h3>
                            <div className="bg-gray-50 rounded-lg p-6">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {property.description}
                                </p>
                            </div>
                        </div>
                    )}

                </div>

                {/* Comments and Rating Section */}
                {user && (
                    <div className="mt-12 pt-8 border-t border-gray-100">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                                <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {isReady ? t('property-detail.comments-and-rating') : 'Yorum ve Değerlendirme'}
                            </h2>
                        </div>

                        {/* Add Comment Form or Already Commented Message */}
                        {isOwner ? (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                                <div className="text-blue-600 mb-2 text-lg font-medium">
                                    📝 {isReady ? t('property-detail.owner-cannot-comment') : 'İlan Sahibi'}
                                </div>
                                <p className="text-blue-700 text-sm">
                                    {isReady ? t('property-detail.owner-cannot-comment-desc') : 'Bu sizin ilanınız. Kendi ilanınıza değerlendirme yapamazsınız.'}
                                </p>
                                <p className="text-blue-600 text-xs mt-1">
                                    {isReady ? t('property-detail.owner-can-see-reviews') : 'Aşağıda diğer kullanıcıların değerlendirmelerini görebilirsiniz.'}
                                </p>
                            </div>
                        ) : userHasCommented ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                                <div className="text-green-600 mb-2 text-lg font-medium">
                                    ✓ {isReady ? t('property-detail.evaluation-completed') : 'Değerlendirme Tamamlandı'}
                                </div>
                                <p className="text-green-700 text-sm">
                                    {isReady ? t('property-detail.already-reviewed') : 'Bu ilan hakkında daha önce değerlendirme yapmışsınız.'}
                                </p>
                                <p className="text-green-600 text-xs mt-1">
                                    {isReady ? t('property-detail.one-review-per-listing') : 'Her ilan için sadece bir değerlendirme yapabilirsiniz.'}
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleCommentSubmit} className="space-y-6">
                            {/* Comment Section */}
                            <div className="py-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    {isReady ? t('property-detail.your-comment') : 'Yorumunuz'}
                                </h3>

                                <div className="relative">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none text-sm"
                                        placeholder={isReady ? t('property-detail.comment-placeholder-detail') : 'İlan hakkındaki düşüncelerinizi paylaşın...'}
                                        required
                                        maxLength={1000}
                                    />
                                </div>

                                <div className="flex justify-between items-center mt-2">
                                    {/* Star Rating in bottom left */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setNewRating(star)}
                                                    className="transition-all duration-200 hover:scale-105"
                                                >
                                                    <Star
                                                        className={`w-5 h-5 transition-colors duration-200 ${
                                                            star <= newRating
                                                                ? 'text-amber-400 fill-current'
                                                                : 'text-gray-300 hover:text-amber-300'
                                                        }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>

                                        {/* Rating Display */}
                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                            <span className="font-medium">{newRating}.0</span>
                                            <span>
                                                {newRating === 1 && 'Çok Kötü'}
                                                {newRating === 2 && 'Kötü'}
                                                {newRating === 3 && 'Orta'}
                                                {newRating === 4 && 'İyi'}
                                                {newRating === 5 && 'Mükemmel'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-xs text-gray-500">
                                        {newComment.length}/1000
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-center pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmittingComment || !newComment.trim()}
                                    className="px-5 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    {isSubmittingComment ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>{isReady ? t('property-detail.submitting') : 'Gönderiliyor...'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <MessageCircle className="w-4 h-4" />
                                            <span>{isReady ? t('property-detail.add-comment') : 'Değerlendirmeyi Gönder'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                        )}

                        {/* Clean Comments List */}
                        <div className="mt-12 pt-8 border-t border-gray-100">
                            {/* Comments Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        {isReady ? t('property-detail.other-comments') : 'Diğer Yorumlar'}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {isReady ? t('property-detail.user-experiences') : 'Kullanıcı deneyimleri ve değerlendirmeleri'}
                                    </p>
                                </div>

                                <div className="flex items-center space-x-6 text-sm text-gray-600">
                                    <div className="text-center">
                                        <div className="font-semibold text-gray-900">
                                            {commentsData?.totalElements || 0}
                                        </div>
                                        <div>{isReady ? t('property-detail.comments-count') : 'yorum'}</div>
                                    </div>

                                    {ratingData && ratingData.totalComments > 0 && (
                                        <div className="text-center">
                                            <div className="flex items-center space-x-1 justify-center mb-1">
                                                <Star className="w-4 h-4 text-amber-400 fill-current" />
                                                <span className="font-semibold text-gray-900">
                                                    {ratingData.averageRating.toFixed(1)}
                                                </span>
                                            </div>
                                            <div>ortalama</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {commentsLoading ? (
                                <div className="flex flex-col items-center py-12">
                                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                                    <p className="text-gray-600">Yorumlar yükleniyor...</p>
                                </div>
                            ) : commentsData && commentsData.content.length > 0 ? (
                                <div className="space-y-6">
                                    {commentsData.content.map((comment) => (
                                        <div key={comment.id} className="pb-6 border-b border-gray-100 last:border-b-0">
                                            <div className="flex items-start space-x-4">
                                                {/* Simple Avatar */}
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-semibold text-sm">
                                                            {comment.userFirstName.charAt(0)}{comment.userLastName.charAt(0)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    {/* Header */}
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center space-x-3">
                                                            <h5 className="font-semibold text-gray-900">
                                                                {comment.userFirstName} {comment.userLastName}
                                                            </h5>

                                                            {/* Simple Star Rating */}
                                                            <div className="flex items-center space-x-1">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star
                                                                        key={star}
                                                                        className={`w-4 h-4 ${
                                                                            star <= comment.rating
                                                                                ? 'text-amber-400 fill-current'
                                                                                : 'text-gray-300'
                                                                        }`}
                                                                    />
                                                                ))}
                                                                <span className="text-sm text-gray-500 ml-1">
                                                                    {comment.rating}.0
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center space-x-3">
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

                                                    {/* Comment Content */}
                                                    <div className="mt-2">
                                                        <p className="text-gray-700 leading-relaxed">
                                                            {comment.comment}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center gap-2 text-gray-500">
                                        <MessageCircle className="w-5 h-5" />
                                        <span className="text-sm font-medium">
                                            {isReady ? t('property-detail.no-comments-yet') : 'Henüz yorum bulunmuyor'}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm mt-2">
                                        {isReady ? t('property-detail.be-first-reviewer') : 'Bu ilan hakkında ilk değerlendirmeyi siz yapın!'}
                                    </p>
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
                                    <div className="text-sm text-gray-500">{isReady ? t('property-detail.real-estate-expert') : 'Gayrimenkul Uzmanı'}</div>
                                </div>
                            </div>

                            <Link
                                href={isEncera ? '/profile/1' : getProfileUrl(property.owner)}
                                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                {isReady ? t('property-detail.view-profile') : 'Profili Görüntüle'} →
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};