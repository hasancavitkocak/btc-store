export interface Document {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: 'pdf' | 'pptx' | 'docx' | 'xlsx' | 'image';
  productId?: string; // Ürüne özel doküman
  categoryId?: string; // Kategoriye özel doküman
  thumbnail?: string;
  uploadDate: string;
  active: boolean;
  order: number;
}

export const documents: Document[] = [
  // Genel Dokümanlar
  {
    id: '1',
    title: 'Ürün Kataloğu 2024',
    description: 'Tüm ürünlerimizin detaylı kataloğu',
    fileUrl: '/documents/catalog-2024.pdf',
    fileType: 'pdf',
    thumbnail: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Katalog',
    uploadDate: new Date().toISOString(),
    active: true,
    order: 1
  },
  {
    id: '2',
    title: 'Satış Sunumu',
    description: 'Müşteri sunumları için hazır sunum',
    fileUrl: '/documents/sales-presentation.pptx',
    fileType: 'pptx',
    thumbnail: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Sunum',
    uploadDate: new Date().toISOString(),
    active: true,
    order: 2
  },
  {
    id: '3',
    title: 'Teknik Özellikler',
    description: 'Ürün teknik detayları ve spesifikasyonlar',
    fileUrl: '/documents/technical-specs.pdf',
    fileType: 'pdf',
    thumbnail: 'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Teknik',
    uploadDate: new Date().toISOString(),
    active: true,
    order: 3
  },
  
  // CRM Pro Dokümanları
  {
    id: 'doc-crm-pro-1',
    title: 'CRM Pro - Kullanım Kılavuzu',
    description: 'CRM Pro yazılımının detaylı kullanım kılavuzu ve özellikler',
    fileUrl: '/documents/crm-pro-user-guide.pdf',
    fileType: 'pdf',
    productId: 'crm-pro',
    thumbnail: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=CRM+Pro+Kilavuz',
    uploadDate: new Date().toISOString(),
    active: true,
    order: 1
  },
  {
    id: 'doc-crm-pro-2',
    title: 'CRM Pro - Teknik Dokümantasyon',
    description: 'Sistem gereksinimleri, kurulum ve entegrasyon rehberi',
    fileUrl: '/documents/crm-pro-technical.pdf',
    fileType: 'pdf',
    productId: 'crm-pro',
    thumbnail: 'https://via.placeholder.com/300x200/6366F1/FFFFFF?text=Teknik+Dok',
    uploadDate: new Date().toISOString(),
    active: true,
    order: 2
  },
  {
    id: 'doc-crm-pro-3',
    title: 'CRM Pro - Fiyat Listesi',
    description: 'Paket seçenekleri ve fiyatlandırma bilgileri',
    fileUrl: '/documents/crm-pro-pricing.xlsx',
    fileType: 'xlsx',
    productId: 'crm-pro',
    thumbnail: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Fiyat',
    uploadDate: new Date().toISOString(),
    active: true,
    order: 3
  },
  
  // Finance Suite Dokümanları
  {
    id: 'doc-finance-1',
    title: 'Finance Suite - Ürün Broşürü',
    description: 'Finans yönetim çözümünün genel tanıtımı',
    fileUrl: '/documents/finance-suite-brochure.pdf',
    fileType: 'pdf',
    productId: 'finance-suite',
    thumbnail: 'https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=Brosur',
    uploadDate: new Date().toISOString(),
    active: true,
    order: 1
  },
  {
    id: 'doc-finance-2',
    title: 'Finance Suite - Modül Detayları',
    description: 'Tüm modüllerin detaylı açıklamaları ve özellikleri',
    fileUrl: '/documents/finance-suite-modules.pdf',
    fileType: 'pdf',
    productId: 'finance-suite',
    thumbnail: 'https://via.placeholder.com/300x200/A855F7/FFFFFF?text=Moduller',
    uploadDate: new Date().toISOString(),
    active: true,
    order: 2
  },
  {
    id: 'doc-finance-3',
    title: 'Finance Suite - Demo Sunumu',
    description: 'Müşteri demolarında kullanılacak sunum',
    fileUrl: '/documents/finance-suite-demo.pptx',
    fileType: 'pptx',
    productId: 'finance-suite',
    thumbnail: 'https://via.placeholder.com/300x200/EC4899/FFFFFF?text=Demo',
    uploadDate: new Date().toISOString(),
    active: true,
    order: 3
  },
  
  // HR Manager Dokümanları
  {
    id: 'doc-hr-1',
    title: 'HR Manager - Hızlı Başlangıç',
    description: 'İlk kurulum ve temel kullanım rehberi',
    fileUrl: '/documents/hr-manager-quickstart.pdf',
    fileType: 'pdf',
    productId: 'hr-manager',
    thumbnail: 'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Baslangic',
    uploadDate: new Date().toISOString(),
    active: true,
    order: 1
  },
  {
    id: 'doc-hr-2',
    title: 'HR Manager - Özellik Karşılaştırması',
    description: 'Farklı paketlerin özellik karşılaştırma tablosu',
    fileUrl: '/documents/hr-manager-comparison.xlsx',
    fileType: 'xlsx',
    productId: 'hr-manager',
    thumbnail: 'https://via.placeholder.com/300x200/F97316/FFFFFF?text=Karsilastirma',
    uploadDate: new Date().toISOString(),
    active: true,
    order: 2
  },
  
  // Marketing Hub Dokümanları
  {
    id: 'doc-marketing-1',
    title: 'Marketing Hub - Kampanya Yönetimi',
    description: 'Kampanya oluşturma ve yönetim kılavuzu',
    fileUrl: '/documents/marketing-hub-campaigns.pdf',
    fileType: 'pdf',
    productId: 'marketing-hub',
    thumbnail: 'https://via.placeholder.com/300x200/EF4444/FFFFFF?text=Kampanya',
    uploadDate: new Date().toISOString(),
    active: true,
    order: 1
  },
  {
    id: 'doc-marketing-2',
    title: 'Marketing Hub - API Dokümantasyonu',
    description: 'Entegrasyon için API referans dokümanı',
    fileUrl: '/documents/marketing-hub-api.pdf',
    fileType: 'pdf',
    productId: 'marketing-hub',
    thumbnail: 'https://via.placeholder.com/300x200/DC2626/FFFFFF?text=API',
    uploadDate: new Date().toISOString(),
    active: true,
    order: 2
  },
  {
    id: 'doc-marketing-3',
    title: 'Marketing Hub - Başarı Hikayeleri',
    description: 'Müşteri başarı hikayeleri ve vaka çalışmaları',
    fileUrl: '/documents/marketing-hub-cases.pdf',
    fileType: 'pdf',
    productId: 'marketing-hub',
    thumbnail: 'https://via.placeholder.com/300x200/F87171/FFFFFF?text=Basari',
    uploadDate: new Date().toISOString(),
    active: true,
    order: 3
  },
  
  // Warehouse System Dokümanları
  {
    id: 'doc-warehouse-1',
    title: 'Warehouse System - Kurulum Rehberi',
    description: 'Adım adım kurulum ve yapılandırma',
    fileUrl: '/documents/warehouse-system-setup.pdf',
    fileType: 'pdf',
    productId: 'warehouse-system',
    thumbnail: 'https://via.placeholder.com/300x200/06B6D4/FFFFFF?text=Kurulum',
    uploadDate: new Date().toISOString(),
    active: true,
    order: 1
  },
  {
    id: 'doc-warehouse-2',
    title: 'Warehouse System - Barkod Entegrasyonu',
    description: 'Barkod okuyucu entegrasyon kılavuzu',
    fileUrl: '/documents/warehouse-system-barcode.pdf',
    fileType: 'pdf',
    productId: 'warehouse-system',
    thumbnail: 'https://via.placeholder.com/300x200/0891B2/FFFFFF?text=Barkod',
    uploadDate: new Date().toISOString(),
    active: true,
    order: 2
  },
  
  // CRM Lite Dokümanları
  {
    id: 'doc-crm-lite-1',
    title: 'CRM Lite - Başlangıç Paketi',
    description: 'Küçük işletmeler için CRM başlangıç rehberi',
    fileUrl: '/documents/crm-lite-starter.pdf',
    fileType: 'pdf',
    productId: 'crm-lite',
    thumbnail: 'https://via.placeholder.com/300x200/14B8A6/FFFFFF?text=CRM+Lite',
    uploadDate: new Date().toISOString(),
    active: true,
    order: 1
  },
  {
    id: 'doc-crm-lite-2',
    title: 'CRM Lite - Video Eğitim Linki',
    description: 'Online video eğitim serisi erişim bilgileri',
    fileUrl: '/documents/crm-lite-training.pdf',
    fileType: 'pdf',
    productId: 'crm-lite',
    thumbnail: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Egitim',
    uploadDate: new Date().toISOString(),
    active: true,
    order: 2
  }
];
