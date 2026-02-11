import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { banners as defaultBanners, Banner } from '../mock/banners';
import { categories as defaultCategories, Category } from '../mock/categories';
import { products as defaultProducts, Product } from '../mock/products';
import { references as defaultReferences, Reference } from '../mock/references';
import { stories as defaultStories, Story } from '../mock/stories';
import { partners as defaultPartners, Partner } from '../mock/partners';
import { kvkkData as defaultKvkkData, KVKKData } from '../mock/kvkk';
import { headerData as defaultHeaderData, HeaderData } from '../mock/header';
import { CallRequest, ProductContactForm } from '../mock/forms';

interface StoreState {
  header: HeaderData;
  banners: Banner[];
  categories: Category[];
  products: Product[];
  references: Reference[];
  partners: Partner[];
  stories: Story[];
  kvkk: KVKKData;
  callRequests: CallRequest[];
  productContactForms: ProductContactForm[];

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
  addCallRequest: (request: CallRequest) => void;
  addProductContactForm: (form: ProductContactForm) => void;
  resetToDefaults: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      header: defaultHeaderData,
      banners: defaultBanners,
      categories: defaultCategories,
      products: defaultProducts,
      references: defaultReferences,
      partners: defaultPartners,
      stories: defaultStories,
      kvkk: defaultKvkkData,
      callRequests: [],
      productContactForms: [],

      updateHeader: (header) => set({ header }),

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

      updateKvkk: (kvkk) => set({ kvkk }),

      addCallRequest: (request) =>
        set((state) => ({ callRequests: [...state.callRequests, request] })),

      addProductContactForm: (form) =>
        set((state) => ({ productContactForms: [...state.productContactForms, form] })),

      resetToDefaults: () =>
        set({
          header: defaultHeaderData,
          banners: defaultBanners,
          categories: defaultCategories,
          products: defaultProducts,
          references: defaultReferences,
          partners: defaultPartners,
          stories: defaultStories,
          kvkk: defaultKvkkData,
          callRequests: [],
          productContactForms: []
        })
    }),
    {
      name: 'app-store'
    }
  )
);
