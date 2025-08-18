// src/components/auth/RegisterForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { authApi } from '@/store/api/authApi';
import { setPendingVerificationEmail } from '@/store/slices/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import {useAppTranslation} from "@/hooks/useAppTranslation";

interface RegisterFormProps {
    onSuccess: () => void;
    onModeChange: (mode: 'login') => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onModeChange }) => {
    const { t, isReady } = useAppTranslation();
    const dispatch = useAppDispatch();
    const [register] = authApi.useRegisterMutation();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = isReady ? t('auth.errors.first-name-required') : 'Ad gereklidir';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = isReady ? t('auth.errors.last-name-required') : 'Soyad gereklidir';
        }

        if (!formData.email) {
            newErrors.email = isReady ? t('auth.errors.email-required') : 'Email adresi gereklidir';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = isReady ? t('auth.errors.email-invalid') : 'Geçerli bir email adresi giriniz';
        }

        if (!formData.password) {
            newErrors.password = isReady ? t('auth.errors.password-required') : 'Şifre gereklidir';
        } else if (formData.password.length < 6) {
            newErrors.password = isReady ? t('auth.errors.password-min-length') : 'Şifre en az 6 karakter olmalıdır';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = isReady ? t('auth.errors.confirm-password-required') : 'Şifre tekrarı gereklidir';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = isReady ? t('auth.errors.passwords-not-match') : 'Şifreler eşleşmiyor';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const result = await register({
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email,
                password: formData.password,
            }).unwrap();

            setIsSuccess(true);
            dispatch(setPendingVerificationEmail(formData.email));

            setTimeout(() => {
                onSuccess();
            }, 2000);

        } catch (error: any) {
            console.error('Register error:', error);
            const errorMessage = error.data?.message || (isReady ? t('auth.errors.register-failed') : 'Kayıt olurken hata oluştu');
            setErrors({ general: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
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
                        {isReady ? t('auth.email-verification.success-title') : 'Kayıt Başarılı!'}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {isReady ? t('auth.email-verification.success-description') : 'Email adresinize doğrulama kodu gönderildi. Email doğrulama sayfasına yönlendiriliyorsunuz...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">{errors.general}</span>
                </div>
            )}

            {/* First Name */}
            <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    {isReady ? t('auth.first-name') : 'Ad'}
                </label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.firstName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder={isReady ? t('auth.placeholders.first-name') : 'Adınız'}
                    />
                </div>
                {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
            </div>

            {/* Last Name */}
            <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    {isReady ? t('auth.last-name') : 'Soyad'}
                </label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.lastName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder={isReady ? t('auth.placeholders.last-name') : 'Soyadınız'}
                    />
                </div>
                {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
            </div>

            {/* Email */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {isReady ? t('auth.email') : 'E-posta'}
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder={isReady ? t('auth.placeholders.email') : 'ornek@email.com'}
                    />
                </div>
                {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
            </div>

            {/* Password */}
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    {isReady ? t('auth.password') : 'Şifre'}
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.password ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="••••••••"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
            </div>

            {/* Confirm Password */}
            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    {isReady ? t('auth.confirm-password') : 'Şifre Tekrar'}
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="••••••••"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                className="w-full bg-blue-900 hover:bg-blue-800"
                disabled={isLoading}
            >
                {isLoading ?
                    (isReady ? t('auth.registering') : 'Kayıt yapılıyor...') :
                    (isReady ? t('auth.register') : 'Kayıt Ol')
                }
            </Button>

            {/* Login Link */}
            <div className="text-center">
                <span className="text-sm text-gray-600">
                    {isReady ? t('auth.already-have-account') : 'Zaten hesabınız var mı?'}{' '}
                    <button
                        type="button"
                        onClick={() => onModeChange('login')}
                        className="text-blue-600 hover:text-blue-500 font-medium"
                    >
                        {isReady ? t('auth.login') : 'Giriş Yap'}
                    </button>
                </span>
            </div>
        </form>
    );
};

export default RegisterForm;