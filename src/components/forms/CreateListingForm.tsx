// src/components/forms/CreateListingForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LocationSelector } from '@/components/ui/location-selector';
import { Toast } from '@/components/ui/toast';
import { ImageUpload } from '@/components/ui/image-upload';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {selectListingPreviewData, setListingPreviewData} from '@/store/slices/listingPreviewSlice';
import { previewStorage } from '@/utils/previewStorage';
import { useCreatePropertyMutation, useUpdatePropertyMutation, useGetPropertyByIdQuery, PropertyCreateRequest, ListingType, PropertyType, RoomConfiguration, propertyApi } from '@/store/api/propertyApi';
import {
    Home,
    MapPin,
    DollarSign,
    FileText,
    Car,
    ArrowUp,
    Shield,
    Sofa,
    Loader2,
    Crown,
    ChevronDown,
    X,
    Camera
} from 'lucide-react';

interface FormData extends Omit<PropertyCreateRequest, 'roomConfiguration'> {
    roomCount: string;
    hallCount: string;
    negotiable: boolean;
    street?: string;
}

interface ImageData {
    file?: File;
    url?: string;
    isPrimary: boolean;
    preview: string;
}

interface FormErrors {
    [key: string]: string;
}

export const CreateListingForm: React.FC = () => {
    const { t, isReady } = useAppTranslation();
    const [createProperty, { isLoading: isCreating }] = useCreatePropertyMutation();
    const [updateProperty, { isLoading: isUpdating }] = useUpdatePropertyMutation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();

    // Edit mode detection
    const editId = searchParams.get('edit');
    const isEditMode = !!editId;
    
    // Fetch property data for edit mode
    const { data: existingProperty, isLoading: isFetchingProperty, error: fetchError } = useGetPropertyByIdQuery(
        parseInt(editId || '0'), 
        { skip: !isEditMode }
    );

    // Toast state
    const [toast, setToast] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error';
    }>({
        show: false,
        message: '',
        type: 'success'
    });

    const [formData, setFormData] = useState<FormData>({
        title: '',
        listingType: ListingType.SALE,
        propertyType: PropertyType.RESIDENTIAL,
        city: '',
        district: '',
        neighborhood: '',
        street: '',
        price: 0,
        grossArea: undefined,
        netArea: undefined,
        elevator: false,
        parking: false,
        balcony: false,
        security: false,
        description: '',
        furnished: false,
        pappSellable: false,
        negotiable: false,
        roomCount: '',
        hallCount: '',
        monthlyFee: undefined,
        deposit: undefined,
        buildingAge: undefined,
        totalFloors: undefined,
        currentFloor: undefined,
        heatingTypes: [],
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [heatingDropdownOpen, setHeatingDropdownOpen] = useState(false);
    const [images, setImages] = useState<ImageData[]>([]);

    // Heating options
    const heatingOptions = [
        'none', 'stove', 'natural-gas-stove', 'floor-heating', 'central', 
        'central-share', 'combi-natural-gas', 'combi-electric', 'underfloor-heating', 
        'air-conditioning', 'fancoil', 'solar-energy', 'electric-radiator', 
        'geothermal', 'fireplace', 'vrv', 'heat-pump'
    ];

    const previewData = useAppSelector(selectListingPreviewData);

    React.useEffect(() => {
        if (previewData) {
            setFormData({
                title: previewData.title,
                listingType: previewData.listingType,
                propertyType: previewData.propertyType,
                city: previewData.city,
                district: previewData.district,
                neighborhood: previewData.neighborhood,
                street: (previewData as any).street || '',
                price: previewData.price,
                grossArea: previewData.grossArea,
                netArea: previewData.netArea,
                elevator: previewData.elevator || false,
                parking: previewData.parking || false,
                balcony: previewData.balcony || false,
                security: previewData.security || false,
                description: previewData.description || '',
                furnished: previewData.furnished || false,
                pappSellable: previewData.pappSellable || false,
                negotiable: previewData.negotiable || false,
                roomCount: previewData.roomConfiguration?.roomCount?.toString() || '',
                hallCount: (previewData.roomConfiguration as any)?.hallCount?.toString() || previewData.roomConfiguration?.hallCount?.toString() || '',
                monthlyFee: previewData.monthlyFee,
                deposit: previewData.deposit,
                buildingAge: previewData.buildingAge,
                totalFloors: previewData.totalFloors,
                currentFloor: previewData.currentFloor,
                heatingTypes: previewData.heatingTypes || [],
            });

            // Storage'dan image verilerini yükle (File objelerle birlikte)
            const storageData = previewStorage.load();
            if (storageData && storageData.images.length > 0) {
                const imageData: ImageData[] = storageData.images.map(img => ({
                    file: img.file,
                    url: img.url,
                    isPrimary: img.isPrimary,
                    preview: img.preview
                }));
                setImages(imageData);
            } else if (previewData.imageUrls && previewData.imageUrls.length > 0) {
                // Fallback - sadece URL'ler varsa
                const imageData: ImageData[] = previewData.imageUrls.map(url => ({
                    url,
                    isPrimary: url === previewData.primaryImageUrl,
                    preview: url
                }));
                setImages(imageData);
            }
        }
    }, [previewData]);

    // Load existing property data for edit mode
    React.useEffect(() => {
        if (existingProperty && isEditMode && !previewData) {
            setFormData({
                title: existingProperty.title,
                listingType: existingProperty.listingType,
                propertyType: existingProperty.propertyType,
                city: existingProperty.city,
                district: existingProperty.district,
                neighborhood: existingProperty.neighborhood,
                street: (existingProperty as any).street || '',
                price: existingProperty.price,
                grossArea: existingProperty.grossArea,
                netArea: existingProperty.netArea,
                elevator: existingProperty.elevator,
                parking: existingProperty.parking,
                balcony: existingProperty.balcony,
                security: existingProperty.security,
                description: existingProperty.description || '',
                furnished: existingProperty.furnished,
                pappSellable: existingProperty.pappSellable,
                negotiable: existingProperty.negotiable || false,
                roomCount: existingProperty.roomConfiguration?.roomCount?.toString() || '',
                hallCount: (existingProperty.roomConfiguration as any)?.hallCount?.toString() || existingProperty.roomConfiguration?.hallCount?.toString() || '',
                monthlyFee: existingProperty.monthlyFee,
                deposit: existingProperty.deposit,
                buildingAge: existingProperty.buildingAge,
                totalFloors: existingProperty.totalFloors,
                currentFloor: existingProperty.currentFloor,
                heatingTypes: existingProperty.heatingTypes || [],
            });

            // Set images from existing property
            if (existingProperty.imageUrls && existingProperty.imageUrls.length > 0) {
                const imageData: ImageData[] = existingProperty.imageUrls.map(url => ({
                    url,
                    isPrimary: url === existingProperty.primaryImageUrl,
                    preview: url
                }));
                setImages(imageData);
            }
        }
    }, [existingProperty, isEditMode, previewData]);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('[data-dropdown-container]')) {
                setHeatingDropdownOpen(false);
            }
        };

        if (heatingDropdownOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [heatingDropdownOpen]);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ show: true, message, type });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, show: false }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (['grossArea', 'netArea', 'price', 'monthlyFee', 'deposit', 'buildingAge', 'totalFloors', 'currentFloor', 'roomCount', 'hallCount'].includes(name)) {
            setFormData(prev => ({ ...prev, [name]: value !== '' ? (isNaN(Number(value)) ? '' : Number(value)) : '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Property type değiştiğinde ilgili alanları temizle
        if (name === 'propertyType') {
            setFormData(prev => {
                const newData = { ...prev, [name]: value as PropertyType };

                // Arsa seçildiğinde bu alanları temizle
                if (value === PropertyType.LAND) {
                    newData.roomCount = '';
                    newData.hallCount = '';
                    newData.buildingAge = undefined;
                    newData.totalFloors = undefined;
                    newData.currentFloor = undefined;
                    newData.monthlyFee = undefined;
                    newData.elevator = false;
                    newData.balcony = false;
                    newData.furnished = false;
                    newData.heatingTypes = [];
                }
                // İş yeri seçildiğinde bu alanları temizle
                else if (value === PropertyType.COMMERCIAL) {
                    newData.roomCount = '';
                    newData.hallCount = '';
                    newData.furnished = false;
                }

                return newData;
            });
        }

        // Listing type değiştiğinde ilgili alanları temizle
        if (name === 'listingType') {
            setFormData(prev => {
                const newData = { ...prev, [name]: value as ListingType };

                // Satılık seçildiğinde aidat ve depozito temizle
                if (value === ListingType.SALE) {
                    if (prev.propertyType === PropertyType.RESIDENTIAL) {
                        newData.monthlyFee = undefined;
                    }
                    newData.deposit = undefined;
                }

                return newData;
            });
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleLocationChange = (location: { city: string; district: string; neighborhood: string; street?: string }) => {
        setFormData(prev => ({
            ...prev,
            city: location.city,
            district: location.district,
            neighborhood: location.neighborhood,
            street: location.street || prev.street,
            // Ankara dışında bir il seçilirse pappSellable'ı sıfırla
            pappSellable: location.city === 'Ankara' ? prev.pappSellable : false
        }));

        // Clear location errors
        setErrors(prev => ({
            ...prev,
            city: '',
            district: '',
            neighborhood: ''
        }));
    };

    const handleHeatingToggle = (heatingType: string) => {
        setFormData(prev => ({
            ...prev,
            heatingTypes: prev.heatingTypes?.includes(heatingType)
                ? prev.heatingTypes.filter(type => type !== heatingType)
                : [...(prev.heatingTypes || []), heatingType]
        }));
    };

    const handleFeatureToggle = (featureName: string, condition: boolean = true) => {
        if (!condition) return;

        // Özelliği direkt toggle et
        setFormData(prev => ({
            ...prev,
            [featureName]: !prev[featureName as keyof typeof prev]
        }));
    };

    const removeHeatingType = (heatingType: string) => {
        setFormData(prev => ({
            ...prev,
            heatingTypes: prev.heatingTypes?.filter(type => type !== heatingType) || []
        }));
    };

    const handleImagesChange = React.useCallback((newImages: ImageData[]) => {
        setImages(newImages);
    }, []);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = isReady ? t('common.error') : 'Bu alan zorunludur';
        }

        if (!formData.city) {
            newErrors.city = isReady ? t('common.error') : 'Bu alan zorunludur';
        }

        if (!formData.district) {
            newErrors.district = isReady ? t('common.error') : 'Bu alan zorunludur';
        }

        if (!formData.neighborhood) {
            newErrors.neighborhood = isReady ? t('common.error') : 'Bu alan zorunludur';
        }

        if (!formData.price || formData.price <= 0) {
            newErrors.price = isReady ? t('common.error') : 'Bu alan zorunludur';
        }

        if (!formData.description?.trim()) {
            newErrors.description = isReady ? t('common.error') : 'Bu alan zorunludur';
        }

        if (!formData.grossArea || formData.grossArea <= 0) {
            newErrors.grossArea = isReady ? t('common.error') : 'Bu alan zorunludur';
        }

        if (!formData.netArea || formData.netArea <= 0) {
            newErrors.netArea = isReady ? t('common.error') : 'Bu alan zorunludur';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            // Validation error toast
            showToast(
                isReady ? t('listing.create.validation-error') : 'Lütfen tüm zorunlu alanları doldurun.',
                'error'
            );
            return;
        }

        // Form verisini hazırla
        const roomConfiguration: RoomConfiguration | undefined =
            formData.roomCount && formData.hallCount
                ? { 
                    roomCount: Number(formData.roomCount), 
                    hallCount: Number(formData.hallCount),
                    bathroomCount: existingProperty?.roomConfiguration?.bathroomCount || 1
                  }
                : undefined;

        const submitData: PropertyCreateRequest = {
            title: formData.title,
            listingType: formData.listingType,
            propertyType: formData.propertyType,
            city: formData.city,
            district: formData.district,
            neighborhood: formData.neighborhood,
            street: formData.street,
            price: formData.price,
            grossArea: formData.grossArea,
            netArea: formData.netArea,
            elevator: formData.elevator,
            parking: formData.parking,
            balcony: formData.balcony,
            security: formData.security,
            description: formData.description,
            furnished: formData.furnished,
            pappSellable: formData.pappSellable,
            negotiable: formData.negotiable,
            roomConfiguration,
            monthlyFee: formData.monthlyFee,
            deposit: formData.listingType === ListingType.SALE ? undefined : formData.deposit,
            buildingAge: formData.buildingAge,
            totalFloors: formData.totalFloors,
            currentFloor: formData.currentFloor,
            heatingTypes: formData.heatingTypes,
            imageUrls: images.filter(img => img.url).map(img => img.url!),
            primaryImageUrl: images.find(img => img.isPrimary)?.url,
        };

        if (isEditMode && editId) {
            // Edit mode - update existing property
            try {
                // Force property to pending status when edited
                // Also set active: true because editing reactivates the property
                const editSubmitData = {
                    ...submitData,
                    approved: false,
                    active: !existingProperty?.active ? true : existingProperty.active
                };
                
                await updateProperty({ 
                    id: parseInt(editId), 
                    data: editSubmitData 
                }).unwrap();
                
                // Force complete cache refresh for user properties
                dispatch(propertyApi.util.invalidateTags([
                    'UserProperty', 
                    'PropertyStats', 
                    'Property',
                    { type: 'UserProperty', id: 'LIST' }
                ]));
                
                // Also refetch user properties specifically
                dispatch(propertyApi.endpoints.getUserProperties.initiate({}, { forceRefetch: true }));
                
                showToast(
                    isReady ? t('listing.update.success') : 'İlan başarıyla güncellendi!',
                    'success'
                );
                
                // Redirect to my listings after successful update
                setTimeout(() => {
                    router.push('/my-listings');
                }, 1500);
            } catch (error) {
                showToast(
                    isReady ? t('listing.update.error') : 'İlan güncellenirken bir hata oluştu.',
                    'error'
                );
            }
        } else {
            // Create mode - File objelerini ayrı storage'da tut
            previewStorage.save(submitData, images);

            // Redux'a sadece serialize edilebilir veriyi kaydet
            dispatch(setListingPreviewData(submitData));

            // Preview sayfasına yönlendir
            router.push('/listing-preview');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-none lg:max-w-7xl mx-auto p-4 lg:p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Home className="w-8 h-8 mr-3 text-blue-600" />
                        {isEditMode
                            ? (isReady ? t('listing.edit.title') : 'İlan Düzenle')
                            : (isReady ? t('listing.create.title') : 'İlan Ver')
                        }
                    </h1>
                    <p className="text-gray-600 mt-2 ml-11">
                        {isEditMode
                            ? (isReady ? t('listing.edit.loading') : 'İlan bilgilerinizi düzenleyip güncelleyebilirsiniz')
                            : (isReady ? t('listing.create.create-listing-title') : 'Emlak ilanınızı oluşturun ve yayınlayın')
                        }
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Temel Bilgiler */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
                            <FileText className="w-6 h-6 mr-3 text-blue-600" />
                            {isReady ? t('listing.create.basic-info') : 'Temel Bilgiler'}
                        </h2>
                        <div className="bg-gray-50 rounded-lg p-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                            {/* İlan Başlığı */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    {isReady ? t('listing.create.listing-title') : 'İlan Başlığı'}<span className="text-black font-bold">(*)</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder={isReady ? t('listing.create.listing-title-placeholder') : 'Örn: Merkezi konumda satılık 3+1 daire'}
                                    maxLength={255}
                                    className={`w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.title ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                <div className="mt-1">
                                    <p className={`text-xs ${formData.title.length > 230 ? 'text-red-500' : formData.title.length > 200 ? 'text-yellow-500' : 'text-gray-500'}`}>
                                        {formData.title.length}/255
                                    </p>
                                    {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                                </div>
                            </div>

                            {/* İlan Tipi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    {isReady ? t('listing.create.listing-type') : 'İlan Tipi'}
                                </label>
                                <select
                                    name="listingType"
                                    value={formData.listingType}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value={ListingType.SALE}>
                                        {isReady ? t('common.sale') : 'Satılık'}
                                    </option>
                                    <option value={ListingType.RENT}>
                                        {isReady ? t('common.rent') : 'Kiralık'}
                                    </option>
                                </select>
                            </div>

                            {/* Emlak Tipi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    {isReady ? t('listing.create.property-type') : 'Emlak Tipi'}
                                </label>
                                <select
                                    name="propertyType"
                                    value={formData.propertyType}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value={PropertyType.RESIDENTIAL}>
                                        {isReady ? t('common.residential') : 'Konut'}
                                    </option>
                                    <option value={PropertyType.COMMERCIAL}>
                                        {isReady ? t('common.commercial') : 'İş Yeri'}
                                    </option>
                                    <option value={PropertyType.LAND}>
                                        {isReady ? t('common.land') : 'Arsa'}
                                    </option>
                                </select>
                            </div>
                        </div>
                        </div>
                    </div>

                    {/* Konum */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
                            <MapPin className="w-6 h-6 mr-3 text-blue-600" />
                            {isReady ? t('listing.location') : 'Konum'}
                        </h2>
                        <div className="bg-gray-50 rounded-lg p-6">

                            <LocationSelector
                                selectedCity={formData.city}
                                selectedDistrict={formData.district}
                                selectedNeighborhood={formData.neighborhood}
                                selectedStreet={formData.street}
                                onLocationChange={handleLocationChange}
                                errors={{
                                    city: errors.city,
                                    district: errors.district,
                                    neighborhood: errors.neighborhood,
                                }}
                                disabled={isFetchingProperty || isCreating || isUpdating}
                            />
                        </div>
                    </div>

                    {/* İlan Detayları */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
                            <Home className="w-6 h-6 mr-3 text-blue-600" />
                            {isReady ? t('listing.create.property-details') : 'İlan Detayları'}
                        </h2>
                        <div className="bg-gray-50 rounded-lg p-6">

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                            {/* Brüt Alan */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    {isReady ? t('listing.create.gross-area') : 'Brüt Alan (m²)'}<span className="text-black font-bold">(*)</span>
                                </label>
                                <input
                                    type="text"
                                    name="grossArea"
                                    value={formData.grossArea !== undefined && formData.grossArea !== null ? formData.grossArea : ''}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.grossArea ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.grossArea && <p className="mt-1 text-sm text-red-600">{errors.grossArea}</p>}
                            </div>

                            {/* Net Alan */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    {isReady ? t('listing.create.net-area') : 'Net Alan (m²)'}<span className="text-black font-bold">(*)</span>
                                </label>
                                <input
                                    type="text"
                                    name="netArea"
                                    value={formData.netArea !== undefined && formData.netArea !== null ? formData.netArea : ''}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.netArea ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.netArea && <p className="mt-1 text-sm text-red-600">{errors.netArea}</p>}
                            </div>

                            {/* Oda Sayısı - Konut için aktif */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${formData.propertyType !== PropertyType.RESIDENTIAL ? 'text-gray-400' : 'text-gray-900'}`}>
                                    {isReady ? t('listing.create.room-config') : 'Oda + Salon'}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="roomCount"
                                        value={formData.propertyType !== PropertyType.RESIDENTIAL ? '' : (formData.roomCount !== undefined && formData.roomCount !== null ? formData.roomCount : '')}
                                        onChange={handleInputChange}
                                        placeholder={isReady ? t('listing.create.room-placeholder') : 'Oda'}
                                        disabled={formData.propertyType !== PropertyType.RESIDENTIAL}
                                        className={`w-1/2 px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            formData.propertyType !== PropertyType.RESIDENTIAL
                                                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                                : 'border-gray-300 bg-white'
                                        }`}
                                    />
                                    <span className={`flex items-center ${formData.propertyType !== PropertyType.RESIDENTIAL ? 'text-gray-400' : 'text-gray-500'}`}>+</span>
                                    <input
                                        type="text"
                                        name="hallCount"
                                        value={formData.propertyType !== PropertyType.RESIDENTIAL ? '' : (formData.hallCount !== undefined && formData.hallCount !== null ? formData.hallCount : '')}
                                        onChange={handleInputChange}
                                        placeholder={isReady ? t('listing.create.living-room-placeholder') : 'Salon'}
                                        disabled={formData.propertyType !== PropertyType.RESIDENTIAL}
                                        className={`w-1/2 px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            formData.propertyType !== PropertyType.RESIDENTIAL
                                                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                                : 'border-gray-300 bg-white'
                                        }`}
                                    />
                                </div>
                                {formData.propertyType !== PropertyType.RESIDENTIAL && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        {formData.propertyType === PropertyType.COMMERCIAL
                                            ? 'İş yeri için uygulanmaz.'
                                            : 'Arsa için uygulanmaz.'}
                                    </p>
                                )}
                            </div>

                            {/* Bina Yaşı - Arsa için deaktif */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${formData.propertyType === PropertyType.LAND ? 'text-gray-400' : 'text-gray-900'}`}>
                                    {isReady ? t('listing.create.building-age') : 'Bina Yaşı'}
                                </label>
                                <input
                                    type="text"
                                    name="buildingAge"
                                    value={formData.propertyType === PropertyType.LAND ? '' : (formData.buildingAge !== undefined && formData.buildingAge !== null ? formData.buildingAge : '')}
                                    onChange={handleInputChange}
                                    disabled={formData.propertyType === PropertyType.LAND}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        formData.propertyType === PropertyType.LAND
                                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                            : 'border-gray-300 bg-white'
                                    }`}
                                />
                                {formData.propertyType === PropertyType.LAND && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Arsa için uygulanmaz.
                                    </p>
                                )}
                            </div>

                            {/* Kat Sayısı - Arsa için deaktif */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${formData.propertyType === PropertyType.LAND ? 'text-gray-400' : 'text-gray-900'}`}>
                                    {isReady ? t('listing.create.total-floors') : 'Kat Sayısı'}
                                </label>
                                <input
                                    type="text"
                                    name="totalFloors"
                                    value={formData.propertyType === PropertyType.LAND ? '' : (formData.totalFloors !== undefined && formData.totalFloors !== null ? formData.totalFloors : '')}
                                    onChange={handleInputChange}
                                    disabled={formData.propertyType === PropertyType.LAND}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        formData.propertyType === PropertyType.LAND
                                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                            : 'border-gray-300 bg-white'
                                    }`}
                                />
                                {formData.propertyType === PropertyType.LAND && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Arsa için uygulanmaz.
                                    </p>
                                )}
                            </div>

                            {/* Bulunduğu Kat - Arsa için deaktif */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${formData.propertyType === PropertyType.LAND ? 'text-gray-400' : 'text-gray-900'}`}>
                                    {isReady ? t('listing.create.current-floor') : 'Bulunduğu Kat'}
                                </label>
                                <input
                                    type="text"
                                    name="currentFloor"
                                    value={formData.propertyType === PropertyType.LAND ? '' : (formData.currentFloor !== undefined && formData.currentFloor !== null ? formData.currentFloor : '')}
                                    onChange={handleInputChange}
                                    disabled={formData.propertyType === PropertyType.LAND}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        formData.propertyType === PropertyType.LAND
                                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                            : 'border-gray-300 bg-white'
                                    }`}
                                />
                                {formData.propertyType === PropertyType.LAND && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Arsa için uygulanmaz.
                                    </p>
                                )}
                            </div>
                        </div>
                        </div>
                    </div>

                    {/* Fiyat Bilgileri */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
                            <DollarSign className="w-6 h-6 mr-3 text-blue-600" />
                            {isReady ? t('listing.create.pricing') : 'Fiyat Bilgileri'}
                        </h2>
                        <div className="bg-gray-50 rounded-lg p-6">

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                            {/* Fiyat */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    {isReady ? t('listing.create.price-label') : 'Fiyat'} ({isReady ? t('listing.create.currency') : 'TL'})<span className="text-black font-bold">(*)</span>
                                </label>
                                <input
                                    type="text"
                                    name="price"
                                    value={formData.price !== undefined && formData.price !== null ? formData.price : ''}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.price ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                            </div>

                            {/* Aidat - Arsa için veya satılık konut için deaktif */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    formData.propertyType === PropertyType.LAND ||
                                    (formData.propertyType === PropertyType.RESIDENTIAL && formData.listingType === ListingType.SALE)
                                        ? 'text-gray-400' : 'text-gray-900'
                                }`}>
                                    {isReady ? t('listing.create.monthly-fee') : 'Aidat'} ({isReady ? t('listing.create.currency') : 'TL'})
                                </label>
                                <input
                                    type="text"
                                    name="monthlyFee"
                                    value={
                                        formData.propertyType === PropertyType.LAND ||
                                        (formData.propertyType === PropertyType.RESIDENTIAL && formData.listingType === ListingType.SALE)
                                            ? '' : (formData.monthlyFee !== undefined && formData.monthlyFee !== null ? formData.monthlyFee : '')
                                    }
                                    onChange={handleInputChange}
                                    disabled={
                                        formData.propertyType === PropertyType.LAND ||
                                        (formData.propertyType === PropertyType.RESIDENTIAL && formData.listingType === ListingType.SALE)
                                    }
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        formData.propertyType === PropertyType.LAND ||
                                        (formData.propertyType === PropertyType.RESIDENTIAL && formData.listingType === ListingType.SALE)
                                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                            : 'border-gray-300 bg-white'
                                    }`}
                                />
                                {(formData.propertyType === PropertyType.LAND ||
                                  (formData.propertyType === PropertyType.RESIDENTIAL && formData.listingType === ListingType.SALE)) && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        {formData.propertyType === PropertyType.LAND
                                            ? (isReady ? t('listing.create.monthly-fee-land-note') : 'Arsa için uygulanmaz.')
                                            : (isReady ? t('listing.create.monthly-fee-sale-note') : 'Satılık konut için uygulanmaz.')}
                                    </p>
                                )}
                            </div>

                            {/* Depozito - Satılık ise deaktif */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${formData.listingType === ListingType.SALE ? 'text-gray-400' : 'text-gray-900'}`}>
                                    {isReady ? t('listing.create.deposit') : 'Depozito'} ({isReady ? t('listing.create.currency') : 'TL'})
                                </label>
                                <input
                                    type="text"
                                    name="deposit"
                                    value={formData.listingType === ListingType.SALE ? '' : (formData.deposit !== undefined && formData.deposit !== null ? formData.deposit : '')}
                                    onChange={handleInputChange}
                                    disabled={formData.listingType === ListingType.SALE}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        formData.listingType === ListingType.SALE 
                                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' 
                                            : 'border-gray-300 bg-white'
                                    }`}
                                />
                                {formData.listingType === ListingType.SALE && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        {isReady ? t('listing.create.deposit-sale-note') : 'Satılık ilanlar için depozito gerekli değildir.'}
                                    </p>
                                )}
                            </div>
                        </div>

                        </div>
                    </div>

                    {/* Özellikler */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
                            <Home className="w-6 h-6 mr-3 text-blue-600" />
                            {isReady ? t('listing.create.amenities') : 'Özellikler'}
                        </h2>
                        <div className="bg-gray-50 rounded-lg p-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                            {/* Asansör - Arsa için deaktif */}
                            <div
                                className={`flex items-center p-4 border border-gray-200 rounded-lg ${formData.propertyType === PropertyType.LAND ? 'bg-gray-50 cursor-not-allowed' : 'bg-white hover:bg-gray-50 cursor-pointer'}`}
                                onClick={() => handleFeatureToggle('elevator', formData.propertyType !== PropertyType.LAND)}
                            >
                                <input
                                    type="checkbox"
                                    id="elevator"
                                    name="elevator"
                                    checked={Boolean(formData.propertyType === PropertyType.LAND ? false : Boolean(formData.elevator))}
                                    onChange={handleInputChange}
                                    disabled={formData.propertyType === PropertyType.LAND}
                                    className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 pointer-events-none ${formData.propertyType === PropertyType.LAND ? 'cursor-not-allowed opacity-50' : ''}`}
                                />
                                <label htmlFor="elevator" className={`ml-3 flex items-center text-sm pointer-events-none ${formData.propertyType === PropertyType.LAND ? 'text-gray-400' : 'text-gray-900'}`}>
                                    <ArrowUp className={`w-4 h-4 mr-2 ${formData.propertyType === PropertyType.LAND ? 'text-gray-400' : 'text-gray-600'}`} />
                                    {isReady ? t('listing.create.elevator') : 'Asansör'}
                                </label>
                            </div>

                            {/* Otopark */}
                            <div
                                className="flex items-center p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleFeatureToggle('parking')}
                            >
                                <input
                                    type="checkbox"
                                    id="parking"
                                    name="parking"
                                    checked={Boolean(formData.parking)}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 pointer-events-none"
                                />
                                <label htmlFor="parking" className="ml-3 flex items-center text-sm text-gray-900 pointer-events-none">
                                    <Car className="w-4 h-4 mr-2 text-gray-600" />
                                    {isReady ? t('listing.create.parking') : 'Otopark'}
                                </label>
                            </div>

                            {/* Balkon - Arsa için deaktif */}
                            <div
                                className={`flex items-center p-4 border border-gray-200 rounded-lg ${formData.propertyType === PropertyType.LAND ? 'bg-gray-50 cursor-not-allowed' : 'bg-white hover:bg-gray-50 cursor-pointer'}`}
                                onClick={() => handleFeatureToggle('balcony', formData.propertyType !== PropertyType.LAND)}
                            >
                                <input
                                    type="checkbox"
                                    id="balcony"
                                    name="balcony"
                                    checked={Boolean(formData.propertyType === PropertyType.LAND ? false : formData.balcony)}
                                    onChange={handleInputChange}
                                    disabled={formData.propertyType === PropertyType.LAND}
                                    className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${formData.propertyType === PropertyType.LAND ? 'cursor-not-allowed opacity-50' : ''}`}
                                />
                                <label htmlFor="balcony" className={`ml-3 flex items-center text-sm pointer-events-none ${formData.propertyType === PropertyType.LAND ? 'text-gray-400' : 'text-gray-900'}`}>
                                    <Home className={`w-4 h-4 mr-2 ${formData.propertyType === PropertyType.LAND ? 'text-gray-400' : 'text-gray-600'}`} />
                                    {isReady ? t('listing.create.balcony') : 'Balkon'}
                                </label>
                            </div>

                            {/* Güvenlik */}
                            <div
                                className="flex items-center p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleFeatureToggle('security')}
                            >
                                <input
                                    type="checkbox"
                                    id="security"
                                    name="security"
                                    checked={Boolean(formData.security)}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 pointer-events-none"
                                />
                                <label htmlFor="security" className="ml-3 flex items-center text-sm text-gray-900 pointer-events-none">
                                    <Shield className="w-4 h-4 mr-2 text-gray-600" />
                                    {isReady ? t('listing.create.security') : 'Güvenlik'}
                                </label>
                            </div>

                            {/* Eşyalı - Arsa ve işyeri için deaktif */}
                            <div
                                className={`flex items-center p-4 border border-gray-200 rounded-lg ${formData.propertyType !== PropertyType.RESIDENTIAL ? 'bg-gray-50 cursor-not-allowed' : 'bg-white hover:bg-gray-50 cursor-pointer'}`}
                                onClick={() => handleFeatureToggle('furnished', formData.propertyType === PropertyType.RESIDENTIAL)}
                            >
                                <input
                                    type="checkbox"
                                    id="furnished"
                                    name="furnished"
                                    checked={Boolean(formData.propertyType !== PropertyType.RESIDENTIAL ? false : formData.furnished)}
                                    onChange={handleInputChange}
                                    disabled={formData.propertyType !== PropertyType.RESIDENTIAL}
                                    className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${formData.propertyType !== PropertyType.RESIDENTIAL ? 'cursor-not-allowed opacity-50' : ''}`}
                                />
                                <label htmlFor="furnished" className={`ml-3 flex items-center text-sm pointer-events-none ${formData.propertyType !== PropertyType.RESIDENTIAL ? 'text-gray-400' : 'text-gray-900'}`}>
                                    <Sofa className={`w-4 h-4 mr-2 ${formData.propertyType !== PropertyType.RESIDENTIAL ? 'text-gray-400' : 'text-gray-600'}`} />
                                    {isReady ? t('listing.create.furnished') : 'Eşyalı'}
                                </label>
                            </div>

                            {/* Isıtma - Çoklu Seçim - Arsa için deaktif */}
                            <div className="md:col-span-3">
                                <label className={`block text-sm font-medium mb-2 ${formData.propertyType === PropertyType.LAND ? 'text-gray-400' : 'text-gray-900'}`}>
                                    {isReady ? t('listing.create.heating-types') : 'Isıtma'}
                                </label>
                                <div className="relative" data-dropdown-container>
                                    <button
                                        type="button"
                                        onClick={() => formData.propertyType !== PropertyType.LAND && setHeatingDropdownOpen(!heatingDropdownOpen)}
                                        disabled={formData.propertyType === PropertyType.LAND}
                                        className={`w-full px-4 py-3 border rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between ${
                                            formData.propertyType === PropertyType.LAND
                                                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                                : 'border-gray-300 bg-white'
                                        }`}
                                    >
                                        <span className={formData.propertyType === PropertyType.LAND ? 'text-gray-400' : 'text-gray-500'}>
                                            {formData.propertyType === PropertyType.LAND
                                                ? 'Arsa için uygulanmaz'
                                                : (formData.heatingTypes && formData.heatingTypes.length > 0
                                                    ? `${formData.heatingTypes.length} ${isReady ? t('listing.create.items-selected') : 'seçim yapıldı'}`
                                                    : (isReady ? t('listing.create.heating-placeholder') : 'Isıtma türlerini seçiniz'))
                                            }
                                        </span>
                                        <ChevronDown className={`w-5 h-5 ${formData.propertyType === PropertyType.LAND ? 'text-gray-400' : 'text-gray-400'}`} />
                                    </button>

                                    {heatingDropdownOpen && formData.propertyType !== PropertyType.LAND && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {heatingOptions.map((option) => (
                                                <label
                                                    key={option}
                                                    className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(formData.heatingTypes?.includes(option) || false)}
                                                        onChange={() => handleHeatingToggle(option)}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                                                    />
                                                    <span className="text-sm text-gray-900">
                                                        {isReady ? t(`heating.options.${option}`) : option}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Selected heating types display - Sadece arsa değilse göster */}
                                {formData.heatingTypes && formData.heatingTypes.length > 0 && formData.propertyType !== PropertyType.LAND && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {formData.heatingTypes.map((type) => (
                                            <span
                                                key={type}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                            >
                                                {isReady ? t(`heating.options.${type}`) : type}
                                                <button
                                                    type="button"
                                                    onClick={() => removeHeatingType(type)}
                                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        </div>
                    </div>

                    {/* Ençera Premium - Sadece Ankara seçildiğinde görünür */}
                    {formData.city === 'Ankara' && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
                                <Crown className="w-6 h-6 mr-3 text-yellow-600" />
                                {isReady ? t('listing.create.encera-premium') : 'Ençera Premium'}
                            </h2>

                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="pappSellable"
                                        name="pappSellable"
                                        checked={Boolean(formData.pappSellable)}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 text-yellow-600 border-yellow-300 rounded focus:ring-yellow-500"
                                    />
                                    <label htmlFor="pappSellable" className="ml-4 flex items-center text-base font-medium text-gray-900 pointer-events-none">
                                        {isReady ? t('listing.create.encera-sellable') : 'Ençera ile satılsın'}
                                    </label>
                                </div>
                                <p className="mt-2 ml-9 text-sm text-gray-600">
                                    {isReady ? t('listing.create.encera-sellable-description') : 'İlanınızı Ençera üzerinden satış sürecinde profesyonel destek alabilirsiniz.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Fotoğraflar */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
                            <Camera className="w-6 h-6 mr-3 text-blue-600" />
                            {isReady ? t('listing.create.photos') : 'Fotoğraflar'}
                        </h2>
                        <div className="bg-gray-50 rounded-lg p-6">

                            <ImageUpload
                                maxImages={15}
                                onImagesChange={handleImagesChange}
                                disabled={isFetchingProperty || isCreating || isUpdating}
                                initialImages={images.map(img => ({ url: img.preview, isPrimary: img.isPrimary }))}
                                previewMode={true}
                            />
                        </div>
                    </div>

                    {/* Açıklama */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
                            <FileText className="w-6 h-6 mr-3 text-blue-600" />
                            {isReady ? t('listing.create.description') : 'Açıklama'}<span className="text-black font-bold">(*)</span>
                        </h2>
                        <div className="bg-gray-50 rounded-lg p-6">
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={6}
                                placeholder={isReady ? t('listing.create.description-placeholder') : 'İlan açıklamanızı detaylı bir şekilde yazınız...'}
                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                                    errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-8">
                        <Button
                            type="submit"
                            disabled={isFetchingProperty || isCreating || isUpdating}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg"
                        >
                            {(isCreating || isUpdating) ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    {isEditMode
                                        ? (isReady ? t('listing.update.submitting') : 'İlan güncelleniyor...')
                                        : (isReady ? t('listing.create.submitting') : 'İlan yayınlanıyor...')
                                    }
                                </>
                            ) : isFetchingProperty ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    {isReady ? t('listing.edit.loading') : 'İlan yükleniyor...'}
                                </>
                            ) : (
                                isEditMode
                                    ? (isReady ? t('listing.update.submit') : 'İlanı Güncelle')
                                    : (isReady ? t('listing.create.submit') : 'İlanı Yayınla')
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Toast Notification */}
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
            />
        </div>
    );
};

export default CreateListingForm;