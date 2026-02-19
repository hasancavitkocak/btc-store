import { apiClient } from '@/lib/api';

export interface LocalizeData {
  tr: string;
  en: string;
  de: string;
  fr: string;
  es: string;
  it: string;
}

export interface CategoryData {
  id?: number;
  code: string;
  name?: LocalizeData;
  description?: LocalizeData;
  active?: boolean;
  order?: number;
}

export interface ProductData {
  id?: number;
  code?: string;
  name: LocalizeData;
  description: LocalizeData;
  shortDescription: LocalizeData;
  categories: CategoryData[];
  mainImage?: { code: string; absolutePath?: string };
  images?: Array<{ code: string; absolutePath?: string }>;
  responsibleUser?: { code: string; username?: string; email?: string };
  features?: string[];
  videoLink?: string;
  active: boolean;
  deleted?: boolean;
}

export interface ProductFilterData {
  products: ProductData[];
  availableCategories: CategoryData[];
  selectedCategory?: CategoryData;
  totalProducts: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

class ProductService {
  async getAll() {
    return apiClient.get('/v1/products');
  }

  async getByCode(code: string) {
    return apiClient.get(`/v1/products/${code}`);
  }

  async save(
    productData: ProductData,
    mainImageFile?: File,
    imageFiles?: File[],
    removeMainImage: boolean = false
  ) {
    const formData = new FormData();
    formData.append('productData', new Blob([JSON.stringify(productData)], { type: 'application/json' }));
    
    if (mainImageFile) {
      formData.append('mainImageFile', mainImageFile);
    }
    
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append('imageFiles', file);
      });
    }
    
    if (removeMainImage) {
      formData.append('removeMainImage', 'true');
    }

    return apiClient.upload('/v1/products', formData);
  }

  async delete(code: string) {
    return apiClient.delete(`/v1/products/${code}`);
  }

  // Public endpoints
  async getPublicProducts(categoryCode?: string, page: number = 1, size: number = 20): Promise<ProductFilterData> {
    const params: any = { page, size };
    if (categoryCode) {
      params.category = categoryCode;
    }
    const response = await apiClient.get('/v1/public/products', { params });
    
    console.log('Full API Response:', response);
    
    // Backend response format: { status: "SUCCESS", data: { data: ProductFilterData, encryptedData: false } }
    if (response.status === 'SUCCESS' && response.data) {
      // Check if data has nested data property (encrypted response wrapper)
      const actualData = response.data.data || response.data;
      
      return {
        products: actualData.products || [],
        availableCategories: actualData.availableCategories || [],
        selectedCategory: actualData.selectedCategory,
        totalProducts: actualData.totalProducts || 0,
        pageNumber: actualData.pageNumber || 1,
        pageSize: actualData.pageSize || size,
        totalPages: actualData.totalPages || 0
      };
    }
    
    // Fallback empty data
    return {
      products: [],
      availableCategories: [],
      totalProducts: 0,
      pageNumber: 1,
      pageSize: size,
      totalPages: 0
    };
  }

  async getPublicProductByCode(code: string): Promise<ProductData | null> {
    const response = await apiClient.get(`/v1/public/products/${code}`);
    
    if (response.status === 'SUCCESS' && response.data) {
      // Check if data has nested data property
      const actualData = response.data.data || response.data;
      return actualData as ProductData;
    }
    
    return null;
  }
}

export const productService = new ProductService();
