// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from './api/authApi';
import { propertyApi } from './api/propertyApi';
import { adminApi } from './api/adminApi';
import { userApi } from './api/userApi';
import { favoriteApi } from './api/favoriteApi';
import { commentApi } from './api/commentApi';
import { messageApi } from './api/messageApi';
import { fileUploadApi } from './api/fileUploadApi';
import { complaintApi } from './api/complaintApi';
import { notificationApi } from './api/notificationApi';
import { pappSellableRequestApi } from './api/pappSellableRequestApi';
import authReducer from './slices/authSlice';
import listingPreviewReducer from './slices/listingPreviewSlice'; // Yeni slice import

export const store = configureStore({
    reducer: {
        auth: authReducer,
        listingPreview: listingPreviewReducer, // Yeni slice eklendi
        [authApi.reducerPath]: authApi.reducer,
        [propertyApi.reducerPath]: propertyApi.reducer,
        [adminApi.reducerPath]: adminApi.reducer,
        [userApi.reducerPath]: userApi.reducer,
        [favoriteApi.reducerPath]: favoriteApi.reducer,
        [commentApi.reducerPath]: commentApi.reducer,
        [messageApi.reducerPath]: messageApi.reducer,
        [fileUploadApi.reducerPath]: fileUploadApi.reducer,
        [complaintApi.reducerPath]: complaintApi.reducer,
        [notificationApi.reducerPath]: notificationApi.reducer,
        [pappSellableRequestApi.reducerPath]: pappSellableRequestApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authApi.middleware,
            propertyApi.middleware,
            adminApi.middleware,
            userApi.middleware,
            favoriteApi.middleware,
            commentApi.middleware,
            messageApi.middleware,
            fileUploadApi.middleware,
            complaintApi.middleware,
            notificationApi.middleware,
            pappSellableRequestApi.middleware
        ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;