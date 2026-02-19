import { apiClient } from '@/lib/api';

export interface ProductDocument {
  id: number;
  code: string;
  title?: {
    tr?: string;
    en?: string;
  };
  description?: {
    tr?: string;
    en?: string;
  };
  medias?: Array<{
    code: string;
    absolutePath?: string;
    name?: string;
    size?: number;
    mimeType?: string;
  }>;
  active?: boolean;
  deleted?: boolean;
}

class DocumentService {
  // Authenticated endpoint - requires token
  async getProductDocuments(productCode: string): Promise<ProductDocument[]> {
    console.log('Fetching documents for product:', productCode);
    const response = await apiClient.get(`/v1/documents/product/${productCode}`);
    console.log('Document API response:', response);
    
    if (response.status === 'SUCCESS' && response.data) {
      const actualData = response.data.data || response.data;
      console.log('Parsed document data:', actualData);
      return Array.isArray(actualData) ? actualData : [];
    }
    
    console.log('No documents found or error');
    return [];
  }
}

export const documentService = new DocumentService();
