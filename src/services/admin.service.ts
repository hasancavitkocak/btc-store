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
  getActive: () => apiClient.get('/v1/references/active'),
  getHomePageReferences: () => apiClient.get('/v1/references/home'),
  getByCode: (code: string) => apiClient.get(`/v1/references/${code}`),
  save: (data: any, mediaFile?: File, removeMedia?: boolean) => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append('referenceData', jsonBlob);
    if (mediaFile) {
      formData.append('media', mediaFile);
    } else if (removeMedia) {
      formData.append('removeMedia', 'true');
    }
    return apiClient.upload('/v1/references', formData);
  },
  delete: (code: string) => apiClient.delete(`/v1/references/${code}`),
};

// Partner servisleri
export const partnerService = {
  getAll: () => apiClient.get('/v1/partners'),
  getActive: () => apiClient.get('/v1/partners/active'),
  getHomePagePartners: () => apiClient.get('/v1/partners/home'),
  getByCode: (code: string) => apiClient.get(`/v1/partners/${code}`),
  save: (data: any, mediaFile?: File, removeMedia?: boolean) => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append('partnerData', jsonBlob);
    if (mediaFile) {
      formData.append('media', mediaFile);
    } else if (removeMedia) {
      formData.append('removeMedia', 'true');
    }
    return apiClient.upload('/v1/partners', formData);
  },
  delete: (code: string) => apiClient.delete(`/v1/partners/${code}`),
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

// Sector servisleri
export const sectorService = {
  getAll: () => apiClient.get('/v1/sectors'),
  getActive: () => apiClient.get('/v1/sectors/active'),
  getByCode: (code: string) => apiClient.get(`/v1/sectors/${code}`),
  save: (data: any) => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append('sectorData', jsonBlob);
    return apiClient.upload('/v1/sectors', formData);
  },
  delete: (code: string) => apiClient.delete(`/v1/sectors/${code}`),
};

// Menu servisleri
export const menuLinkItemService = {
  getAll: () => apiClient.get('/v1/menu-link-items'),
  getRootMenus: () => apiClient.get('/v1/menu-link-items/root'),
  getByType: (menuType: string) => apiClient.get(`/v1/menu-link-items/by-type/${menuType}`),
  getByCode: (code: string) => apiClient.get(`/v1/menu-link-items/${code}`),
  save: (data: any) => apiClient.post('/v1/menu-link-items', data),
  delete: (code: string) => apiClient.delete(`/v1/menu-link-items/${code}`),
};

// User Group servisleri
export const userGroupService = {
  getAll: () => apiClient.get('/v1/usergroups'),
};
