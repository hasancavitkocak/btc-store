import { apiClient } from '@/lib/api';

export interface LocalizeData {
  tr: string;
  en: string;
  de: string;
  fr: string;
  es: string;
  it: string;
}

export interface ProductData {
  id?: number;
  code?: string;
  name: LocalizeData;
  description: LocalizeData;
  shortDescription: LocalizeData;
  categories: Array<{ code: string }>;
  mainImage?: { code: string; absolutePath?: string };
  images?: Array<{ code: string; absolutePath?: string }>;
  responsibleUser?: { code: string; username?: string; email?: string };
  active: boolean;
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
}

export const productService = new ProductService();
