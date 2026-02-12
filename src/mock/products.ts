export interface Product {
  id: string;
  nameKey: string;
  shortDescKey: string;
  categoryId: string;
  image: string;
  images?: string[];
  documents?: string[]; // Ürüne ait dokümanlar
  features: string[];
  contentKey: string;
  htmlContent?: string;
  order: number;
  active: boolean;
  responsibleUserId?: string;
}

export const products: Product[] = [
  {
    id: 'crm-pro',
    nameKey: 'product.crmPro.name',
    shortDescKey: 'product.crmPro.shortDesc',
    categoryId: 'crm',
    image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1200'
    ],
    features: ['product.crmPro.feature1', 'product.crmPro.feature2', 'product.crmPro.feature3'],
    contentKey: 'product.crmPro.content',
    htmlContent: `
      <h2>Advanced Customer Relationship Management</h2>
      <p>Our CRM Pro solution helps you manage customer relationships effectively with powerful tools and insights.</p>
      <h3>Key Features</h3>
      <ul>
        <li>360-degree customer view</li>
        <li>Sales pipeline management</li>
        <li>Marketing automation</li>
        <li>Real-time reporting</li>
      </ul>
      <h3>Benefits</h3>
      <p>Increase sales productivity by 40% and improve customer satisfaction with our intuitive CRM platform.</p>
    `,
    order: 1,
    active: true
  },
  {
    id: 'finance-suite',
    nameKey: 'product.financeSuite.name',
    shortDescKey: 'product.financeSuite.shortDesc',
    categoryId: 'finance',
    image: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/7688465/pexels-photo-7688465.jpeg?auto=compress&cs=tinysrgb&w=1200'
    ],
    features: ['product.financeSuite.feature1', 'product.financeSuite.feature2', 'product.financeSuite.feature3'],
    contentKey: 'product.financeSuite.content',
    htmlContent: `
      <h2>Complete Financial Management</h2>
      <p>Streamline your financial operations with our comprehensive suite of tools.</p>
      <h3>Modules</h3>
      <ul>
        <li>General Ledger</li>
        <li>Accounts Payable/Receivable</li>
        <li>Budget Management</li>
        <li>Financial Reporting</li>
      </ul>
    `,
    order: 2,
    active: true
  },
  {
    id: 'hr-manager',
    nameKey: 'product.hrManager.name',
    shortDescKey: 'product.hrManager.shortDesc',
    categoryId: 'hr',
    image: 'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&w=1200'
    ],
    features: ['product.hrManager.feature1', 'product.hrManager.feature2', 'product.hrManager.feature3'],
    contentKey: 'product.hrManager.content',
    htmlContent: `
      <h2>Human Resources Management System</h2>
      <p>Manage your workforce efficiently with our complete HR solution.</p>
      <h3>Features</h3>
      <ul>
        <li>Employee database</li>
        <li>Attendance tracking</li>
        <li>Leave management</li>
        <li>Performance reviews</li>
      </ul>
    `,
    order: 3,
    active: true
  },
  {
    id: 'marketing-hub',
    nameKey: 'product.marketingHub.name',
    shortDescKey: 'product.marketingHub.shortDesc',
    categoryId: 'marketing',
    image: 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1200'
    ],
    features: ['product.marketingHub.feature1', 'product.marketingHub.feature2', 'product.marketingHub.feature3'],
    contentKey: 'product.marketingHub.content',
    htmlContent: `
      <h2>Marketing Automation Platform</h2>
      <p>Drive growth with powerful marketing automation tools.</p>
      <h3>Capabilities</h3>
      <ul>
        <li>Email campaigns</li>
        <li>Social media management</li>
        <li>Lead scoring</li>
        <li>Analytics dashboard</li>
      </ul>
    `,
    order: 4,
    active: true
  },
  {
    id: 'warehouse-system',
    nameKey: 'product.warehouseSystem.name',
    shortDescKey: 'product.warehouseSystem.shortDesc',
    categoryId: 'warehouse',
    image: 'https://images.pexels.com/photos/4483611/pexels-photo-4483611.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/4483611/pexels-photo-4483611.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/4481258/pexels-photo-4481258.jpeg?auto=compress&cs=tinysrgb&w=1200'
    ],
    features: ['product.warehouseSystem.feature1', 'product.warehouseSystem.feature2', 'product.warehouseSystem.feature3'],
    contentKey: 'product.warehouseSystem.content',
    htmlContent: `
      <h2>Warehouse Management System</h2>
      <p>Optimize your inventory and warehouse operations.</p>
      <h3>Features</h3>
      <ul>
        <li>Inventory tracking</li>
        <li>Order management</li>
        <li>Barcode scanning</li>
        <li>Stock alerts</li>
      </ul>
    `,
    order: 5,
    active: true
  },
  {
    id: 'crm-lite',
    nameKey: 'product.crmLite.name',
    shortDescKey: 'product.crmLite.shortDesc',
    categoryId: 'crm',
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200'
    ],
    features: ['product.crmLite.feature1', 'product.crmLite.feature2'],
    contentKey: 'product.crmLite.content',
    htmlContent: `
      <h2>CRM Lite - Perfect for Small Businesses</h2>
      <p>Get started with customer relationship management at an affordable price.</p>
    `,
    order: 6,
    active: true
  }
];
