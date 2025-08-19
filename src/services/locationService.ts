// src/services/locationService.ts
export interface City {
    id: number | string;
    name: string;
    plate_code?: string;
}

export interface District {
    id: number | string;
    name: string;
    provinceId: number | string;
}

export interface Neighborhood {
    id: number | string;
    name: string;
    districtId: number | string;
}

const TURKEY_API_BASE = 'https://turkiyeapi.dev/api/v1';

// Türkçe güvenli normalize fonksiyonu
const normalize = (str: string): string => str.trim().toLocaleLowerCase('tr');

class LocationService {
    // İlleri getir
    async getCities(): Promise<City[]> {
        try {
            const response = await fetch(`${TURKEY_API_BASE}/provinces?fields=id,name&sort=name&limit=1000`);
            if (!response.ok) {
                throw new Error('İller yüklenirken hata oluştu');
            }
            const data = await response.json();
            return data?.data || [];
        } catch (error) {
            console.error('Cities fetch error:', error);
            throw new Error('İller yüklenirken hata oluştu');
        }
    }

    // İlçeleri getir
    async getDistricts(cityId: number | string): Promise<District[]> {
        try {
            if (cityId === null || cityId === undefined || cityId === '') {
                console.warn('[getDistricts] cityId geçersiz:', cityId);
                return [];
            }

            const url = new URL(`${TURKEY_API_BASE}/districts`);
            url.searchParams.set('provinceId', String(cityId));
            url.searchParams.set('fields', 'id,name,provinceId');
            url.searchParams.set('sort', 'name');
            url.searchParams.set('limit', '1000');

            console.log('[getDistricts] URL:', url.toString());

            const response = await fetch(url.toString());

            if (!response.ok) {
                let body: any = null;
                try { body = await response.json(); } catch { /* yoksay */ }
                console.error('[getDistricts] HTTP error', response.status, body);
                throw new Error('İlçeler yüklenirken hata oluştu');
            }

            const data = await response.json();
            const arr = Array.isArray(data?.data) ? data.data : [];
            return arr;
        } catch (error) {
            console.error('Districts fetch error:', error);
            throw new Error('İlçeler yüklenirken hata oluştu');
        }
    }

    // Mahalleleri getir
    async getNeighborhoods(districtId: number | string): Promise<Neighborhood[]> {
        try {
            if (districtId === null || districtId === undefined || districtId === '') {
                console.warn('[getNeighborhoods] districtId geçersiz:', districtId);
                return [];
            }

            const url = new URL(`${TURKEY_API_BASE}/neighborhoods`);
            url.searchParams.set('districtId', String(districtId));
            url.searchParams.set('fields', 'id,name');
            url.searchParams.set('sort', 'name');
            url.searchParams.set('limit', '1000');

            console.log('[getNeighborhoods] URL:', url.toString());

            const response = await fetch(url.toString());

            if (!response.ok) {
                let body: any = null;
                try { body = await response.json(); } catch { /* yoksay */ }
                console.error('[getNeighborhoods] HTTP error', response.status, body);
                throw new Error('Mahalleler yüklenirken hata oluştu');
            }

            const data = await response.json();
            const arr = Array.isArray(data?.data) ? data.data : [];
            return arr;
        } catch (error) {
            console.error('Neighborhoods fetch error:', error);
            throw new Error('Mahalleler yüklenirken hata oluştu');
        }
    }

    // İl adıyla şehir bul
    async getCityByName(cityName: string): Promise<City | null> {
        try {
            const cities = await this.getCities();
            return cities.find(city =>
                normalize(city.name) === normalize(cityName)
            ) || null;
        } catch (error) {
            console.error('City search error:', error);
            return null;
        }
    }

    // İlçe adıyla ilçe bul
    async getDistrictByName(cityId: number | string, districtName: string): Promise<District | null> {
        try {
            const districts = await this.getDistricts(cityId);
            return districts.find(district =>
                normalize(district.name) === normalize(districtName)
            ) || null;
        } catch (error) {
            console.error('District search error:', error);
            return null;
        }
    }

    // Mahalle adıyla mahalle bul
    async getNeighborhoodByName(districtId: number | string, neighborhoodName: string): Promise<Neighborhood | null> {
        try {
            const neighborhoods = await this.getNeighborhoods(districtId);
            return neighborhoods.find(neighborhood =>
                normalize(neighborhood.name) === normalize(neighborhoodName)
            ) || null;
        } catch (error) {
            console.error('Neighborhood search error:', error);
            return null;
        }
    }
}

export const locationService = new LocationService();