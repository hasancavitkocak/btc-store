export interface Reference {
  id: string;
  name: string;
  logo: string;
  order: number;
  active: boolean;
  showOnHome: boolean;
}

export const references: Reference[] = [
  {
    id: '1',
    name: 'Microsoft',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/200px-Microsoft_logo.svg.png',
    order: 1,
    active: true,
    showOnHome: true
  },
  {
    id: '2',
    name: 'Google',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png',
    order: 2,
    active: true,
    showOnHome: true
  },
  {
    id: '3',
    name: 'Amazon',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/200px-Amazon_logo.svg.png',
    order: 3,
    active: true,
    showOnHome: true
  },
  {
    id: '4',
    name: 'Apple',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/200px-Apple_logo_black.svg.png',
    order: 4,
    active: true,
    showOnHome: true
  },
  {
    id: '5',
    name: 'IBM',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/200px-IBM_logo.svg.png',
    order: 5,
    active: true,
    showOnHome: false
  },
  {
    id: '6',
    name: 'Oracle',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Oracle_logo.svg/200px-Oracle_logo.svg.png',
    order: 6,
    active: true,
    showOnHome: false
  },
  {
    id: '7',
    name: 'SAP',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/SAP_2011_logo.svg/200px-SAP_2011_logo.svg.png',
    order: 7,
    active: true,
    showOnHome: false
  },
  {
    id: '8',
    name: 'Salesforce',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/200px-Salesforce.com_logo.svg.png',
    order: 8,
    active: true,
    showOnHome: false
  },
  {
    id: '9',
    name: 'Adobe',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Adobe_Corporate_Logo.svg/200px-Adobe_Corporate_Logo.svg.png',
    order: 9,
    active: true,
    showOnHome: false
  },
  {
    id: '10',
    name: 'Intel',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Intel_logo_%282006-2020%29.svg/200px-Intel_logo_%282006-2020%29.svg.png',
    order: 10,
    active: true,
    showOnHome: false
  },
  {
    id: '11',
    name: 'Cisco',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Cisco_logo_blue_2016.svg/200px-Cisco_logo_blue_2016.svg.png',
    order: 11,
    active: true,
    showOnHome: false
  },
  {
    id: '12',
    name: 'HP',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/HP_logo_2012.svg/200px-HP_logo_2012.svg.png',
    order: 12,
    active: true,
    showOnHome: false
  }
];
