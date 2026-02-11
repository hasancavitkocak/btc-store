export interface Category {
  id: string;
  nameKey: string;
  descriptionKey: string;
  image: string;
  icon: string;
  showOnHome: boolean;
  order: number;
}

export const categories: Category[] = [
  {
    id: 'crm',
    nameKey: 'category.crm.name',
    descriptionKey: 'category.crm.description',
    image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
    icon: 'Users',
    showOnHome: true,
    order: 1
  },
  {
    id: 'finance',
    nameKey: 'category.finance.name',
    descriptionKey: 'category.finance.description',
    image: 'https://images.pexels.com/photos/6801647/pexels-photo-6801647.jpeg?auto=compress&cs=tinysrgb&w=800',
    icon: 'DollarSign',
    showOnHome: true,
    order: 2
  },
  {
    id: 'hr',
    nameKey: 'category.hr.name',
    descriptionKey: 'category.hr.description',
    image: 'https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg?auto=compress&cs=tinysrgb&w=800',
    icon: 'Briefcase',
    showOnHome: true,
    order: 3
  },
  {
    id: 'marketing',
    nameKey: 'category.marketing.name',
    descriptionKey: 'category.marketing.description',
    image: 'https://images.pexels.com/photos/3184317/pexels-photo-3184317.jpeg?auto=compress&cs=tinysrgb&w=800',
    icon: 'TrendingUp',
    showOnHome: true,
    order: 4
  },
  {
    id: 'warehouse',
    nameKey: 'category.warehouse.name',
    descriptionKey: 'category.warehouse.description',
    image: 'https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=800',
    icon: 'Package',
    showOnHome: false,
    order: 5
  }
];
