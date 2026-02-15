import { apiClient } from '@/lib/api';

// Banner servisleri
export const bannerService = {
  getAll: () => apiClient.get('/v1/banners'),
  getActive: () => apiClient.get('/v1/banners/active'),
  getByCode: (code: string) => apiClient.get(`/v1/banners/${code}`),
  save: (data: any, mediaFile?: File, removeMedia?: boolean) => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append('bannerData', jsonBlob);
    if (mediaFile) {
      formData.append('media', mediaFile);
    } else if (removeMedia) {
      // Boş bir blob göndererek resim silme isteği gönderiyoruz
      formData.append('removeMedia', 'true');
    }
    return apiClient.upload('/v1/banners', formData);
  },
  delete: (code: string) => apiClient.delete(`/v1/banners/${code}`),
};

// Category servisleri
export const categoryService = {
  getAll: () => apiClient.get('/v1/categories'),
  getActive: () => apiClient.get('/v1/categories/active'),
  getByCode: (code: string) => apiClient.get(`/v1/categories/${code}`),
  save: (data: any, mediaFile?: File, removeMedia?: boolean) => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append('categoryData', jsonBlob);
    if (mediaFile) {
      formData.append('media', mediaFile);
    } else if (removeMedia) {
      // Boş bir blob göndererek resim silme isteği gönderiyoruz
      formData.append('removeMedia', 'true');
    }
    return apiClient.upload('/v1/categories', formData);
  },
  delete: (code: string) => apiClient.delete(`/v1/categories/${code}`),
};

// Product servisleri
export const productService = {
  getAll: (params?: { page?: number; size?: number; search?: string }) => 
    apiClient.get('/v1/products', { params }),
  getById: (id: string) => apiClient.get(`/v1/products/${id}`),
  create: (data: any) => apiClient.post('/v1/products', data),
  update: (id: string, data: any) => apiClient.put(`/v1/products/${id}`, data),
  delete: (id: string) => apiClient.delete(`/v1/products/${id}`),
};

// Reference servisleri
export const referenceService = {
  getAll: () => apiClient.get('/v1/references'),
  getById: (id: string) => apiClient.get(`/v1/references/${id}`),
  create: (data: any) => apiClient.post('/v1/references', data),
  update: (id: string, data: any) => apiClient.put(`/v1/references/${id}`, data),
  delete: (id: string) => apiClient.delete(`/v1/references/${id}`),
};

// Story servisleri
export const storyService = {
  getAll: () => apiClient.get('/v1/success-stories'),
  getActive: () => apiClient.get('/v1/success-stories/active'),
  getByCode: (code: string) => apiClient.get(`/v1/success-stories/${code}`),
  save: (data: any, mediaFile?: File, removeMedia?: boolean) => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append('successStoryData', jsonBlob);
    if (mediaFile) {
      formData.append('media', mediaFile);
    } else if (removeMedia) {
      formData.append('removeMedia', 'true');
    }
    return apiClient.upload('/v1/success-stories', formData);
  },
  delete: (code: string) => apiClient.delete(`/v1/success-stories/${code}`),
};

// Media servisleri
export const mediaService = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload('/v1/medias/upload', formData);
  },
  uploadMultiple: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return apiClient.upload('/v1/medias/upload-multiple', formData);
  },
};

// Form servisleri
export const formService = {
  getAll: (params?: { page?: number; size?: number; type?: string }) => 
    apiClient.get('/v1/forms', { params }),
  getById: (id: string) => apiClient.get(`/v1/forms/${id}`),
  delete: (id: string) => apiClient.delete(`/v1/forms/${id}`),
};

// Document servisleri
export const documentService = {
  getAll: () => apiClient.get('/v1/documents'),
  getById: (id: string) => apiClient.get(`/v1/documents/${id}`),
  create: (data: any) => apiClient.post('/v1/documents', data),
  update: (id: string, data: any) => apiClient.put(`/v1/documents/${id}`, data),
  delete: (id: string) => apiClient.delete(`/v1/documents/${id}`),
};
