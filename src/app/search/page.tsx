// src/app/search/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { smartSearchService, SmartSearchResponse, PropertySummary } from '@/services/smartSearchService';
import { Search, AlertCircle, Clock, Target, MapPin, TrendingUp, Loader2 } from 'lucide-react';

const SearchResultsPage: React.FC = () => {
    const { t } = useAppTranslation();
    const searchParams = useSearchParams();
    const [searchResults, setSearchResults] = useState<SmartSearchResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);

    const query = searchParams.get('q') || '';

    useEffect(() => {
        if (query) {
            performSearch(query, currentPage);
        }
    }, [query, currentPage]);

    const performSearch = async (searchQuery: string, page: number = 0) => {
        setLoading(true);
        setError(null);

        try {
            const result = await smartSearchService.smartSearch(searchQuery, page, 20);
            setSearchResults(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Arama sırasında bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Aranıyor...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Arama Hatası</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Tekrar Dene
                    </button>
                </div>
            </div>
        );
    }

    if (!searchResults) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Arama sonucu bulunamadı</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                "{searchResults.originalQuery}" için arama sonuçları
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {searchResults.totalResults} sonuç bulundu ({searchResults.searchTimeMs}ms)
                            </p>
                        </div>

                        {/* Category Badge */}
                        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${smartSearchService.getCategoryColor(searchResults.detectedCategory)}`}>
                            <Target className="w-4 h-4 mr-2" />
                            {smartSearchService.getCategoryDisplayName(searchResults.detectedCategory)}
                        </div>
                    </div>

                    {/* Search Analysis */}
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                        {searchResults.locationKeywords.length > 0 && (
                            <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                Konum: {searchResults.locationKeywords.join(', ')}
                            </div>
                        )}
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Arama süresi: {searchResults.searchTimeMs}ms
                        </div>
                        <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            Relevans sıralaması aktif
                        </div>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {searchResults.results.content.length === 0 ? (
                    <div className="text-center py-12">
                        <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">Sonuç bulunamadı</h3>
                        <p className="text-gray-600">
                            "{searchResults.originalQuery}" araması için hiç ilan bulunamadı.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.results.content.map((property: PropertySummary) => (
                            <div
                                key={property.id}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => window.open(`/house/${property.id}`, '_self')}
                            >
                                {/* Property Image */}
                                <div className="relative h-48 bg-gray-200">
                                    {property.primaryImageUrl ? (
                                        <img
                                            src={property.primaryImageUrl}
                                            alt={property.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <div className="text-center">
                                                <div className="text-4xl mb-2">🏠</div>
                                                <p className="text-sm">Fotoğraf yok</p>
                                            </div>
                                        </div>
                                    )}
                                    {property.featured && (
                                        <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                                            Öne Çıkan
                                        </div>
                                    )}
                                    {property.pappSellable && (
                                        <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                                            PAPP
                                        </div>
                                    )}
                                </div>

                                {/* Property Info */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                                        {property.title}
                                    </h3>

                                    <div className="flex items-center text-gray-600 mb-2">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        <span className="text-sm">
                                            {property.city}, {property.district}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-2xl font-bold text-blue-600">
                                            {formatPrice(property.price)}
                                        </span>
                                        {property.negotiable && (
                                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                                Pazarlık
                                            </span>
                                        )}
                                    </div>

                                    {/* Property Details */}
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <div className="flex items-center gap-3">
                                            {property.roomCount && (
                                                <span>{property.roomCount}+{property.hallCount || 0}</span>
                                            )}
                                            {property.grossArea && (
                                                <span>{property.grossArea} m²</span>
                                            )}
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-xs">{property.viewCount} görüntülenme</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {searchResults.results.totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                disabled={currentPage === 0}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Önceki
                            </button>

                            <span className="px-4 py-2 text-sm text-gray-700">
                                {currentPage + 1} / {searchResults.results.totalPages}
                            </span>

                            <button
                                onClick={() => setCurrentPage(Math.min(searchResults.results.totalPages - 1, currentPage + 1))}
                                disabled={currentPage >= searchResults.results.totalPages - 1}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sonraki
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResultsPage;