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
  }
];
