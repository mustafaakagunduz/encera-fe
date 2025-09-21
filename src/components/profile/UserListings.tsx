'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Building2,
    Calendar,
    Eye,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    MapPin,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    Pause,
    Plus
} from 'lucide-react';

interface Listing {
    id: string;
    title: string;
    location: string;
    price: string;
    image: string;
    status: 'active' | 'pending' | 'inactive';
    createdDate: string;
    views: number;
    type: 'sale' | 'rent';
    propertyType: string;
}

const UserListings: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Mock listings data - replace with actual data from your store/API
    const listings: Listing[] = [
        {
            id: '1',
            title: 'Merkezi Konumda Lüks 3+1 Daire',
            location: 'Beşiktaş, İstanbul',
            price: '2.850.000 ₺',
            image: '/api/placeholder/300/200',
            status: 'active',
            createdDate: '2024-01-15',
            views: 1250,
            type: 'sale',
            propertyType: 'Daire'
        },
        {
            id: '2',
            title: 'Deniz Manzaralı Modern Villa',
            location: 'Bodrum, Muğla',
            price: '25.000 ₺/ay',
            image: '/api/placeholder/300/200',
            status: 'pending',
            createdDate: '2024-01-10',
            views: 890,
            type: 'rent',
            propertyType: 'Villa'
        },
        {
            id: '3',
            title: 'Şehir Merkezinde Ofis Katı',
            location: 'Şişli, İstanbul',
            price: '1.950.000 ₺',
            image: '/api/placeholder/300/200',
            status: 'inactive',
            createdDate: '2023-12-28',
            views: 567,
            type: 'sale',
            propertyType: 'Ofis'
        },
        {
            id: '4',
            title: 'Bahçeli Müstakil Ev',
            location: 'Ankara',
            price: '1.750.000 ₺',
            image: '/api/placeholder/300/200',
            status: 'active',
            createdDate: '2024-01-05',
            views: 345,
            type: 'sale',
            propertyType: 'Müstakil Ev'
        },
        {
            id: '5',
            title: 'Yeni Yapı 2+1 Kiralık',
            location: 'Kadıköy, İstanbul',
            price: '18.000 ₺/ay',
            image: '/api/placeholder/300/200',
            status: 'active',
            createdDate: '2024-01-08',
            views: 923,
            type: 'rent',
            propertyType: 'Daire'
        }
    ];

    const itemsPerPage = 3;
    const maxIndex = Math.max(0, listings.length - itemsPerPage);

    const nextSlide = () => {
        setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
    };

    const prevSlide = () => {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'active':
                return {
                    label: 'Yayında',
                    icon: CheckCircle,
                    className: 'bg-green-100 text-green-800 border-green-200'
                };
            case 'pending':
                return {
                    label: 'Onay Bekliyor',
                    icon: Clock,
                    className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
                };
            case 'inactive':
                return {
                    label: 'Pasif',
                    icon: Pause,
                    className: 'bg-stone-100 text-stone-600 border-stone-200'
                };
            default:
                return {
                    label: 'Bilinmeyen',
                    icon: AlertCircle,
                    className: 'bg-red-100 text-red-800 border-red-200'
                };
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 bg-white">
            <div className="pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-stone-800 flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100">
                                <Building2 className="w-6 h-6 text-amber-700" />
                            </div>
                            İlanlarım
                        </h2>
                        <p className="text-stone-600 mt-1">
                            Yayınladığınız {listings.length} ilanı yönetin ve takip edin
                        </p>
                    </div>

                </div>
            </div>

            <div>
                {listings.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                            <Building2 className="w-12 h-12 text-amber-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-stone-800 mb-2">
                            Henüz ilan yok
                        </h3>
                        <p className="text-stone-600 mb-6 max-w-md mx-auto">
                            İlk ilanınızı oluşturarak emlak portföyünüzü paylaşmaya başlayın
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Carousel Navigation */}
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-stone-600">
                                {currentIndex + 1}-{Math.min(currentIndex + itemsPerPage, listings.length)} arası, toplam {listings.length} ilan
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={prevSlide}
                                    disabled={currentIndex === 0}
                                    className="rounded-lg"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={nextSlide}
                                    disabled={currentIndex >= maxIndex}
                                    className="rounded-lg"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Listings Grid/Carousel */}
                        <div className="overflow-hidden">
                            <div
                                className="flex transition-transform duration-300 ease-in-out gap-6"
                                style={{
                                    transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`
                                }}
                            >
                                {listings.map((listing) => {
                                    const statusConfig = getStatusConfig(listing.status);
                                    const StatusIcon = statusConfig.icon;

                                    return (
                                        <div
                                            key={listing.id}
                                            className="flex-none w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                                        >
                                            <div className="group relative bg-white rounded-2xl border border-stone-200 hover:border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                                                {/* Image */}
                                                <div className="relative h-48 overflow-hidden">
                                                    <img
                                                        src={listing.image}
                                                        alt={listing.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                                                    {/* Status Badge */}
                                                    <Badge
                                                        className={`absolute top-4 left-4 flex items-center gap-1 px-3 py-1 text-xs font-medium ${statusConfig.className}`}
                                                    >
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusConfig.label}
                                                    </Badge>

                                                    {/* Type Badge */}
                                                    <Badge
                                                        variant="secondary"
                                                        className="absolute top-4 right-4 bg-white/90 text-stone-700"
                                                    >
                                                        {listing.type === 'sale' ? 'Satılık' : 'Kiralık'}
                                                    </Badge>
                                                </div>

                                                {/* Content */}
                                                <div className="p-6">
                                                    <h3 className="font-bold text-lg text-stone-800 mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors">
                                                        {listing.title}
                                                    </h3>

                                                    <div className="flex items-center gap-2 text-stone-600 mb-3">
                                                        <MapPin className="w-4 h-4" />
                                                        <span className="text-sm">{listing.location}</span>
                                                    </div>

                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="text-2xl font-bold text-amber-700">
                                                            {listing.price}
                                                        </div>
                                                        <div className="text-sm text-stone-500">
                                                            {listing.propertyType}
                                                        </div>
                                                    </div>

                                                    {/* Stats */}
                                                    <div className="flex items-center gap-4 text-sm text-stone-600 mb-4">
                                                        <div className="flex items-center gap-1">
                                                            <Eye className="w-4 h-4" />
                                                            <span>{listing.views}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>{formatDate(listing.createdDate)}</span>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50"
                                                        >
                                                            <Edit2 className="w-4 h-4 mr-1" />
                                                            Düzenle
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-1" />
                                                            Sil
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Statistics Summary */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-stone-200">
                            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50">
                                <div className="text-2xl font-bold text-green-700 mb-1">
                                    {listings.filter(l => l.status === 'active').length}
                                </div>
                                <div className="text-sm text-green-600 font-medium">
                                    Aktif İlan
                                </div>
                            </div>

                            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200/50">
                                <div className="text-2xl font-bold text-yellow-700 mb-1">
                                    {listings.filter(l => l.status === 'pending').length}
                                </div>
                                <div className="text-sm text-yellow-600 font-medium">
                                    Onay Bekliyor
                                </div>
                            </div>

                            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50">
                                <div className="text-2xl font-bold text-amber-700 mb-1 flex items-center justify-center gap-1">
                                    <TrendingUp className="w-5 h-5" />
                                    {listings.reduce((sum, l) => sum + l.views, 0).toLocaleString()}
                                </div>
                                <div className="text-sm text-amber-600 font-medium">
                                    Toplam Görüntüleme
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserListings;