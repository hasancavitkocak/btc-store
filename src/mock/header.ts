export interface HeaderData {
  logo: string;
  phone: string;
  menuItems: Array<{
    id: string;
    labelKey: string;
    path: string;
  }>;
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
    { id: 'home', labelKey: 'menu.home', path: '/' },
    { id: 'products', labelKey: 'menu.products', path: '/products' },
    { id: 'references', labelKey: 'menu.references', path: '/references' },
    { id: 'stories', labelKey: 'menu.stories', path: '/stories' },
    { id: 'contact', labelKey: 'menu.contact', path: '/call-request' }
  ],
  topBanner: {
    textKey: 'banner.campaign',
    link: '/products',
    bgColor: '#10b981'
  }
};
