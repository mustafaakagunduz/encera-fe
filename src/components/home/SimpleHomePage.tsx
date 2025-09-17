'use client';

import React from 'react';
import { Building2, Users, MapPin, Award, Heart, Bed, Square, Eye, SlidersHorizontal, Search, Grid3X3, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SimpleHomePage = () => {
    return (
        <main className="min-h-screen">
            {/* Company Intro Section */}
            <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Company Introduction */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                            Encera Gayrimenkul
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-600 font-semibold mb-8">
                            12 yıllık deneyimle güvenilir emlak hizmetleri
                        </p>
                        <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                            Türkiye'nin önde gelen emlak şirketlerinden biri olarak, hayalinizdeki evi bulmanız için profesyonel ekibimizle hizmetinizdeyiz.
                        </p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                                    <Award className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    12 Yıllık Deneyim
                                </h3>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                                    <Building2 className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    5,000+ Aktif İlan
                                </h3>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                                    <MapPin className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    35 Şehir
                                </h3>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                                    <Users className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    50,000+ Mutlu Müşteri
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Properties Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Mülklerimiz
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Size özel seçilmiş gayrimenkul fırsatları
                        </p>
                    </div>

                    {/* Search and Controls */}
                    <div className="mb-8">
                        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                            {/* Search Bar */}
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Ne arıyorsunuz?"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-3">
                                {/* View Mode Toggle */}
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button className="p-2 rounded-md bg-white shadow-sm text-blue-600">
                                        <Grid3X3 className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 rounded-md text-gray-600 hover:text-gray-900">
                                        <Map className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Filter Button */}
                                <Button variant="outline" className="flex items-center gap-2">
                                    <SlidersHorizontal className="w-4 h-4" />
                                    Filtrele
                                </Button>
                            </div>
                        </div>

                        {/* Results Count */}
                        <div className="mt-4 text-sm text-gray-600">
                            <span>6 ilan bulundu</span>
                        </div>
                    </div>

                    {/* Property Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* Sample Property Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                            {/* Image */}
                            <div className="relative">
                                <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="text-center text-gray-400">
                                            <Square className="w-12 h-12 mx-auto mb-2" />
                                            <p className="text-sm">No Image</p>
                                        </div>
                                    </div>

                                    {/* Featured Badge */}
                                    <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                        ⭐ Premium
                                    </div>

                                    {/* Favorite Button */}
                                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                                        <Heart className="w-4 h-4 text-gray-600" />
                                    </button>

                                    {/* Property Type Badge */}
                                    <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                                        Satılık
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                {/* Price */}
                                <div className="mb-3">
                                    <span className="text-2xl font-bold text-gray-900">
                                        2,500,000 TL
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight">
                                    Merkezi konumda lüks 3+1 daire
                                </h3>

                                {/* Location */}
                                <div className="flex items-center gap-1 text-gray-600 mb-3">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm">Beşiktaş, İstanbul</span>
                                </div>

                                {/* Property Details */}
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center gap-1">
                                        <Bed className="w-4 h-4" />
                                        <span>3+1</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Square className="w-4 h-4" />
                                        <span>150 m²</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Eye className="w-4 h-4" />
                                        <span>234</span>
                                    </div>
                                </div>

                                {/* Property Type */}
                                <div className="text-xs text-gray-500 mb-4">
                                    Konut
                                </div>

                                {/* Action Button */}
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                    Detayları Görüntüle
                                </Button>
                            </div>
                        </div>

                        {/* Add more dummy cards */}
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                                <div className="relative">
                                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200"></div>
                                    <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                                        {index % 2 === 0 ? 'Satılık' : 'Kiralık'}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="mb-3">
                                        <span className="text-2xl font-bold text-gray-900">
                                            {index % 2 === 0 ? '1,200,000 TL' : '8,000 TL'}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-3">
                                        Örnek Emlak İlanı {index + 1}
                                    </h3>
                                    <div className="flex items-center gap-1 text-gray-600 mb-3">
                                        <MapPin className="w-4 h-4" />
                                        <span className="text-sm">Ankara</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Bed className="w-4 h-4" />
                                            <span>2+1</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Square className="w-4 h-4" />
                                            <span>120 m²</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Eye className="w-4 h-4" />
                                            <span>{Math.floor(Math.random() * 500)}</span>
                                        </div>
                                    </div>
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                        Detayları Görüntüle
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default SimpleHomePage;