'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    useGetProfileQuery,
    useUpdateProfileMutation,
    useUpdatePreferencesMutation,
    useChangePasswordMutation,
    useSendPhoneVerificationMutation,
    useVerifyPhoneMutation
} from '@/store/api/userApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    User,
    Mail,
    Lock,
    Globe,
    Palette,
    Bell,
    Shield,
    Save,
    Eye,
    EyeOff,
    Phone,
    MapPin,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

const AccountSettings: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showPhoneVerificationModal, setShowPhoneVerificationModal] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');

    // API hooks
    const { data: profile, isLoading: profileLoading, error: profileError } = useGetProfileQuery();
    const [updateProfile, { isLoading: updateProfileLoading }] = useUpdateProfileMutation();
    const [updatePreferences, { isLoading: updatePreferencesLoading }] = useUpdatePreferencesMutation();
    const [changePassword, { isLoading: changePasswordLoading }] = useChangePasswordMutation();
    const [sendPhoneVerification, { isLoading: phoneVerificationLoading }] = useSendPhoneVerificationMutation();
    const [verifyPhone, { isLoading: verifyPhoneLoading }] = useVerifyPhoneMutation();

    // Form states
    const [userSettings, setUserSettings] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        bio: '',
        location: '',
        preferredLanguage: i18n.language || 'tr',
        themePreference: 'light',
        emailNotificationsEnabled: true,
        smsNotificationsEnabled: false,
        newListingAlertsEnabled: true,
        priceChangeAlertsEnabled: true,
        marketingEmailsEnabled: false
    });

    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    // Update form data when profile data is loaded
    useEffect(() => {
        if (profile) {
            setUserSettings({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                email: profile.email || '',
                phoneNumber: profile.phoneNumber || '',
                bio: profile.bio || '',
                location: profile.location || '',
                preferredLanguage: profile.preferredLanguage || 'tr',
                themePreference: profile.themePreference || 'light',
                emailNotificationsEnabled: profile.emailNotificationsEnabled ?? true,
                smsNotificationsEnabled: profile.smsNotificationsEnabled ?? false,
                newListingAlertsEnabled: profile.newListingAlertsEnabled ?? true,
                priceChangeAlertsEnabled: profile.priceChangeAlertsEnabled ?? true,
                marketingEmailsEnabled: profile.marketingEmailsEnabled ?? false
            });
        }
    }, [profile]);

    const handleSavePersonalInfo = async () => {
        try {
            await updateProfile({
                firstName: userSettings.firstName,
                lastName: userSettings.lastName,
                email: userSettings.email,
                phoneNumber: userSettings.phoneNumber,
                bio: userSettings.bio,
                location: userSettings.location
            }).unwrap();
            alert(t('common.success'));
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile');
        }
    };

    const handleChangePassword = async () => {
        if (passwords.new !== passwords.confirm) {
            alert('New passwords do not match');
            return;
        }

        try {
            await changePassword({
                currentPassword: passwords.current,
                newPassword: passwords.new
            }).unwrap();
            setPasswords({ current: '', new: '', confirm: '' });
            alert('Password changed successfully');
        } catch (error) {
            console.error('Failed to change password:', error);
            alert('Failed to change password');
        }
    };

    const handleSavePreferences = async () => {
        try {
            await updatePreferences({
                preferredLanguage: userSettings.preferredLanguage,
                themePreference: userSettings.themePreference,
                emailNotificationsEnabled: userSettings.emailNotificationsEnabled,
                smsNotificationsEnabled: userSettings.smsNotificationsEnabled,
                newListingAlertsEnabled: userSettings.newListingAlertsEnabled,
                priceChangeAlertsEnabled: userSettings.priceChangeAlertsEnabled,
                marketingEmailsEnabled: userSettings.marketingEmailsEnabled
            }).unwrap();

            // Update language if changed
            if (userSettings.preferredLanguage !== i18n.language) {
                i18n.changeLanguage(userSettings.preferredLanguage);
            }

            alert('Preferences updated successfully');
        } catch (error) {
            console.error('Failed to update preferences:', error);
            alert('Failed to update preferences');
        }
    };

    const handleLanguageChange = (newLanguage: string) => {
        setUserSettings(prev => ({ ...prev, preferredLanguage: newLanguage }));
        i18n.changeLanguage(newLanguage);
    };

    const handleEmailVerification = async () => {
        // TODO: Implement email verification API call
        console.log('Email verification not yet implemented');
    };

    const handlePhoneVerification = async () => {
        if (!userSettings.phoneNumber) {
            alert('Please enter a phone number first');
            return;
        }

        try {
            await sendPhoneVerification({
                phoneNumber: userSettings.phoneNumber
            }).unwrap();
            setShowPhoneVerificationModal(true);
            alert('Verification code sent to your phone');
        } catch (error) {
            console.error('Phone verification failed:', error);
            alert('Failed to send verification code');
        }
    };

    const handleVerifyPhoneCode = async () => {
        if (!verificationCode) {
            alert('Please enter the verification code');
            return;
        }

        try {
            await verifyPhone({
                phoneNumber: userSettings.phoneNumber,
                verificationCode: verificationCode
            }).unwrap();
            setShowPhoneVerificationModal(false);
            setVerificationCode('');
            alert('Phone number verified successfully!');
        } catch (error) {
            console.error('Phone verification failed:', error);
            alert('Verification failed. Please check your code.');
        }
    };

    if (profileLoading) {
        return (
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8 bg-white">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                    <span className="ml-2">{t('common.loading')}</span>
                </div>
            </div>
        );
    }

    if (profileError) {
        return (
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8 bg-white">
                <div className="py-8">
                    <div className="text-center text-red-600">
                        Failed to load profile data. Please refresh the page.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 bg-white">
            <div className="pb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-stone-800 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100">
                        <Shield className="w-6 h-6 text-amber-700" />
                    </div>
                    {t('profile.account-settings')}
                </h2>
                <p className="text-stone-600 mt-2">
                    {t('profile.account-settings-description')}
                </p>
            </div>

            <div>
                <Tabs defaultValue="personal" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto p-1 bg-stone-100 rounded-xl">
                        <TabsTrigger
                            value="personal"
                            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-3"
                        >
                            <User className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('profile.personal-info')}</span>
                            <span className="sm:hidden">{t('profile.personal-info')}</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="security"
                            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-3"
                        >
                            <Lock className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('profile.security')}</span>
                            <span className="sm:hidden">{t('profile.security')}</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="preferences"
                            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-3"
                        >
                            <Bell className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('profile.preferences')}</span>
                            <span className="sm:hidden">{t('profile.preferences')}</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Personal Information Tab */}
                    <TabsContent value="personal" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="flex items-center gap-2 text-stone-700">
                                    <User className="w-4 h-4" />
                                    {t('profile.first-name')}
                                </Label>
                                <Input
                                    id="firstName"
                                    value={userSettings.firstName}
                                    onChange={(e) => setUserSettings(prev => ({ ...prev, firstName: e.target.value }))}
                                    className="rounded-lg border-stone-200 focus:border-amber-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="flex items-center gap-2 text-stone-700">
                                    <User className="w-4 h-4" />
                                    {t('profile.last-name')}
                                </Label>
                                <Input
                                    id="lastName"
                                    value={userSettings.lastName}
                                    onChange={(e) => setUserSettings(prev => ({ ...prev, lastName: e.target.value }))}
                                    className="rounded-lg border-stone-200 focus:border-amber-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2 text-stone-700">
                                    <Mail className="w-4 h-4" />
                                    {t('profile.email')}
                                    {profile?.isVerified ? (
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4 text-orange-500" />
                                    )}
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="email"
                                        type="email"
                                        value={userSettings.email}
                                        onChange={(e) => setUserSettings(prev => ({ ...prev, email: e.target.value }))}
                                        className="rounded-lg border-stone-200 focus:border-amber-400 flex-1"
                                    />
                                    {!profile?.isVerified && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleEmailVerification}
                                            disabled={false}
                                            className="px-3 py-2 text-xs"
                                        >
                                            {t('profile.verify-email')}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="flex items-center gap-2 text-stone-700">
                                    <Phone className="w-4 h-4" />
                                    {t('profile.phone')}
                                    {profile?.isPhoneVerified ? (
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4 text-orange-500" />
                                    )}
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="phone"
                                        value={userSettings.phoneNumber}
                                        onChange={(e) => setUserSettings(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                        className="rounded-lg border-stone-200 focus:border-amber-400 flex-1"
                                    />
                                    {!profile?.isPhoneVerified && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handlePhoneVerification}
                                            disabled={phoneVerificationLoading}
                                            className="px-3 py-2 text-xs"
                                        >
                                            {phoneVerificationLoading ? (
                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-600" />
                                            ) : (
                                                t('profile.verify-phone')
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="location" className="flex items-center gap-2 text-stone-700">
                                    <MapPin className="w-4 h-4" />
                                    {t('profile.location')}
                                </Label>
                                <Input
                                    id="location"
                                    value={userSettings.location}
                                    onChange={(e) => setUserSettings(prev => ({ ...prev, location: e.target.value }))}
                                    className="rounded-lg border-stone-200 focus:border-amber-400"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="bio" className="text-stone-700">
                                    {t('profile.bio')}
                                </Label>
                                <Textarea
                                    id="bio"
                                    value={userSettings.bio}
                                    onChange={(e) => setUserSettings(prev => ({ ...prev, bio: e.target.value }))}
                                    className="rounded-lg border-stone-200 focus:border-amber-400 min-h-[100px]"
                                    placeholder={t('profile.bio-placeholder')}
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleSavePersonalInfo}
                            disabled={updateProfileLoading}
                            className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-8 py-3 rounded-xl"
                        >
                            {updateProfileLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            {t('profile.save-info')}
                        </Button>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-6">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-stone-800">{t('profile.change-password')}</h4>

                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword" className="text-stone-700">
                                        {t('profile.current-password')}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="currentPassword"
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={passwords.current}
                                            onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                                            className="rounded-lg border-stone-200 focus:border-amber-400 pr-12"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-auto"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword" className="text-stone-700">
                                            {t('profile.new-password')}
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="newPassword"
                                                type={showNewPassword ? "text" : "password"}
                                                value={passwords.new}
                                                onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                                                className="rounded-lg border-stone-200 focus:border-amber-400 pr-12"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-auto"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-stone-700">
                                            {t('profile.confirm-password')}
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={passwords.confirm}
                                                onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                                                className="rounded-lg border-stone-200 focus:border-amber-400 pr-12"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-auto"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleChangePassword}
                                disabled={changePasswordLoading}
                                className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-xl"
                            >
                                {changePasswordLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                ) : (
                                    <Lock className="w-4 h-4 mr-2" />
                                )}
                                {t('profile.change-password-btn')}
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Preferences Tab */}
                    <TabsContent value="preferences" className="space-y-6">
                        <div className="space-y-6">
                            {/* Language & Theme */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-stone-700">
                                        <Globe className="w-4 h-4" />
                                        {t('profile.language')}
                                    </Label>
                                    <Select
                                        value={userSettings.preferredLanguage}
                                        onValueChange={handleLanguageChange}
                                    >
                                        <SelectTrigger className="rounded-lg border-stone-200 focus:border-amber-400">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="tr">{t('profile.turkish')}</SelectItem>
                                            <SelectItem value="en">{t('profile.english')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-stone-700">
                                        <Palette className="w-4 h-4" />
                                        {t('profile.theme')}
                                    </Label>
                                    <Select
                                        value={userSettings.themePreference}
                                        onValueChange={(value) => setUserSettings(prev => ({ ...prev, themePreference: value }))}
                                    >
                                        <SelectTrigger className="rounded-lg border-stone-200 focus:border-amber-400">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="light">{t('profile.light-theme')}</SelectItem>
                                            <SelectItem value="dark">{t('profile.dark-theme')}</SelectItem>
                                            <SelectItem value="auto">{t('profile.auto-theme')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Notifications */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                                    <Bell className="w-5 h-5" />
                                    {t('profile.notification-preferences')}
                                </h4>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-stone-50 border border-stone-200">
                                        <div>
                                            <div className="font-medium text-stone-800">{t('profile.email-notifications')}</div>
                                            <div className="text-sm text-stone-600">{t('profile.email-notifications-desc')}</div>
                                        </div>
                                        <Switch
                                            checked={userSettings.emailNotificationsEnabled}
                                            onCheckedChange={(checked) => setUserSettings(prev => ({ ...prev, emailNotificationsEnabled: checked }))}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-stone-50 border border-stone-200">
                                        <div>
                                            <div className="font-medium text-stone-800">{t('profile.sms-notifications')}</div>
                                            <div className="text-sm text-stone-600">{t('profile.sms-notifications-desc')}</div>
                                        </div>
                                        <Switch
                                            checked={userSettings.smsNotificationsEnabled}
                                            onCheckedChange={(checked) => setUserSettings(prev => ({ ...prev, smsNotificationsEnabled: checked }))}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-stone-50 border border-stone-200">
                                        <div>
                                            <div className="font-medium text-stone-800">{t('profile.new-listing-alerts')}</div>
                                            <div className="text-sm text-stone-600">{t('profile.new-listing-alerts-desc')}</div>
                                        </div>
                                        <Switch
                                            checked={userSettings.newListingAlertsEnabled}
                                            onCheckedChange={(checked) => setUserSettings(prev => ({ ...prev, newListingAlertsEnabled: checked }))}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-stone-50 border border-stone-200">
                                        <div>
                                            <div className="font-medium text-stone-800">{t('profile.price-change-alerts')}</div>
                                            <div className="text-sm text-stone-600">{t('profile.price-change-alerts-desc')}</div>
                                        </div>
                                        <Switch
                                            checked={userSettings.priceChangeAlertsEnabled}
                                            onCheckedChange={(checked) => setUserSettings(prev => ({ ...prev, priceChangeAlertsEnabled: checked }))}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-stone-50 border border-stone-200">
                                        <div>
                                            <div className="font-medium text-stone-800">{t('profile.marketing-emails')}</div>
                                            <div className="text-sm text-stone-600">{t('profile.marketing-emails-desc')}</div>
                                        </div>
                                        <Switch
                                            checked={userSettings.marketingEmailsEnabled}
                                            onCheckedChange={(checked) => setUserSettings(prev => ({ ...prev, marketingEmailsEnabled: checked }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleSavePreferences}
                                disabled={updatePreferencesLoading}
                                className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-8 py-3 rounded-xl"
                            >
                                {updatePreferencesLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                {t('profile.save-preferences')}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
<<<<<<< Updated upstream
            </div>
        </div>
=======

                {/* Phone Verification Modal */}
                {showPhoneVerificationModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                            <div className="text-center mb-6">
                                <Phone className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-stone-800 mb-2">
                                    Telefon Doğrulama
                                </h3>
                                <p className="text-stone-600">
                                    {userSettings.phoneNumber} numarasına gönderilen doğrulama kodunu girin
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="verificationCode" className="text-stone-700">
                                        Doğrulama Kodu
                                    </Label>
                                    <Input
                                        id="verificationCode"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        placeholder="6 haneli kodu girin"
                                        className="rounded-lg border-stone-200 focus:border-amber-400 text-center text-lg tracking-widest"
                                        maxLength={6}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowPhoneVerificationModal(false);
                                            setVerificationCode('');
                                        }}
                                        className="flex-1"
                                    >
                                        İptal
                                    </Button>
                                    <Button
                                        onClick={handleVerifyPhoneCode}
                                        disabled={verifyPhoneLoading || verificationCode.length !== 6}
                                        className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white"
                                    >
                                        {verifyPhoneLoading ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                        ) : (
                                            'Doğrula'
                                        )}
                                    </Button>
                                </div>

                                <Button
                                    variant="ghost"
                                    onClick={handlePhoneVerification}
                                    disabled={phoneVerificationLoading}
                                    className="w-full text-amber-600 hover:text-amber-700"
                                >
                                    {phoneVerificationLoading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600 mr-2" />
                                    ) : (
                                        'Kodu Tekrar Gönder'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
>>>>>>> Stashed changes
    );
};

export default AccountSettings;