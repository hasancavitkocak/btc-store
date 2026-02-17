export interface Category {
  id: string;
  nameKey: string;
  descriptionKey: string;
  image: string;
  icon: string;
  showOnHome: boolean;
  order: number;
  active?: boolean;
  // Renk ayarları
  bgColor?: string;
  textColor?: string;
  iconBgColor?: string;
  // Buton ayarları
  showButton?: boolean;
  buttonText?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonBorderColor?: string;
}

export const categories: Category[] = [
  {
    id: 'crm',
    nameKey: 'category.crm.name',
    descriptionKey: 'category.crm.description',
    image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
    icon: 'Users',
    showOnHome: true,
    order: 1,
    bgColor: '#E0F2FE',
    iconBgColor: '#0EA5E9',
    showButton: true,
    buttonBgColor: '#0EA5E9',
    buttonTextColor: '#FFFFFF',
    buttonBorderColor: '#0EA5E9'
  },
  {
    id: 'finance',
    nameKey: 'category.finance.name',
    descriptionKey: 'category.finance.description',
    image: 'https://images.pexels.com/photos/6801647/pexels-photo-6801647.jpeg?auto=compress&cs=tinysrgb&w=800',
    icon: 'DollarSign',
    showOnHome: true,
    order: 2,
    bgColor: '#FFFFFF',
    iconBgColor: '#D946EF',
    showButton: true,
    buttonBgColor: '#D946EF',
    buttonTextColor: '#FFFFFF',
    buttonBorderColor: '#D946EF'
  },
  {
    id: 'hr',
    nameKey: 'category.hr.name',
    descriptionKey: 'category.hr.description',
    image: 'https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg?auto=compress&cs=tinysrgb&w=800',
    icon: 'Briefcase',
    showOnHome: true,
    order: 3,
    bgColor: '#DCFCE7',
    iconBgColor: '#22C55E',
    showButton: true,
    buttonBgColor: '#22C55E',
    buttonTextColor: '#FFFFFF',
    buttonBorderColor: '#22C55E'
  },
  {
    id: 'marketing',
    nameKey: 'category.marketing.name',
    descriptionKey: 'category.marketing.description',
    image: 'https://images.pexels.com/photos/3184317/pexels-photo-3184317.jpeg?auto=compress&cs=tinysrgb&w=800',
    icon: 'TrendingUp',
    showOnHome: true,
    order: 4,
    bgColor: '#FFFFFF',
    iconBgColor: '#F97316',
    showButton: true,
    buttonBgColor: '#F97316',
    buttonTextColor: '#FFFFFF',
    buttonBorderColor: '#F97316'
  },
  {
    id: 'warehouse',
    nameKey: 'category.warehouse.name',
    descriptionKey: 'category.warehouse.description',
    image: 'https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=800',
    icon: 'Package',
    showOnHome: false,
    order: 5,
    bgColor: '#FEF9C3',
    iconBgColor: '#EAB308',
    showButton: true,
    buttonBgColor: '#EAB308',
    buttonTextColor: '#FFFFFF',
    buttonBorderColor: '#EAB308'
  }
];
