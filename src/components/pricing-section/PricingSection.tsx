'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PricingSection: React.FC = () => {
    const { t } = useLanguage();

    const pricingPlans = [
        {
            id: 'basic',
            title: t('pricing.basic.title'),
            price: t('pricing.basic.price'),
            duration: t('pricing.basic.duration'),
            features: [
                t('pricing.basic.feature1'),
                t('pricing.basic.feature2')
            ],
            isPopular: false,
            cardClass: ''
        },
        {
            id: 'premium',
            title: t('pricing.premium.title'),
            price: t('pricing.premium.price'),
            duration: t('pricing.premium.duration'),
            features: [
                t('pricing.premium.feature1'),
                t('pricing.premium.feature2'),
                t('pricing.premium.feature3')
            ],
            isPopular: true,
            badge: t('pricing.premium.badge'),
            cardClass: 'border-yellow-400 border-2'
        },
        {
            id: 'vip',
            title: t('pricing.vip.title'),
            price: t('pricing.vip.price'),
            duration: t('pricing.vip.duration'),
            features: [
                t('pricing.vip.feature1'),
                t('pricing.vip.feature2'),
                t('pricing.vip.feature3'),
                t('pricing.vip.feature4')
            ],
            isPopular: false,
            cardClass: ''
        }
    ];

    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Title */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
                        {t('pricing.title')}
                    </h2>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {pricingPlans.map((plan) => (
                        <div key={plan.id} className="relative">
                            <Card className={`h-full hover:scale-105 transition-transform duration-300 hover:shadow-xl ${plan.cardClass}`}>
                                {/* Popular Badge - Card içinde */}
                                {plan.isPopular && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                        <span className="bg-yellow-400 text-blue-900 px-6 py-2 rounded-full text-sm font-semibold whitespace-nowrap">
                                            {plan.badge}
                                        </span>
                                    </div>
                                )}

                                <CardHeader className="text-center pb-4 pt-6">
                                    <CardTitle className="text-xl font-bold text-blue-900 mb-2">
                                        {plan.title}
                                    </CardTitle>
                                    <div className="text-3xl font-bold text-red-600 mb-2">
                                        {plan.price}
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        {plan.duration}
                                    </p>
                                </CardHeader>

                                <CardContent className="pt-0">
                                    <ul className="space-y-3 mb-6">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-center text-gray-700">
                                                <svg
                                                    className="w-4 h-4 text-green-500 mr-3 flex-shrink-0"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3"
                                        size="lg"
                                    >
                                        {t('pricing.button')}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PricingSection;