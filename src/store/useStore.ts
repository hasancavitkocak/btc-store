import { create } from 'zustand';
import { banners as defaultBanners, Banner } from '../mock/banners';
import { categories as defaultCategories, Category } from '../mock/categories';
import { products as defaultProducts, Product } from '../mock/products';
import { references as defaultReferences, Reference } from '../mock/references';
import { stories as defaultStories, Story } from '../mock/stories';
import { partners as defaultPartners, Partner } from '../mock/partners';
import { kvkkData as defaultKvkkData, KVKKData } from '../mock/kvkk';
import { headerData as defaultHeaderData, HeaderData } from '../mock/header';
import { documents as defaultDocuments, Document } from '../mock/documents';
import { CallRequest, ProductContactForm } from '../mock/forms';
import { sendEmail, createProductContactEmailBody, createCallRequestEmailBody } from '../lib/email';
import { useAuthStore } from './useAuthStore';
import { publicService, MenuItem } from '../services/public.service';

interface StoreState {
  header: HeaderData;
  banners: Banner[];
  categories: Category[];
  products: Product[];
  references: Reference[];
  partners: Partner[];
  stories: Story[];
  documents: Document[];
  kvkk: KVKKData;
  callRequests: CallRequest[];
  productContactForms: ProductContactForm[];
  menuItems: MenuItem[];
  isLoadingBanners: boolean;
  isLoadingCategories: boolean;
  isLoadingPartners: boolean;
  isLoadingReferences: boolean;
  isLoadingMenus: boolean;
  bannersFetched: boolean;
  categoriesFetched: boolean;
  partnersFetched: boolean;
  referencesFetched: boolean;
  menusFetched: boolean;

  updateHeader: (header: HeaderData) => void;
  addBanner: (banner: Banner) => void;
  updateBanner: (id: string, banner: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addReference: (reference: Reference) => void;
  updateReference: (id: string, reference: Partial<Reference>) => void;
  deleteReference: (id: string) => void;
  addStory: (story: Story) => void;
  updateStory: (id: string, story: Partial<Story>) => void;
  deleteStory: (id: string) => void;
  updateKvkk: (kvkk: KVKKData) => void;
  addPartner: (partner: Partner) => void;
  updatePartner: (id: string, partner: Partial<Partner>) => void;
  deletePartner: (id: string) => void;
  addDocument: (document: Document) => void;
  updateDocument: (id: string, document: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  addCallRequest: (request: CallRequest) => void;
  addProductContactForm: (form: ProductContactForm) => void;
  resetToDefaults: () => void;
  fetchActiveBanners: () => Promise<void>;
  fetchActiveCategories: () => Promise<void>;
  fetchActivePartners: () => Promise<void>;
  fetchActiveReferences: () => Promise<void>;
  fetchPublicMenus: () => Promise<void>;
}

export const useStore = create<StoreState>()((set, get) => ({
      header: defaultHeaderData,
      banners: [], // Mock veriler yerine boş başlat
      categories: [], // Mock veriler yerine boş başlat
      products: defaultProducts,
      references: [], // Mock veriler yerine boş başlat
      partners: [], // Mock veriler yerine boş başlat
      stories: defaultStories,
      documents: defaultDocuments,
      kvkk: defaultKvkkData,
      callRequests: [],
      productContactForms: [],
      menuItems: [],
      isLoadingBanners: true, // Başlangıçta true olmalı
      isLoadingCategories: true, // Başlangıçta true olmalı
      isLoadingPartners: true, // Başlangıçta true olmalı
      isLoadingReferences: true, // Başlangıçta true olmalı
      isLoadingMenus: true, // Başlangıçta true olmalı
      bannersFetched: false,
      categoriesFetched: false,
      partnersFetched: false,
      referencesFetched: false,
      menusFetched: false,

      updateHeader: (header) => set({ header }),

      fetchActiveBanners: async () => {
        // Eğer zaten fetch edildiyse tekrar çekme
        const state = get();
        if (state.bannersFetched) {
          return;
        }

        set({ isLoadingBanners: true });
        try {
          const response = await publicService.getActiveBanners();
          
          if (response.status === 'SUCCESS' && response.data) {
            // Backend response'u kontrol et - data içinde data olabilir
            const bannerData = Array.isArray(response.data) 
              ? response.data 
              : (response.data.data || []);
            
            // Backend'den gelen verileri frontend formatına çevir
            const mappedBanners: Banner[] = bannerData.map((banner: any, index: number) => ({
              id: banner.code,
              // title, subtitle, buttonText obje olarak geliyor (çoklu dil için)
              titleKey: banner.title?.tr || banner.title?.en || banner.name || '',
              subtitleKey: banner.subtitle?.tr || banner.subtitle?.en || banner.description || '',
              buttonTextKey: banner.buttonText?.tr || banner.buttonText?.en || '',
              buttonLink: banner.buttonLink || '',
              // media objesi içinde absolutePath var
              image: banner.media?.absolutePath || '/images/placeholder.jpg',
              active: banner.active,
              order: banner.order || index,
              // Yeni alanlar
              showTitle: banner.showTitle ?? true,
              showSubtitle: banner.showSubtitle ?? true,
              showButton: banner.showButton ?? true,
              buttonBackgroundColor: banner.buttonBackgroundColor || '#1E3A8A',
              buttonBorderColor: banner.buttonBorderColor || '#1E3A8A',
              buttonTextColor: banner.buttonTextColor || '#FFFFFF'
            }));
            set({ banners: mappedBanners, bannersFetched: true });
          }
        } catch (error) {
          console.error('Failed to fetch banners:', error);
        } finally {
          set({ isLoadingBanners: false });
        }
      },

      fetchActiveCategories: async () => {
        // Eğer zaten fetch edildiyse tekrar çekme
        const state = get();
        if (state.categoriesFetched) {
          return;
        }

        set({ isLoadingCategories: true });
        try {
          const response = await publicService.getActiveCategories();
          
          if (response.status === 'SUCCESS' && response.data) {
            // Backend response'u kontrol et - data içinde data olabilir
            const categoryData = Array.isArray(response.data) 
              ? response.data 
              : (response.data.data || []);
            
            // Backend'den gelen verileri frontend formatına çevir
            const mappedCategories: Category[] = categoryData.map((category: any, index: number) => ({
              id: category.code,
              // name ve description obje olarak geliyor (çoklu dil için)
              nameKey: category.name?.tr || category.name?.en || category.name || '',
              descriptionKey: category.description?.tr || category.description?.en || category.description || '',
              // media objesi içinde absolutePath var
              image: category.media?.absolutePath || '/images/placeholder.jpg',
              showOnHome: category.showOnHomepage ?? true,
              active: category.active,
              order: category.order || index,
              // Backend'den gelen stil özellikleri
              bgColor: category.backgroundColor || '#F9FAFB',
              textColor: category.textColor || '#111827',
              showButton: category.showButton ?? true,
              buttonText: category.buttonText?.tr || category.buttonText?.en || 'Detayları Gör',
              buttonLink: category.buttonLink || `/products?category=${category.code}`,
              buttonBgColor: category.buttonBackgroundColor || '#0EA5E9',
              buttonTextColor: category.buttonTextColor || '#FFFFFF',
              buttonBorderColor: category.buttonBorderColor || '#0EA5E9'
            }));
            set({ categories: mappedCategories, categoriesFetched: true });
          }
        } catch (error) {
          console.error('Failed to fetch categories:', error);
        } finally {
          set({ isLoadingCategories: false });
        }
      },

      fetchActivePartners: async () => {
        const state = get();
        if (state.partnersFetched) {
          return;
        }

        set({ isLoadingPartners: true });
        try {
          // Tüm aktif partner'ları çek (home page değil)
          const response = await publicService.getActivePartners();
          
          if (response.status === 'SUCCESS' && response.data) {
            const partnerData = Array.isArray(response.data) 
              ? response.data 
              : (response.data.data || []);
            
            const mappedPartners: Partner[] = partnerData.map((partner: any, index: number) => ({
              id: partner.code,
              name: partner.name?.tr || partner.name?.en || partner.name || '',
              logo: partner.media?.absolutePath || '/images/placeholder.jpg',
              active: partner.active,
              order: partner.order || index
            }));
            set({ partners: mappedPartners, partnersFetched: true });
          }
        } catch (error) {
          console.error('Failed to fetch partners:', error);
        } finally {
          set({ isLoadingPartners: false });
        }
      },

      fetchActiveReferences: async () => {
        const state = get();
        if (state.referencesFetched) {
          return;
        }

        set({ isLoadingReferences: true });
        try {
          // Tüm aktif reference'ları çek (home page değil)
          const response = await publicService.getActiveReferences();
          
          if (response.status === 'SUCCESS' && response.data) {
            const referenceData = Array.isArray(response.data) 
              ? response.data 
              : (response.data.data || []);
            
            const mappedReferences: Reference[] = referenceData.map((reference: any, index: number) => ({
              id: reference.code,
              name: reference.name?.tr || reference.name?.en || reference.name || '',
              logo: reference.media?.absolutePath || '/images/placeholder.jpg',
              active: reference.active,
              showOnHome: reference.showOnHome !== false,
              order: reference.order || index
            }));
            set({ references: mappedReferences, referencesFetched: true });
          }
        } catch (error) {
          console.error('Failed to fetch references:', error);
        } finally {
          set({ isLoadingReferences: false });
        }
      },

      fetchPublicMenus: async () => {
        const state = get();
        if (state.menusFetched) {
          return;
        }

        set({ isLoadingMenus: true });
        try {
          const response = await publicService.getPublicMenus();
          
          if (response.status === 'SUCCESS' && response.data) {
            const menuData = Array.isArray(response.data) 
              ? response.data 
              : (response.data.data || []);
            
            set({ menuItems: menuData, menusFetched: true });
          }
        } catch (error) {
          console.error('Failed to fetch menus:', error);
        } finally {
          set({ isLoadingMenus: false });
        }
      },

      addBanner: (banner) =>
        set((state) => ({ banners: [...state.banners, banner] })),
      updateBanner: (id, banner) =>
        set((state) => ({
          banners: state.banners.map((b) => (b.id === id ? { ...b, ...banner } : b))
        })),
      deleteBanner: (id) =>
        set((state) => ({
          banners: state.banners.filter((b) => b.id !== id)
        })),

      addCategory: (category) =>
        set((state) => ({ categories: [...state.categories, category] })),
      updateCategory: (id, category) =>
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...category } : c))
        })),
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id)
        })),

      addProduct: (product) =>
        set((state) => ({ products: [...state.products, product] })),
      updateProduct: (id, product) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...product } : p))
        })),
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id)
        })),

      addReference: (reference) =>
        set((state) => ({ references: [...state.references, reference] })),
      updateReference: (id, reference) =>
        set((state) => ({
          references: state.references.map((r) => (r.id === id ? { ...r, ...reference } : r))
        })),
      deleteReference: (id) =>
        set((state) => ({
          references: state.references.filter((r) => r.id !== id)
        })),

      addStory: (story) =>
        set((state) => ({ stories: [...state.stories, story] })),
      updateStory: (id, story) =>
        set((state) => ({
          stories: state.stories.map((s) => (s.id === id ? { ...s, ...story } : s))
        })),
      deleteStory: (id) =>
        set((state) => ({
          stories: state.stories.filter((s) => s.id !== id)
        })),

      addPartner: (partner) =>
        set((state) => ({ partners: [...state.partners, partner] })),
      updatePartner: (id, partner) =>
        set((state) => ({
          partners: state.partners.map((p) => (p.id === id ? { ...p, ...partner } : p))
        })),
      deletePartner: (id) =>
        set((state) => ({
          partners: state.partners.filter((p) => p.id !== id)
        })),

      addDocument: (document) =>
        set((state) => ({ documents: [...state.documents, document] })),
      updateDocument: (id, document) =>
        set((state) => ({
          documents: state.documents.map((d) => (d.id === id ? { ...d, ...document } : d))
        })),
      deleteDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id)
        })),

      updateKvkk: (kvkk) => set({ kvkk }),

      addCallRequest: (request) =>
        set((state) => ({ callRequests: [...state.callRequests, request] })),

      addProductContactForm: (form) =>
        set((state) => {
          // Ürünü bul
          const product = state.products.find(p => p.id === form.productId);
          
          // Eğer ürünün sorumlusu varsa, ona mail gönder
          if (product?.responsibleUserId) {
            const users = useAuthStore.getState().users;
            const responsible = users.find(u => u.id === product.responsibleUserId);
            
            if (responsible?.email) {
              const emailBody = createProductContactEmailBody({
                productName: product.nameKey,
                customerName: form.name,
                customerSurname: form.surname,
                customerPhone: form.phone,
                customerEmail: form.email,
                message: form.message
              });

              sendEmail({
                to: responsible.email,
                subject: `Yeni Ürün İletişim Formu - ${product.nameKey}`,
                body: emailBody,
                productName: product.nameKey,
                customerName: `${form.name} ${form.surname}`,
                customerPhone: form.phone,
                customerEmail: form.email,
                message: form.message
              });
            }
          }

          return { productContactForms: [...state.productContactForms, form] };
        }),

      resetToDefaults: () =>
        set({
          header: defaultHeaderData,
          banners: defaultBanners,
          categories: defaultCategories,
          products: defaultProducts,
          references: defaultReferences,
          partners: defaultPartners,
          stories: defaultStories,
          documents: defaultDocuments,
          kvkk: defaultKvkkData,
          callRequests: [],
          productContactForms: []
        })
    }));
