import { apiClient } from '@/lib/api';

export interface MultiLangText {
  tr?: string;
  en?: string;
  de?: string;
  fr?: string;
  es?: string;
  it?: string;
}

export interface Media {
  id: number;
  code: string;
  realFileName: string;
  mime: string;
  absolutePath: string;
  size: number;
  deleted: boolean;
}

export interface Banner {
  id: number;
  code: string;
  title: MultiLangText;
  subtitle: MultiLangText;
  buttonText: MultiLangText;
  buttonLink: string;
  media?: Media;
  order: number;
  active: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showButton?: boolean;
  buttonBackgroundColor?: string;
  buttonBorderColor?: string;
  buttonTextColor?: string;
}

export interface Category {
  id: number;
  code: string;
  name: MultiLangText;
  description?: MultiLangText;
  media?: Media;
  backgroundColor?: string;
  textColor?: string;
  showButton?: boolean;
  buttonText?: MultiLangText;
  buttonLink?: string;
  buttonBackgroundColor?: string;
  buttonBorderColor?: string;
  buttonTextColor?: string;
  showOnHomepage?: boolean;
  order: number;
  active: boolean;
  parentCode?: string;
}

export interface Partner {
  id: number;
  code: string;
  name: MultiLangText;
  description?: MultiLangText;
  media?: Media;
  order: number;
  active: boolean;
  showOnHome: boolean;
}

export interface Reference {
  id: number;
  code: string;
  name: MultiLangText;
  description?: MultiLangText;
  media?: Media;
  order: number;
  active: boolean;
  showOnHome: boolean;
}

export interface Sector {
  id: number;
  code: string;
  name: MultiLangText;
}

export interface SuccessStory {
  id: number;
  code: string;
  company: string;
  sector?: Sector;
  title: MultiLangText;
  htmlContent: MultiLangText;
  media?: Media;
  videoUrl?: string;
  results?: string[];
  order: number;
  active: boolean;
}

export interface MenuItem {
  id: number;
  code: string;
  name: MultiLangText;
  icon?: string;
  displayOrder: number;
  isRoot: boolean;
  active: boolean;
  url?: string;
  menuType: 'PUBLIC' | 'ADMIN_PANEL';
  parentMenuCode?: string;
  subMenuLinkItems?: MenuItem[];
}

export const publicService = {
  // Get active banners
  async getActiveBanners() {
    return apiClient.get<Banner[]>('/v1/public/banners', { skipAuth: true });
  },

  // Get active categories
  async getActiveCategories() {
    return apiClient.get<Category[]>('/v1/public/categories', { skipAuth: true });
  },

  // Get active partners
  async getActivePartners() {
    return apiClient.get<Partner[]>('/v1/public/partners', { skipAuth: true });
  },

  // Get home page partners (limited to 8)
  async getHomePagePartners() {
    return apiClient.get<Partner[]>('/v1/public/partners/home', { skipAuth: true });
  },

  // Get active references
  async getActiveReferences() {
    return apiClient.get<Reference[]>('/v1/public/references', { skipAuth: true });
  },

  // Get home page references (limited to 4)
  async getHomePageReferences() {
    return apiClient.get<Reference[]>('/v1/public/references/home', { skipAuth: true });
  },

  // Get public menus with hierarchy
  async getPublicMenus() {
    return apiClient.get<MenuItem[]>('/v1/public/menus', { skipAuth: true });
  },

  // Get site configuration
  async getSiteConfiguration() {
    return apiClient.get('/v1/public/site-configuration', { skipAuth: true });
  },

  // Create call request (public - no auth)
  async createCallRequest(data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    subject?: string;
    message?: string;
    acceptedLegalDocument?: { code: string };
  }) {
    return apiClient.post('/v1/public/call-requests', data, { skipAuth: true });
  },

  // Create product contact request (public - no auth)
  async createProductContactRequest(productCode: string, data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    message?: string;
    acceptedLegalDocument?: { code: string };
  }) {
    return apiClient.post(`/v1/public/products/${productCode}/contact`, data, { skipAuth: true });
  },

  // Get current privacy policy document
  async getCurrentPrivacyPolicy() {
    return apiClient.get('/v1/public/legal-documents/privacy-policy/current', { skipAuth: true });
  },

  // Get active success stories
  async getActiveSuccessStories() {
    return apiClient.get<SuccessStory[]>('/v1/public/success-stories', { skipAuth: true });
  },

  // Get success story by code
  async getSuccessStoryByCode(code: string) {
    return apiClient.get<SuccessStory>(`/v1/public/success-stories/${code}`, { skipAuth: true });
  },
};
