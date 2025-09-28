// src/services/smartSearchService.ts
export interface SmartSearchResponse {
  originalQuery: string;
  detectedCategory: 'RESIDENTIAL' | 'COMMERCIAL' | 'LAND' | 'DAILY_RENTAL';
  locationKeywords: string[];
  ftsQuery: string;
  totalResults: number;
  searchTimeMs: number;
  results: {
    content: PropertySummary[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  };
  searchAnalysis: {
    originalQuery: string;
    detectedCategory: string;
    locationKeywords: string[];
    ftsQuery: string;
  };
}

export interface PropertySummary {
  id: number;
  title: string;
  city: string;
  district: string;
  neighborhood: string;
  price: number;
  propertyType: string;
  listingType: string;
  primaryImageUrl?: string;
  grossArea?: number;
  roomCount?: number;
  hallCount?: number;
  negotiable: boolean;
  featured: boolean;
  pappSellable: boolean;
  viewCount: number;
  createdAt: string;
}

export interface SmartSearchFilters {
  city?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
}

class SmartSearchService {
  private baseUrl: string;

  constructor() {
    // Next.js API proxy kullanıyoruz
    this.baseUrl = '/api/proxy';
  }

  /**
   * Smart search - Mevcut API ile geçici çözüm
   */
  async smartSearch(
    query: string,
    page: number = 0,
    size: number = 20
  ): Promise<SmartSearchResponse> {
    try {
      // Kategori tespiti (client-side)
      const detectedCategory = this.detectCategory(query);
      const locationKeywords = this.extractLocationKeywords(query);

      const params = new URLSearchParams({
        keyword: query,
        page: page.toString(),
        size: size.toString(),
      });

      // Mevcut API endpoint'ini kullan
      const response = await fetch(`${this.baseUrl}/properties/public/search?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Smart response formatına dönüştür
      return {
        originalQuery: query,
        detectedCategory: detectedCategory,
        locationKeywords: locationKeywords,
        ftsQuery: query,
        totalResults: data.totalElements || 0,
        searchTimeMs: 50, // Mock değer
        results: {
          content: this.mapBackendToPropertySummary(data.content || []),
          totalElements: data.totalElements || 0,
          totalPages: data.totalPages || 0,
          number: data.number || 0,
          size: data.size || 20,
        },
        searchAnalysis: {
          originalQuery: query,
          detectedCategory: detectedCategory,
          locationKeywords: locationKeywords,
          ftsQuery: query,
        }
      };
    } catch (error) {
      console.error('Smart search failed:', error);
      throw new Error(`Arama sırasında bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  }

  /**
   * Backend PropertySummaryResponse'i PropertySummary'ye dönüştür
   */
  private mapBackendToPropertySummary(backendData: any[]): PropertySummary[] {
    return backendData.map((item: any) => ({
      id: item.id,
      title: item.title,
      city: item.city,
      district: item.district,
      neighborhood: item.neighborhood || '',
      price: item.price,
      propertyType: item.propertyType,
      listingType: item.listingType,
      primaryImageUrl: item.primaryImageUrl,
      grossArea: item.grossArea,
      roomCount: item.roomConfiguration?.roomCount,
      hallCount: item.roomConfiguration?.hallCount,
      negotiable: item.negotiable || false,
      featured: item.featured || false,
      pappSellable: item.pappSellable || false,
      viewCount: item.viewCount || 0,
      createdAt: item.createdAt,
    }));
  }

  /**
   * Client-side kategori tespiti
   */
  private detectCategory(query: string): 'RESIDENTIAL' | 'COMMERCIAL' | 'LAND' | 'DAILY_RENTAL' {
    const konutKeywords = ['1+1', '2+1', '3+1', '4+1', 'daire', 'ev', 'villa', 'konut'];
    const isyeriKeywords = ['dükkan', 'mağaza', 'ofis', 'büro', 'işyeri'];
    const arsaKeywords = ['arsa', 'tarla', 'bahçe', 'bağ'];
    const gunlukKeywords = ['günlük', 'haftalık', 'tatil'];

    const lowerQuery = query.toLowerCase();

    if (gunlukKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return 'DAILY_RENTAL';
    }
    if (arsaKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return 'LAND';
    }
    if (isyeriKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return 'COMMERCIAL';
    }
    if (konutKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return 'RESIDENTIAL';
    }
    return 'RESIDENTIAL'; // default
  }

  /**
   * Client-side konum çıkarma
   */
  private extractLocationKeywords(query: string): string[] {
    const categoryKeywords = ['1+1', '2+1', '3+1', 'daire', 'ev', 'villa', 'dükkan', 'ofis', 'arsa', 'günlük'];
    const words = query.toLowerCase().split(/\s+/);
    return words.filter(word =>
      word.length > 2 &&
      !categoryKeywords.some(ck => word.includes(ck))
    );
  }

  /**
   * Smart search with filters - Filtreler ile akıllı arama
   */
  async smartSearchWithFilters(
    query: string,
    filters: SmartSearchFilters = {},
    page: number = 0,
    size: number = 20
  ): Promise<SmartSearchResponse> {
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        size: size.toString(),
      });

      // Filtreleri ekle
      if (filters.city) params.append('city', filters.city);
      if (filters.district) params.append('district', filters.district);
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());

      const response = await fetch(`${this.baseUrl}/search/filtered?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Filtered smart search failed:', error);
      throw new Error(`Filtreleme sırasında bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  }

  /**
   * Get category display name in Turkish
   */
  getCategoryDisplayName(category: string): string {
    const categoryNames: Record<string, string> = {
      'RESIDENTIAL': 'Konut',
      'COMMERCIAL': 'İş Yeri',
      'LAND': 'Arsa',
      'DAILY_RENTAL': 'Günlük Kiralık',
    };
    return categoryNames[category] || 'Bilinmeyen';
  }

  /**
   * Get category color for UI
   */
  getCategoryColor(category: string): string {
    const categoryColors: Record<string, string> = {
      'RESIDENTIAL': 'bg-blue-100 text-blue-800 border-blue-200',
      'COMMERCIAL': 'bg-purple-100 text-purple-800 border-purple-200',
      'LAND': 'bg-green-100 text-green-800 border-green-200',
      'DAILY_RENTAL': 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return categoryColors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

// Singleton instance
export const smartSearchService = new SmartSearchService();
export default smartSearchService;