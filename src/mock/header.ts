export interface MenuItem {
  id: string;
  labelKey: string;
  path: string;
  order: number;
  type?: 'link' | 'dropdown' | 'category-dropdown'; // Menü tipi
  categoryIds?: string[]; // Bağlı kategoriler (type: 'category-dropdown' için)
  subItems?: Array<{
    id: string;
    labelKey: string;
    path: string;
  }>; // Manuel alt menü öğeleri (type: 'dropdown' için)
}

export interface HeaderData {
  logo: string;
  phone: string;
  menuItems: MenuItem[];
  topBanner?: {
    textKey: string;
    link?: string;
    bgColor?: string;
  };
}

export const headerData: HeaderData = {
  logo: 'Btc Store',
  phone: '+90 (555) 123 45 67',
  menuItems: [
    { id: 'home', labelKey: 'menu.home', path: '/', order: 1, type: 'link' },
    {
      id: 'products',
      labelKey: 'menu.products',
      path: '/products',
      order: 2,
      type: 'category-dropdown',
      categoryIds: []
    },
    { id: 'sap-services', labelKey: 'menu.sapServices', path: '/sap-services', order: 3, type: 'link' },
    { id: 'sector-solutions', labelKey: 'menu.sectorSolutions', path: '/sector-solutions', order: 4, type: 'link' },
    { id: 'references', labelKey: 'menu.references', path: '/references', order: 5, type: 'link' },
    { id: 'stories', labelKey: 'menu.stories', path: '/stories', order: 6, type: 'link' }
  ],
  topBanner: {
    textKey: 'banner.campaign',
    link: '/products',
    bgColor: '#bbf6e2'
  }
};
