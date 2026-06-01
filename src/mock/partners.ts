export interface Partner {
  id: string;
  name: string;
  logo: string;
  description?: string;
  order: number;
  active: boolean;
}

export const partners: Partner[] = [
  {
    id: 'microsoft',
    name: 'Microsoft',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/320px-Microsoft_logo.svg.png',
    order: 1,
    active: true
  },
  {
    id: 'sap',
    name: 'SAP',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/SAP_2011_logo.svg/320px-SAP_2011_logo.svg.png',
    order: 2,
    active: true
  },
  {
    id: 'oracle',
    name: 'Oracle',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Oracle_logo.svg/320px-Oracle_logo.svg.png',
    order: 3,
    active: true
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/320px-Salesforce.com_logo.svg.png',
    order: 4,
    active: true
  },
  {
    id: 'ibm',
    name: 'IBM',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/320px-IBM_logo.svg.png',
    order: 5,
    active: true
  },
  {
    id: 'aws',
    name: 'Amazon Web Services',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/320px-Amazon_Web_Services_Logo.svg.png',
    order: 6,
    active: true
  },
  {
    id: 'google-cloud',
    name: 'Google Cloud',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Google_Cloud_logo.svg/320px-Google_Cloud_logo.svg.png',
    order: 7,
    active: true
  },
  {
    id: 'adobe',
    name: 'Adobe',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Adobe_Corporate_Logo.svg/320px-Adobe_Corporate_Logo.svg.png',
    order: 8,
    active: true
  }
];
