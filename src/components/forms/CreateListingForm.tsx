// src/components/forms/CreateListingForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LocationSelector } from '@/components/ui/location-selector';
import { Toast } from '@/components/ui/toast';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {selectListingPreviewData, setListingPreviewData} from '@/store/slices/listingPreviewSlice';
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
    Crown
} from 'lucide-react';

interface FormData extends Omit<PropertyCreateRequest, 'roomConfiguration'> {
    roomCount: string;
    hallCount: string;
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
        price: 0,
        negotiable: false,
        grossArea: undefined,
        netArea: undefined,
        elevator: false,
        parking: false,
        balcony: false,
        security: false,
        description: '',
        furnished: false,
        pappSellable: false,
        roomCount: '',
        hallCount: '',
        monthlyFee: undefined,
        deposit: undefined,
    });

    const [errors, setErrors] = useState<FormErrors>({});

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
                price: previewData.price,
                negotiable: previewData.negotiable || false,
                grossArea: previewData.grossArea,
                netArea: previewData.netArea,
                elevator: previewData.elevator || false,
                parking: previewData.parking || false,
                balcony: previewData.balcony || false,
                security: previewData.security || false,
                description: previewData.description || '',
                furnished: previewData.furnished || false,
                pappSellable: previewData.pappSellable || false,
                roomCount: previewData.roomConfiguration?.roomCount?.toString() || '',
                hallCount: previewData.roomConfiguration?.hallCount?.toString() || '',
                monthlyFee: previewData.monthlyFee,
                deposit: previewData.deposit,
            });
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
                price: existingProperty.price,
                negotiable: existingProperty.negotiable,
                grossArea: existingProperty.grossArea,
                netArea: existingProperty.netArea,
                elevator: existingProperty.elevator,
                parking: existingProperty.parking,
                balcony: existingProperty.balcony,
                security: existingProperty.security,
                description: existingProperty.description || '',
                furnished: existingProperty.furnished,
                pappSellable: existingProperty.pappSellable,
                roomCount: existingProperty.roomConfiguration?.roomCount?.toString() || '',
                hallCount: existingProperty.roomConfiguration?.livingRoomCount?.toString() || '',
                monthlyFee: existingProperty.monthlyFee,
                deposit: existingProperty.deposit,
            });
        }
    }, [existingProperty, isEditMode, previewData]);

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
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: value ? Number(value) : undefined }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleLocationChange = (location: { city: string; district: string; neighborhood: string }) => {
        setFormData(prev => ({
            ...prev,
            city: location.city,
            district: location.district,
            neighborhood: location.neighborhood
        }));

        // Clear location errors
        setErrors(prev => ({
            ...prev,
            city: '',
            district: '',
            neighborhood: ''
        }));
    };

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
                    livingRoomCount: Number(formData.hallCount),
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
            price: formData.price,
            negotiable: formData.negotiable,
            grossArea: formData.grossArea,
            netArea: formData.netArea,
            elevator: formData.elevator,
            parking: formData.parking,
            balcony: formData.balcony,
            security: formData.security,
            description: formData.description,
            furnished: formData.furnished,
            pappSellable: formData.pappSellable,
            roomConfiguration,
            monthlyFee: formData.monthlyFee,
            deposit: formData.deposit,
        };

        if (isEditMode && editId) {
            // Edit mode - update existing property
            try {
                // Force property to pending status when edited
                const editSubmitData = {
                    ...submitData,
                    approved: false
                };
                
                await updateProperty({ 
                    id: parseInt(editId), 
                    data: editSubmitData 
                }).unwrap();
                
                // Manually invalidate cache to ensure UI updates
                dispatch(propertyApi.util.invalidateTags(['UserProperty', 'PropertyStats']));
                
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
            // Create mode - existing flow
            // Form verisini Redux store'a kaydet
            dispatch(setListingPreviewData(submitData));

            // Preview sayfasına yönlendir
            router.push('/listing-preview');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg">
                <div className="border-b border-gray-200 p-6">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Home className="w-6 h-6 mr-3 text-blue-600" />
                        {isEditMode 
                            ? (isReady ? t('listing.edit.title') : 'İlan Düzenle')
                            : (isReady ? t('listing.create.title') : 'İlan Ver')
                        }
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Temel Bilgiler */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-blue-600" />
                            {isReady ? t('listing.create.basic-info') : 'Temel Bilgiler'}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* İlan Başlığı */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    {isReady ? t('listing.create.listing-title') : 'İlan Başlığı'}
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder={isReady ? t('listing.create.listing-title-placeholder') : 'Örn: Merkezi konumda satılık 3+1 daire'}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.title ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    <option value={PropertyType.DAILY_RENTAL}>
                                        {isReady ? t('common.daily-rental') : 'Günlük Kiralık'}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Konum */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                            {isReady ? t('listing.location') : 'Konum'}
                        </h2>

                        <LocationSelector
                            selectedCity={formData.city}
                            selectedDistrict={formData.district}
                            selectedNeighborhood={formData.neighborhood}
                            onLocationChange={handleLocationChange}
                            errors={{
                                city: errors.city,
                                district: errors.district,
                                neighborhood: errors.neighborhood,
                            }}
                            disabled={isFetchingProperty || isCreating || isUpdating}
                        />
                    </div>

                    {/* Emlak Detayları */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Home className="w-5 h-5 mr-2 text-blue-600" />
                            {isReady ? t('listing.create.property-details') : 'İlan Detayları'}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Brüt Alan */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    {isReady ? t('listing.create.gross-area') : 'Brüt Alan (m²)'}
                                </label>
                                <input
                                    type="number"
                                    name="grossArea"
                                    value={formData.grossArea || ''}
                                    onChange={handleInputChange}
                                    min="1"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Net Alan */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    {isReady ? t('listing.create.net-area') : 'Net Alan (m²)'}
                                </label>
                                <input
                                    type="number"
                                    name="netArea"
                                    value={formData.netArea || ''}
                                    onChange={handleInputChange}
                                    min="1"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Oda Sayısı */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    {isReady ? t('listing.create.room-config') : 'Oda + Salon'}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        name="roomCount"
                                        value={formData.roomCount || ''}
                                        onChange={handleInputChange}
                                        placeholder="Oda"
                                        min="0"
                                        className="w-1/2 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <span className="flex items-center text-gray-500">+</span>
                                    <input
                                        type="number"
                                        name="hallCount"
                                        value={formData.hallCount || ''}
                                        onChange={handleInputChange}
                                        placeholder="Salon"
                                        min="0"
                                        className="w-1/2 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fiyat Bilgileri */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                            {isReady ? t('listing.create.pricing') : 'Fiyat Bilgileri'}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Fiyat */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    {isReady ? t('listing.create.price-label') : 'Fiyat'} ({isReady ? t('listing.create.currency') : 'TL'})
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price || ''}
                                    onChange={handleInputChange}
                                    min="1"
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.price ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                            </div>

                            {/* Aidat */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    {isReady ? t('listing.create.monthly-fee') : 'Aidat'} ({isReady ? t('listing.create.currency') : 'TL'})
                                </label>
                                <input
                                    type="number"
                                    name="monthlyFee"
                                    value={formData.monthlyFee || ''}
                                    onChange={handleInputChange}
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Depozito */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    {isReady ? t('listing.create.deposit') : 'Depozito'} ({isReady ? t('listing.create.currency') : 'TL'})
                                </label>
                                <input
                                    type="number"
                                    name="deposit"
                                    value={formData.deposit || ''}
                                    onChange={handleInputChange}
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Pazarlığa açık */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="negotiable"
                                name="negotiable"
                                checked={formData.negotiable}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="negotiable" className="ml-3 text-sm text-gray-900">
                                {isReady ? t('listing.create.negotiable') : 'Pazarlığa açık'}
                            </label>
                        </div>
                    </div>

                    {/* Özellikler */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Home className="w-5 h-5 mr-2 text-blue-600" />
                            {isReady ? t('listing.create.amenities') : 'Özellikler'}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Asansör */}
                            <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    id="elevator"
                                    name="elevator"
                                    checked={formData.elevator}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="elevator" className="ml-3 flex items-center text-sm text-gray-900">
                                    <ArrowUp className="w-4 h-4 mr-2 text-gray-600" />
                                    {isReady ? t('listing.create.elevator') : 'Asansör'}
                                </label>
                            </div>

                            {/* Otopark */}
                            <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    id="parking"
                                    name="parking"
                                    checked={formData.parking}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="parking" className="ml-3 flex items-center text-sm text-gray-900">
                                    <Car className="w-4 h-4 mr-2 text-gray-600" />
                                    {isReady ? t('listing.create.parking') : 'Otopark'}
                                </label>
                            </div>

                            {/* Balkon */}
                            <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    id="balcony"
                                    name="balcony"
                                    checked={formData.balcony}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="balcony" className="ml-3 flex items-center text-sm text-gray-900">
                                    <Home className="w-4 h-4 mr-2 text-gray-600" />
                                    {isReady ? t('listing.create.balcony') : 'Balkon'}
                                </label>
                            </div>

                            {/* Güvenlik */}
                            <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    id="security"
                                    name="security"
                                    checked={formData.security}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="security" className="ml-3 flex items-center text-sm text-gray-900">
                                    <Shield className="w-4 h-4 mr-2 text-gray-600" />
                                    {isReady ? t('listing.create.security') : 'Güvenlik'}
                                </label>
                            </div>

                            {/* Eşyalı */}
                            <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    id="furnished"
                                    name="furnished"
                                    checked={formData.furnished}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="furnished" className="ml-3 flex items-center text-sm text-gray-900">
                                    <Sofa className="w-4 h-4 mr-2 text-gray-600" />
                                    {isReady ? t('listing.create.furnished') : 'Eşyalı'}
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Papp ile Satılabilsin - Ayrı Section */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Crown className="w-5 h-5 mr-2 text-yellow-600" />
                            PAPP Premium
                        </h2>

                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="pappSellable"
                                    name="pappSellable"
                                    checked={formData.pappSellable}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 text-yellow-600 border-yellow-300 rounded focus:ring-yellow-500"
                                />
                                <label htmlFor="pappSellable" className="ml-4 flex items-center text-base font-medium text-gray-900">
                                    <Crown className="w-5 h-5 mr-2 text-yellow-600" />
                                    {isReady ? t('listing.create.papp-sellable') : 'Papp ile satılabilsin'}
                                </label>
                            </div>
                            <p className="mt-2 ml-9 text-sm text-gray-600">
                                {isReady ? t('listing.create.papp-sellable-description') : 'İlanınızı Papp üzerinden satış sürecinde profesyonel destek alabilirsiniz.'}
                            </p>
                        </div>
                    </div>

                    {/* Açıklama */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                {isReady ? t('listing.create.description') : 'Açıklama'}
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={6}
                                placeholder={isReady ? t('listing.create.description-placeholder') : 'İlan açıklamanızı detaylı bir şekilde yazınız...'}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                                    errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6 border-t border-gray-200">
                        <Button
                            type="submit"
                            disabled={isFetchingProperty || isCreating || isUpdating}
                            className="w-full bg-blue-900 hover:bg-blue-600 text-white py-4 text-lg font-semibold"
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