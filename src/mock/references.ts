export interface Reference {
  id: string;
  name: string;
  logo: string;
  order: number;
  active: boolean;
}

export const references: Reference[] = [
  {
    id: '1',
    name: 'TechCorp',
    logo: 'https://via.placeholder.com/200x80/0ea5e9/ffffff?text=TechCorp',
    order: 1,
    active: true
  },
  {
    id: '2',
    name: 'GlobalSoft',
    logo: 'https://via.placeholder.com/200x80/10b981/ffffff?text=GlobalSoft',
    order: 2,
    active: true
  },
  {
    id: '3',
    name: 'InnovateLab',
    logo: 'https://via.placeholder.com/200x80/f59e0b/ffffff?text=InnovateLab',
    order: 3,
    active: true
  },
  {
    id: '4',
    name: 'DataDrive',
    logo: 'https://via.placeholder.com/200x80/ef4444/ffffff?text=DataDrive',
    order: 4,
    active: true
  },
  {
    id: '5',
    name: 'CloudNine',
    logo: 'https://via.placeholder.com/200x80/0ea5e9/ffffff?text=CloudNine',
    order: 5,
    active: true
  },
  {
    id: '6',
    name: 'SmartBiz',
    logo: 'https://via.placeholder.com/200x80/8b5cf6/ffffff?text=SmartBiz',
    order: 6,
    active: true
  },
  {
    id: '7',
    name: 'ProSystems',
    logo: 'https://via.placeholder.com/200x80/14b8a6/ffffff?text=ProSystems',
    order: 7,
    active: true
  },
  {
    id: '8',
    name: 'MegaTech',
    logo: 'https://via.placeholder.com/200x80/f97316/ffffff?text=MegaTech',
    order: 8,
    active: true
  }
];
