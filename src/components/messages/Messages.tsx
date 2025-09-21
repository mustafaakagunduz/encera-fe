'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    useGetUserConversationsQuery,
    useGetConversationQuery,
    useSendMessageMutation,
    useMarkConversationAsReadMutation,
    useDeleteMessageMutation,
    useDeleteConversationMutation,
    ConversationResponse,
    MessageResponse
} from '@/store/api/messageApi';
import { useGetUserByIdQuery } from '@/store/api/userApi';
import { useGetPropertyByIdQuery } from '@/store/api/propertyApi';
import {
    MessageSquare,
    Send,
    ArrowLeft,
    User,
    Home,
    Clock,
    Trash2,
    MoreVertical,
    Search
} from 'lucide-react';
import Link from 'next/link';
import { getMessageUserId, isEnceraUser } from '@/utils/profileHelpers';

export const Messages: React.FC = () => {
    const { user } = useAuth();
    const { t, isReady } = useAppTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();

    // URL parametrelerini al
    const preselectedUserId = searchParams.get('userId');
    const propertyId = searchParams.get('propertyId');

    const [selectedConversation, setSelectedConversation] = React.useState<number | null>(
        preselectedUserId ? parseInt(preselectedUserId) : null
    );
    const [newMessage, setNewMessage] = React.useState('');
    const [searchTerm, setSearchTerm] = React.useState('');
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    // API hooks
    const { data: conversations = [], isLoading: conversationsLoading, refetch: refetchConversations } = useGetUserConversationsQuery();
    const { data: messages = [], isLoading: messagesLoading, refetch: refetchMessages } = useGetConversationQuery(
        selectedConversation!,
        { skip: !selectedConversation }
    );
    const { data: selectedUser } = useGetUserByIdQuery(
        selectedConversation!,
        { skip: !selectedConversation }
    );
    const [sendMessage, { isLoading: sendingMessage }] = useSendMessageMutation();
    const [markAsRead] = useMarkConversationAsReadMutation();
    const [deleteMessage] = useDeleteMessageMutation();
    const [deleteConversation] = useDeleteConversationMutation();

    // Preselected user için kullanıcı bilgilerini çek
    const { data: preselectedUser } = useGetUserByIdQuery(
        parseInt(preselectedUserId!),
        { skip: !preselectedUserId }
    );

    // Property bilgisini çek (propertyId varsa)
    const { data: propertyData } = useGetPropertyByIdQuery(
        parseInt(propertyId!),
        { skip: !propertyId }
    );

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Login kontrolü
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {isReady ? 'Mesajlara Erişim' : 'Access Messages'}
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {isReady ? 'Mesajları görüntülemek için giriş yapmanız gerekiyor.' : 'You need to login to view messages.'}
                    </p>
                    <Link
                        href="/auth/login"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        {isReady ? 'Giriş Yap' : 'Login'}
                    </Link>
                </div>
            </div>
        );
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedConversation || !newMessage.trim()) return;

        // İlk mesaj olup olmadığını kontrol et
        const isFirstMessage = messages.length === 0;
        let messageContent = newMessage.trim();

        // Eğer ilk mesajsa ve propertyData varsa, ilan bilgisini ekle
        if (isFirstMessage && propertyData) {
            messageContent = `🏠 ${propertyData.title} hakkında:\n\n${messageContent}`;
        }

        console.log('Sending message:', {
            receiverId: selectedConversation,
            content: messageContent,
            propertyId: propertyId ? parseInt(propertyId) : undefined
        });

        try {
            const result = await sendMessage({
                receiverId: selectedConversation,
                content: messageContent,
                propertyId: propertyId ? parseInt(propertyId) : undefined
            }).unwrap();

            console.log('Message sent successfully:', result);
            setNewMessage('');
            // Mesajları yeniden yükle
            await refetchMessages();
            await refetchConversations();
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Error sending message:', error);
            // Detaylı hata bilgisi
            if (error && typeof error === 'object' && 'status' in error) {
                console.error('Error status:', error.status);
                console.error('Error data:', (error as any).data);
            }
        }
    };

    const handleConversationSelect = async (conversationUserId: number) => {
        // Encera kullanıcısını kontrol et ve gerekirse ID'yi değiştir
        const actualUserId = getMessageUserId({ id: conversationUserId });
        setSelectedConversation(actualUserId);

        // Mark conversation as read
        try {
            await markAsRead(actualUserId);
        } catch (error) {
            console.error('Error marking conversation as read:', error);
        }
    };

    const formatMessageTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
        }
    };

    const handleDeleteMessage = async (messageId: number) => {
        if (window.confirm(isReady ? 'Bu mesajı silmek istediğinizden emin misiniz?' : 'Are you sure you want to delete this message?')) {
            try {
                await deleteMessage(messageId).unwrap();
                refetchMessages();
            } catch (error) {
                console.error('Error deleting message:', error);
            }
        }
    };

    const handleDeleteConversation = async (otherUserId: number) => {
        if (window.confirm(isReady ? 'Bu konuşmayı silmek istediğinizden emin misiniz?' : 'Are you sure you want to delete this conversation?')) {
            try {
                await deleteConversation(otherUserId).unwrap();
                refetchConversations();
                setSelectedConversation(null);
            } catch (error) {
                console.error('Error deleting conversation:', error);
            }
        }
    };

    // Filter conversations based on search
    const filteredConversations = conversations.filter(conversation =>
        conversation.otherUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => router.back()}
                                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <MessageSquare className="w-6 h-6 text-blue-600 mr-2" />
                            <h1 className="text-xl font-semibold text-gray-900">
                                {isReady ? 'Mesajlar' : 'Messages'}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow-sm border h-[600px] flex">
                    {/* Conversations List */}
                    <div className="w-1/3 border-r border-gray-200 flex flex-col">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="font-semibold text-gray-900 mb-3">
                                {isReady ? 'Konuşmalar' : 'Conversations'}
                            </h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder={isReady ? 'Konuşma ara...' : 'Search conversations...'}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {conversationsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                </div>
                            ) : filteredConversations.length === 0 && conversations.length === 0 && !preselectedUser ? (
                                <div className="text-center py-8 text-gray-500">
                                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">
                                        {isReady ? 'Henüz mesajınız yok' : 'No messages yet'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {/* Preselected user - yeni konuşma başlatma */}
                                    {preselectedUser && !conversations.find(c => c.otherUserId === parseInt(preselectedUserId!)) && (
                                        <button
                                            onClick={() => handleConversationSelect(parseInt(preselectedUserId!))}
                                            className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                                                selectedConversation === parseInt(preselectedUserId!)
                                                    ? 'bg-blue-50 border-r-2 border-blue-600'
                                                    : ''
                                            }`}
                                        >
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0 mr-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-white" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {preselectedUser.firstName} {preselectedUser.lastName}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-gray-600 truncate mt-1">
                                                        {isReady ? 'Yeni konuşma başlat' : 'Start new conversation'}
                                                    </p>
                                                    {(propertyData || propertyId) && (
                                                        <div className="mt-2">
                                                            <div className="flex items-center">
                                                                <Home className="w-3 h-3 text-gray-400 mr-1" />
                                                                <span className="text-xs text-gray-500 truncate">
                                                                    {propertyData?.title || (isReady ? `İlan #${propertyId}` : `Property #${propertyId}`)}
                                                                </span>
                                                            </div>
                                                            {propertyData && (
                                                                <div className="text-xs text-blue-600 mt-1 truncate">
                                                                    💰 {propertyData.price?.toLocaleString('tr-TR')} ₺ • 📍 {propertyData.district}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    )}

                                    {filteredConversations.length === 0 && searchTerm ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                            <p className="text-sm">
                                                {isReady ? 'Arama sonucu bulunamadı' : 'No results found'}
                                            </p>
                                        </div>
                                    ) : (
                                        filteredConversations.map((conversation) => (
                                        <button
                                            key={conversation.otherUserId}
                                            onClick={() => handleConversationSelect(conversation.otherUserId)}
                                            className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                                                selectedConversation === conversation.otherUserId
                                                    ? 'bg-blue-50 border-r-2 border-blue-600'
                                                    : ''
                                            }`}
                                        >
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0 mr-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-white" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {conversation.otherUserName}
                                                        </p>
                                                        <div className="flex items-center gap-1">
                                                            {conversation.hasUnreadMessages && (
                                                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                            )}
                                                            <span className="text-xs text-gray-500">
                                                                {formatMessageTime(conversation.lastMessageTime)}
                                                            </span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteConversation(conversation.otherUserId);
                                                                }}
                                                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                                title={isReady ? 'Konuşmayı sil' : 'Delete conversation'}
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 truncate mt-1">
                                                        {conversation.lastMessage}
                                                    </p>
                                                    {conversation.propertyTitle && (
                                                        <div className="flex items-center mt-2">
                                                            <Home className="w-3 h-3 text-gray-400 mr-1" />
                                                            <span className="text-xs text-gray-500 truncate">
                                                                {conversation.propertyTitle}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 flex flex-col">
                        {selectedConversation ? (
                            <>
                                {/* Messages Header */}
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {selectedUser && isEnceraUser(selectedUser) ? 'Encera' :
                                                 selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` :
                                                 preselectedUser && isEnceraUser(preselectedUser) ? 'Encera' :
                                                 preselectedUser ? `${preselectedUser.firstName} ${preselectedUser.lastName}` :
                                                 conversations.find(c => c.otherUserId === selectedConversation)?.otherUserName}
                                            </h3>
                                            {(conversations.find(c => c.otherUserId === selectedConversation)?.propertyTitle || propertyData?.title || propertyId) && (
                                                <div className="text-sm text-gray-500">
                                                    {conversations.find(c => c.otherUserId === selectedConversation)?.propertyTitle ||
                                                     propertyData?.title ||
                                                     (propertyId ? `İlan ID: ${propertyId}` : '')}
                                                    {propertyData && (
                                                        <div className="text-xs text-blue-600 mt-1">
                                                            🏠 {propertyData.price?.toLocaleString('tr-TR')} ₺ • {propertyData.district}, {propertyData.city}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messagesLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                            <p className="text-sm">
                                                {isReady ? 'Henüz mesaj yok' : 'No messages yet'}
                                            </p>
                                        </div>
                                    ) : (
                                        messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${
                                                    message.senderId === user.id ? 'justify-end' : 'justify-start'
                                                } group`}
                                            >
                                                <div className={`flex items-start gap-2 ${message.senderId === user.id ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    <div
                                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                            message.senderId === user.id
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-gray-100 text-gray-900'
                                                        }`}
                                                    >
                                                        <p className="text-sm">{message.content}</p>
                                                        <div className="flex items-center justify-between mt-1">
                                                            <span
                                                                className={`text-xs ${
                                                                    message.senderId === user.id
                                                                        ? 'text-blue-100'
                                                                        : 'text-gray-500'
                                                                }`}
                                                            >
                                                                {formatMessageTime(message.createdAt)}
                                                            </span>
                                                            {message.senderId === user.id && (
                                                                <span
                                                                    className={`text-xs ${
                                                                        message.isRead ? 'text-blue-100' : 'text-blue-200'
                                                                    }`}
                                                                >
                                                                    {message.isRead ? '✓✓' : '✓'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteMessage(message.id)}
                                                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                                                        title={isReady ? 'Mesajı sil' : 'Delete message'}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <div className="border-t border-gray-200 p-4">
                                    <form onSubmit={handleSendMessage} className="flex space-x-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder={isReady ? 'Mesajınızı yazın...' : 'Type your message...'}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            disabled={sendingMessage}
                                        />
                                        <button
                                            type="submit"
                                            disabled={sendingMessage || !newMessage.trim()}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium text-gray-400">
                                        {isReady ? 'Bir konuşma seçin' : 'Select a conversation'}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {isReady
                                            ? 'Soldaki listeden bir konuşma seçin veya yeni bir mesaj başlatın'
                                            : 'Choose a conversation from the list or start a new message'
                                        }
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};