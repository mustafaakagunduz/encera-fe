import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

const baseUrl = process.env.NODE_ENV === 'production'
  ? 'https://your-production-api.com/api'
  : 'http://localhost:8081/api';

export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  bio?: string;
  location?: string;
  profilePictureUrl?: string;
  coverImageUrl?: string;
  isVerified: boolean;
  isPhoneVerified: boolean;
  preferredLanguage: string;
  themePreference: string;
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  newListingAlertsEnabled: boolean;
  priceChangeAlertsEnabled: boolean;
  marketingEmailsEnabled: boolean;
}

export interface ProfileUpdateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  bio?: string;
  location?: string;
}

export interface UserPreferencesUpdateRequest {
  preferredLanguage?: string;
  themePreference?: string;
  emailNotificationsEnabled?: boolean;
  smsNotificationsEnabled?: boolean;
  newListingAlertsEnabled?: boolean;
  priceChangeAlertsEnabled?: boolean;
  marketingEmailsEnabled?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface PhoneVerificationRequest {
  phoneNumber: string;
}

export interface PhoneVerificationCodeRequest {
  phoneNumber: string;
  verificationCode: string;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface ProfileReview {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  profileOwnerId: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
  isHelpful?: boolean;
}

export interface CreateReviewRequest {
  profileOwnerId: number;
  rating: number;
  comment: string;
}

export interface ReviewStatsResponse {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/user`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Review'],
  endpoints: (builder) => ({
    // Get current user profile
    getProfile: builder.query<UserProfile, void>({
      query: () => '/profile',
      providesTags: ['User'],
    }),

    // Get user by ID
    getUserById: builder.query<UserProfile, number>({
      query: (userId) => `/${userId}`,
      providesTags: ['User'],
    }),

    // Update profile information
    updateProfile: builder.mutation<UserProfile, ProfileUpdateRequest>({
      query: (profileData) => ({
        url: '/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),

    // Update user preferences
    updatePreferences: builder.mutation<UserProfile, UserPreferencesUpdateRequest>({
      query: (preferences) => ({
        url: '/preferences',
        method: 'PUT',
        body: preferences,
      }),
      invalidatesTags: ['User'],
    }),

    // Change password
    changePassword: builder.mutation<ApiResponse<null>, ChangePasswordRequest>({
      query: (passwordData) => ({
        url: '/change-password',
        method: 'POST',
        body: passwordData,
      }),
    }),

    // Send phone verification code
    sendPhoneVerification: builder.mutation<ApiResponse<null>, PhoneVerificationRequest>({
      query: (phoneData) => ({
        url: '/send-phone-verification',
        method: 'POST',
        body: phoneData,
      }),
    }),

    // Verify phone with code
    verifyPhone: builder.mutation<ApiResponse<null>, PhoneVerificationCodeRequest>({
      query: (verificationData) => ({
        url: '/verify-phone',
        method: 'POST',
        body: verificationData,
      }),
      invalidatesTags: ['User'],
    }),

    // Upload profile picture
    uploadProfilePicture: builder.mutation<ApiResponse<null>, { profilePictureUrl: string }>({
      query: (data) => ({
        url: '/upload-profile-picture',
        method: 'POST',
        params: { profilePictureUrl: data.profilePictureUrl },
      }),
      invalidatesTags: ['User'],
    }),

    // Upload cover image
    uploadCoverImage: builder.mutation<ApiResponse<null>, { coverImageUrl: string }>({
      query: (data) => ({
        url: '/upload-cover-image',
        method: 'POST',
        params: { coverImageUrl: data.coverImageUrl },
      }),
      invalidatesTags: ['User'],
    }),

    // Get reviews for a profile
    getProfileReviews: builder.query<ProfileReview[], number>({
      query: (profileOwnerId) => `/profile/${profileOwnerId}/reviews`,
      providesTags: ['Review'],
    }),

    // Get review statistics for a profile
    getReviewStats: builder.query<ReviewStatsResponse, number>({
      query: (profileOwnerId) => `/profile/${profileOwnerId}/review-stats`,
      providesTags: ['Review'],
    }),

    // Create a new review
    createReview: builder.mutation<ApiResponse<ProfileReview>, CreateReviewRequest>({
      query: (reviewData) => ({
        url: '/reviews',
        method: 'POST',
        body: reviewData,
      }),
      invalidatesTags: ['Review'],
    }),

    // Mark review as helpful/unhelpful
    markReviewHelpful: builder.mutation<ApiResponse<null>, { reviewId: string; helpful: boolean }>({
      query: (data) => ({
        url: `/reviews/${data.reviewId}/helpful`,
        method: 'POST',
        body: { helpful: data.helpful },
      }),
      invalidatesTags: ['Review'],
    }),

    // Report a review
    reportReview: builder.mutation<ApiResponse<null>, { reviewId: string; reason: string }>({
      query: (data) => ({
        url: `/reviews/${data.reviewId}/report`,
        method: 'POST',
        body: { reason: data.reason },
      }),
    }),
  }),
});

export const {
  useGetProfileQuery,
  useGetUserByIdQuery,
  useUpdateProfileMutation,
  useUpdatePreferencesMutation,
  useChangePasswordMutation,
  useSendPhoneVerificationMutation,
  useVerifyPhoneMutation,
  useUploadProfilePictureMutation,
  useUploadCoverImageMutation,
  useGetProfileReviewsQuery,
  useGetReviewStatsQuery,
  useCreateReviewMutation,
  useMarkReviewHelpfulMutation,
  useReportReviewMutation,
} = userApi;