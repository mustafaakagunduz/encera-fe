'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Star, ThumbsUp, MessageCircle, Send, Flag, ChevronDown, ChevronUp } from 'lucide-react';
import {
    useGetProfileReviewsQuery,
    useGetReviewStatsQuery,
    useCreateReviewMutation,
    useMarkReviewHelpfulMutation,
    useReportReviewMutation,
    ProfileReview
} from '@/store/api/userApi';

interface ProfileReviewsProps {
    isOwnProfile?: boolean;
    profileOwnerId: string;
}

const ProfileReviews: React.FC<ProfileReviewsProps> = ({
    isOwnProfile = false,
    profileOwnerId
}) => {
    const { t } = useTranslation();
    const [showAddReview, setShowAddReview] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

    // API queries
    const { data: reviews = [], isLoading: reviewsLoading, error: reviewsError } = useGetProfileReviewsQuery(profileOwnerId);
    const { data: reviewStats, isLoading: statsLoading } = useGetReviewStatsQuery(profileOwnerId);

    // API mutations
    const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();
    const [markHelpful] = useMarkReviewHelpfulMutation();
    const [reportReview] = useReportReviewMutation();

    const averageRating = reviewStats?.averageRating || 0;
    const totalReviews = reviewStats?.totalReviews || 0;

    const handleSubmitReview = async () => {
        if (!newReview.comment.trim() || isCreating) return;

        try {
            await createReview({
                profileOwnerId,
                rating: newReview.rating,
                comment: newReview.comment.trim()
            }).unwrap();

            setNewReview({ rating: 5, comment: '' });
            setShowAddReview(false);
        } catch (error) {
            console.error('Failed to submit review:', error);
        }
    };

    const handleMarkHelpful = async (reviewId: string, helpful: boolean) => {
        try {
            await markHelpful({ reviewId, helpful }).unwrap();
        } catch (error) {
            console.error('Failed to mark review as helpful:', error);
        }
    };

    const handleReportReview = async (reviewId: string, reason: string = 'inappropriate') => {
        try {
            await reportReview({ reviewId, reason }).unwrap();
        } catch (error) {
            console.error('Failed to report review:', error);
        }
    };

    const toggleExpanded = (reviewId: string) => {
        const newExpanded = new Set(expandedReviews);
        if (newExpanded.has(reviewId)) {
            newExpanded.delete(reviewId);
        } else {
            newExpanded.add(reviewId);
        }
        setExpandedReviews(newExpanded);
    };

    const renderStars = (rating: number, size = 'w-4 h-4') => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`${size} ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
            />
        ));
    };

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 bg-white overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 pb-8 px-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            {t('profile.reviews-and-comments')}
                        </h2>
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-2">
                                {renderStars(Math.round(averageRating), 'w-5 h-5')}
                                <span className="text-2xl font-bold text-slate-800">{averageRating.toFixed(1)}</span>
                            </div>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                                {totalReviews} {t('profile.reviews')}
                            </Badge>
                        </div>
                    </div>

                    {!isOwnProfile && (
                        <Button
                            onClick={() => setShowAddReview(!showAddReview)}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg"
                        >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            {t('profile.add-review')}
                        </Button>
                    )}
                </div>
            </div>

            <div className="p-8">
                {/* Add Review Form */}
                {showAddReview && !isOwnProfile && (
                    <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/30">
                        <h3 className="text-xl font-semibold text-slate-800 mb-4">
                            {t('profile.write-review')}
                        </h3>

                        {/* Rating Selector */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {t('profile.rating')}
                            </label>
                            <div className="flex items-center gap-2">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setNewReview(prev => ({ ...prev, rating: i + 1 }))}
                                        className="transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`w-8 h-8 ${
                                                i < newReview.rating
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'text-gray-300 hover:text-amber-300'
                                            }`}
                                        />
                                    </button>
                                ))}
                                <span className="ml-2 text-lg font-semibold text-slate-700">
                                    {newReview.rating}/5
                                </span>
                            </div>
                        </div>

                        {/* Comment Input */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {t('profile.your-comment')}
                            </label>
                            <Textarea
                                value={newReview.comment}
                                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                                placeholder={t('profile.comment-placeholder')}
                                className="min-h-[120px] border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleSubmitReview}
                                disabled={!newReview.comment.trim() || isCreating}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                {isCreating ? t('common.submitting') : t('profile.submit-review')}
                            </Button>
                            <Button
                                onClick={() => setShowAddReview(false)}
                                variant="outline"
                                className="border-slate-300 text-slate-700 hover:bg-slate-50"
                            >
                                {t('common.cancel')}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                    {reviews.map((review) => {
                        const isExpanded = expandedReviews.has(review.id);
                        const shouldTruncate = review.comment.length > 200;
                        const displayComment = shouldTruncate && !isExpanded
                            ? review.comment.substring(0, 200) + '...'
                            : review.comment;

                        return (
                            <div
                                key={review.id}
                                className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <div className="flex items-start gap-4">
                                    <Avatar className="w-12 h-12 border-2 border-slate-200">
                                        <AvatarImage src={review.authorAvatar} alt={review.authorName} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold">
                                            {review.authorName.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <h4 className="font-semibold text-slate-800">
                                                    {review.authorName}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {renderStars(review.rating)}
                                                    <span className="text-sm text-slate-500">
                                                        {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                                                    </span>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={() => handleReportReview(review.id)}
                                                variant="ghost"
                                                size="sm"
                                                className="text-slate-400 hover:text-slate-600"
                                            >
                                                <Flag className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <p className="text-slate-700 leading-relaxed mb-4">
                                            {displayComment}
                                        </p>

                                        {shouldTruncate && (
                                            <Button
                                                onClick={() => toggleExpanded(review.id)}
                                                variant="ghost"
                                                size="sm"
                                                className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
                                            >
                                                {isExpanded ? (
                                                    <>
                                                        <ChevronUp className="w-4 h-4 mr-1" />
                                                        {t('common.show-less')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown className="w-4 h-4 mr-1" />
                                                        {t('common.show-more')}
                                                    </>
                                                )}
                                            </Button>
                                        )}

                                        <div className="flex items-center gap-4 mt-4">
                                            <Button
                                                onClick={() => handleMarkHelpful(review.id, !review.isHelpful)}
                                                variant="ghost"
                                                size="sm"
                                                className={`text-slate-500 hover:text-blue-600 transition-colors ${
                                                    review.isHelpful ? 'text-blue-600 bg-blue-50' : ''
                                                }`}
                                            >
                                                <ThumbsUp className="w-4 h-4 mr-2" />
                                                {t('profile.helpful')} ({review.helpful})
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {reviews.length === 0 && (
                    <div className="text-center py-12">
                        <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-600 mb-2">
                            {t('profile.no-reviews-yet')}
                        </h3>
                        <p className="text-slate-500">
                            {isOwnProfile
                                ? t('profile.no-reviews-own')
                                : t('profile.no-reviews-other')
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileReviews;