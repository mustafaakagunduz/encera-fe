// src/store/slices/listingPreviewSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PropertyCreateRequest } from '../api/propertyApi';

interface ListingPreviewState {
    previewData: PropertyCreateRequest | null;
    isPreviewMode: boolean;
}

const initialState: ListingPreviewState = {
    previewData: null,
    isPreviewMode: false,
};

const listingPreviewSlice = createSlice({
    name: 'listingPreview',
    initialState,
    reducers: {
        setListingPreviewData: (state, action: PayloadAction<PropertyCreateRequest>) => {
            state.previewData = action.payload;
            state.isPreviewMode = true;
        },
        clearListingPreviewData: (state) => {
            state.previewData = null;
            state.isPreviewMode = false;
        },
        updateListingPreviewData: (state, action: PayloadAction<Partial<PropertyCreateRequest>>) => {
            if (state.previewData) {
                state.previewData = { ...state.previewData, ...action.payload };
            }
        },
    },
});

export const {
    setListingPreviewData,
    clearListingPreviewData,
    updateListingPreviewData,
} = listingPreviewSlice.actions;

export default listingPreviewSlice.reducer;

// Selectors
export const selectListingPreviewData = (state: { listingPreview: ListingPreviewState }) =>
    state.listingPreview.previewData;

export const selectIsPreviewMode = (state: { listingPreview: ListingPreviewState }) =>
    state.listingPreview.isPreviewMode;