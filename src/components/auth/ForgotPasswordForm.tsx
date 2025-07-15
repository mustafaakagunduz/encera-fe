// src/components/auth/ForgotPasswordForm.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { authApi } from '@/store/api/authApi';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

interface ForgotPasswordFormProps {
    onModeChange: (mode: 'login') => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onModeChange }) => {
    const [forgotPassword] = authApi.useForgotPasswordMutation();

    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!email) {
            newErrors.email = 'Email adresi gereklidir';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Geçerli bir email adresi giriniz';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const result = await forgotPassword({
                email: email,
            }).unwrap();

            if (result.success) {
                setIsSuccess(true);
            }
        } catch (error: any) {
            console.error('Forgot password error:', error);
            const errorMessage = error.data?.message || 'Şifre sıfırlama talebi gönderilirken hata oluştu';
            setErrors({ general: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);

        // Clear errors when user starts typing
        if (errors.email) {
            setErrors(prev => ({ ...prev, email: '' }));
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center space-y-4">
                <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                    <h3 className="text-lg font-medium text-green-600 mb-2">
                        Email Gönderildi!
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Eğer <span className="font-medium">{email}</span> adresi sistemde kayıtlı ise,
                        şifre sıfırlama bağlantısı gönderilmiştir.
                    </p>
                    <p className="text-xs text-gray-500 mb-6">
                        Email gelmediyse spam klasörünüzü kontrol edin.
                    </p>
                    <Button onClick={() => onModeChange('login')} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Giriş Sayfasına Dön
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center">
                <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                    <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Şifremi Unuttum
                </h3>
                <p className="text-sm text-gray-600">
                    Email adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
                </p>
            </div>

            {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">{errors.general}</span>
                </div>
            )}

            {/* Email */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Adresi
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="ornek@email.com"
                    />
                </div>
                {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                className="w-full bg-blue-900 hover:bg-blue-800"
                disabled={isLoading}
            >
                {isLoading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Linki Gönder'}
            </Button>

            {/* Back to Login */}
            <div className="text-center">
                <button
                    type="button"
                    onClick={() => onModeChange('login')}
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Giriş sayfasına dön
                </button>
            </div>
        </form>
    );
};

export default ForgotPasswordForm;