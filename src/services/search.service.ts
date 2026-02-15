import { apiClient } from '@/lib/api';

export interface SearchFilter {
  name: string;
  relationField?: string;
  value?: any;
  date?: string;
  locale?: string;
  searchCondition?: string;
  values?: any[];
  currentUser?: boolean;
  currentUserRelationField?: string;
  setValueForCurrentUser?: string;
  child?: SearchFilter;
}

export interface SearchSortData {
  name: string;
  direction: 'ASC' | 'DESC';
}

export interface SearchFormData {
  filters?: SearchFilter[]; // Backend expects Set but JSON array works
  sort?: SearchSortData; // Single sort object, not array
  totalCount?: number;
  headers?: string[];
}

export interface PageableResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageSize: number;
  pageNumber: number;
}

export const searchService = {
  /**
   * Generic search - Backend SearchFormData yapısına uygun
   * @param itemType - Model adı (örn: "banner", "product")
   * @param searchFormData - Arama ve sıralama parametreleri
   * @param page - Sayfa numarası (1'den başlar)
   */
  search: async <T = any>(
    itemType: string,
    searchFormData: SearchFormData = {},
    page: number = 1
  ) => {
    const response = await apiClient.post<PageableResponse<T>>(
      `/v1/search/${page}/${itemType}`,
      searchFormData
    );
    return response;
  },

  /**
   * Tüm kayıtları getir (sayfalama yok)
   */
  searchAll: async <T = any>(itemType: string) => {
    const response = await apiClient.get<T[]>(`/v1/search/search-all/${itemType}`);
    return response;
  },

  /**
   * Query ile arama
   */
  searchByQuery: async <T = any>(
    itemType: string,
    queryData: any,
    page: number = 1
  ) => {
    const response = await apiClient.post<PageableResponse<T>>(
      `/v1/search/query-search/${page}/${itemType}`,
      queryData
    );
    return response;
  },

  /**
   * Excel export
   */
  exportExcel: async (itemType: string, searchFormData: SearchFormData = {}) => {
    // Bu özel bir endpoint, blob döndürüyor
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/search/export-excel/${itemType}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchFormData),
      }
    );
    return response.blob();
  },
};
