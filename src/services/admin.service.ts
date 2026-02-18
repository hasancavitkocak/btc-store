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
  getByTypeFlat: (menuType: string) => apiClient.get(`/v1/menu-link-items/by-type/${menuType}/flat`),
  getByCode: (code: string) => apiClient.get(`/v1/menu-link-items/${code}`),
  save: (data: any) => apiClient.post('/v1/menu-link-items', data),
  delete: (code: string) => apiClient.delete(`/v1/menu-link-items/${code}`),
};

// User Group servisleri
export const userGroupService = {
  getAll: () => apiClient.get('/v1/usergroups'),
  getByCode: (code: string) => apiClient.get(`/v1/usergroups/${code}`),
  save: (data: any) => apiClient.post('/v1/usergroups', data),
  delete: (code: string) => apiClient.delete(`/v1/usergroups/${code}`),
};

// User Role servisleri
export const userRoleService = {
  getAll: () => apiClient.get('/v1/userroles'),
  getByCode: (code: string) => apiClient.get(`/v1/userroles/${code}`),
  save: (data: any) => apiClient.post('/v1/userroles', data),
  delete: (code: string) => apiClient.delete(`/v1/userroles/${code}`),
};

// Parameter servisleri
export const parameterService = {
  getAll: () => apiClient.get('/v1/parameters'),
  getByCode: (code: string) => apiClient.get(`/v1/parameters/${code}`),
  save: (data: any) => apiClient.post('/v1/parameters', data),
  delete: (code: string) => apiClient.delete(`/v1/parameters/${code}`),
};

// User servisleri
export const userService = {
  getAll: () => apiClient.get('/v1/users'),
  getByCode: (code: string) => apiClient.get(`/v1/users/${code}`),
  save: (data: any, pictureFile?: File, removePicture?: boolean) => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append('userData', jsonBlob);
    if (pictureFile) {
      formData.append('pictureFile', pictureFile);
    } else if (removePicture) {
      formData.append('removePicture', 'true');
    }
    return apiClient.upload('/v1/users', formData);
  },
  delete: (code: string) => apiClient.delete(`/v1/users/${code}`),
};

// Language servisleri
export const languageService = {
  getAll: () => apiClient.get('/v1/languages'),
};

// Site Configuration servisleri
export const siteConfigurationService = {
  get: () => apiClient.get('/v1/site-configuration'),
  save: (data: any, headerLogoFile?: File, footerLogoFile?: File, removeHeaderLogo?: boolean, removeFooterLogo?: boolean) => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append('configData', jsonBlob);
    if (headerLogoFile) {
      formData.append('headerLogo', headerLogoFile);
    } else if (removeHeaderLogo) {
      formData.append('removeHeaderLogo', 'true');
    }
    if (footerLogoFile) {
      formData.append('footerLogo', footerLogoFile);
    } else if (removeFooterLogo) {
      formData.append('removeFooterLogo', 'true');
    }
    return apiClient.upload('/v1/site-configuration', formData);
  },
};

// Call Request servisleri
export const callRequestService = {
  getAll: () => apiClient.get<any>('/v1/call-requests'),
  getById: (id: number) => apiClient.get<any>(`/v1/call-requests/${id}`),
  getByStatus: (status: string) => apiClient.get<any>(`/v1/call-requests/status/${status}`),
  getMyRequests: () => apiClient.get<any>('/v1/call-requests/my-requests'),
  assignToGroup: (id: number, groupCode: string) => 
    apiClient.post<any>(`/v1/call-requests/${id}/assign-group?groupCode=${groupCode}`),
  assignToUser: (id: number, userId: number) => 
    apiClient.post<any>(`/v1/call-requests/${id}/assign-user?userId=${userId}`),
  updateStatus: (id: number, status: string, comment?: string) => 
    apiClient.post<any>(`/v1/call-requests/${id}/update-status?status=${status}${comment ? `&comment=${encodeURIComponent(comment)}` : ''}`),
  getHistory: (id: number) => apiClient.get<any>(`/v1/call-requests/${id}/history`),
};

// Email Template servisleri
export const emailTemplateService = {
  getAll: () => apiClient.get<any>('/v1/email-templates'),
  getActive: () => apiClient.get<any>('/v1/email-templates/active'),
  getByCode: (code: string) => apiClient.get<any>(`/v1/email-templates/${code}`),
  save: (data: any) => apiClient.post<any>('/v1/email-templates', data),
  delete: (code: string) => apiClient.delete<any>(`/v1/email-templates/${code}`),
  // SearchController endpoint'lerini kullan
  getAllModels: () => apiClient.get<any>('/v1/search/all-item-models'),
  getModelFields: (modelName: string) => apiClient.get<any>(`/v1/search/all-item-fields/${modelName}`),
};
