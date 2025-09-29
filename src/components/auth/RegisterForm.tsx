// src/components/auth/RegisterForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { authApi } from '@/store/api/authApi';
import { setPendingVerificationEmail } from '@/store/slices/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, Phone } from 'lucide-react';
import {useAppTranslation} from "@/hooks/useAppTranslation";
import { useSendGuestPhoneVerificationMutation, useVerifyGuestPhoneMutation } from '@/store/api/authApi';

interface RegisterFormProps {
    onSuccess: () => void;
    onModeChange: (mode: 'login') => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onModeChange }) => {
    const { t, isReady } = useAppTranslation();
    const dispatch = useAppDispatch();
    const [register] = authApi.useRegisterMutation();
    const [sendPhoneVerification] = useSendGuestPhoneVerificationMutation();
    const [verifyPhone] = useVerifyGuestPhoneMutation();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [showPhoneVerification, setShowPhoneVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [phoneVerificationLoading, setPhoneVerificationLoading] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);

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

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Telefon numarası gereklidir';
        } else if (!/^(\+90|0)?\s?[0-9]{10}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
            newErrors.phoneNumber = 'Geçerli bir telefon numarası giriniz';
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

    const handlePhoneVerification = async () => {
        if (!formData.phoneNumber) {
            setErrors(prev => ({ ...prev, phoneNumber: 'Telefon numarası gereklidir' }));
            return;
        }

        console.log('🔵 FRONTEND: Starting phone verification process');
        console.log('🔵 Phone number:', formData.phoneNumber);
        console.log('🔵 API function:', sendPhoneVerification);

        setPhoneVerificationLoading(true);
        try {
            console.log('🔵 FRONTEND: Sending phone verification request...');
            const result = await sendPhoneVerification({ phoneNumber: formData.phoneNumber }).unwrap();
            console.log('🟢 FRONTEND: Phone verification success:', result);
            setShowPhoneVerification(true);
        } catch (error: any) {
            console.error('🔴 FRONTEND: Phone verification error:', error);
            console.error('🔴 Error details:', {
                status: error?.status,
                data: error?.data,
                message: error?.message,
                originalStatus: error?.originalStatus
            });
            setErrors(prev => ({ ...prev, phoneNumber: 'Doğrulama kodu gönderilemedi' }));
        } finally {
            setPhoneVerificationLoading(false);
        }
    };

    const handleVerifyPhoneCode = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            return;
        }

        setPhoneVerificationLoading(true);
        try {
            await verifyPhone({
                phoneNumber: formData.phoneNumber,
                verificationCode
            }).unwrap();
            setPhoneVerified(true);
            setShowPhoneVerification(false);
            setVerificationCode('');
        } catch (error: any) {
            console.error('Phone verification error:', error);
            setErrors(prev => ({ ...prev, verificationCode: 'Doğrulama kodu hatalı' }));
        } finally {
            setPhoneVerificationLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        if (!phoneVerified) {
            setErrors(prev => ({ ...prev, phoneNumber: 'Lütfen telefon numaranızı doğrulayın' }));
            return;
        }

        setIsLoading(true);

        try {
            const result = await register({
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                password: formData.password,
            }).unwrap();

            setIsSuccess(true);

            // Artık email doğrulama yok, direkt ana sayfaya yönlendir
            setTimeout(() => {
                window.location.href = '/';
                window.location.reload(); // Force complete page reload to update all components
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
                        Kayıt işleminiz başarıyla tamamlandı. Ana sayfaya yönlendiriliyorsunuz...
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

            {/* Phone Number */}
            <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon Numarası
                    {phoneVerified && <CheckCircle className="inline-block w-4 h-4 text-green-600 ml-2" />}
                </label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            autoComplete="tel"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            disabled={phoneVerified}
                            className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.phoneNumber ? 'border-red-300' :
                                phoneVerified ? 'border-green-300 bg-green-50' : 'border-gray-300'
                            }`}
                            placeholder="+90 555 123 4567"
                        />
                    </div>
                    {!phoneVerified && (
                        <button
                            type="button"
                            onClick={handlePhoneVerification}
                            disabled={phoneVerificationLoading || !formData.phoneNumber}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm whitespace-nowrap"
                        >
                            {phoneVerificationLoading ? 'Gönderiliyor...' : 'Doğrula'}
                        </button>
                    )}
                </div>
                {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
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

            {/* Phone Verification Modal */}
            {showPhoneVerification && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="text-center mb-6">
                            <Phone className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Telefon Doğrulama
                            </h3>
                            <p className="text-gray-600">
                                {formData.phoneNumber} numarasına gönderilen 6 haneli kodu girin
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    placeholder="123456"
                                    maxLength={6}
                                    className={`w-full px-4 py-3 text-center text-lg tracking-widest border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.verificationCode ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                />
                                {errors.verificationCode && (
                                    <p className="mt-1 text-sm text-red-600">{errors.verificationCode}</p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPhoneVerification(false);
                                        setVerificationCode('');
                                        setErrors(prev => ({ ...prev, verificationCode: '' }));
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                >
                                    İptal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleVerifyPhoneCode}
                                    disabled={phoneVerificationLoading || verificationCode.length !== 6}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {phoneVerificationLoading ? 'Doğrulanıyor...' : 'Doğrula'}
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={handlePhoneVerification}
                                disabled={phoneVerificationLoading}
                                className="w-full text-blue-600 hover:text-blue-500 text-sm"
                            >
                                {phoneVerificationLoading ? 'Gönderiliyor...' : 'Kodu Tekrar Gönder'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
};

export default RegisterForm;