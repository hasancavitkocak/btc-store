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
};
