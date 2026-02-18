import { apiClient } from '@/lib/api';

export const legalDocumentService = {
  getByCode: (code: string) => apiClient.get(`/v1/legal-documents/${code}`),
  save: (data: any) => apiClient.post('/v1/legal-documents', data),
  delete: (code: string) => apiClient.delete(`/v1/legal-documents/${code}`)
};
