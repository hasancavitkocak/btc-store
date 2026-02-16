'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, Plus, FileText, Download, Eye, Filter } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import { productService } from '../../services/product.service';
import { searchService } from '../../services/search.service';

interface Document {
  id: number;
  code: string;
  title: { tr: string; en: string; de: string; fr: string; es: string; it: string };
  description: { tr: string; en: string; de: string; fr: string; es: string; it: string };
  products: Array<{ code: string; name: { tr: string; en: string } }>;
  medias: Array<{ code: string; absolutePath: string; name?: string }>;
  active: boolean;
}

interface Product {
  code: string;
  name: { tr: string; en: string };
  active: boolean;
}

export default function DocumentsAdminList() {
  const router = useRouter();
  const { hasPermission } = useAuthStore();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; code: string | null }>({
    isOpen: false,
    code: null
  });

  const canManage = hasPermission('manage_documents');

  useEffect(() => {
    loadDocuments();
    loadProducts();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await searchService.searchAll<Document>('document');
      
      if (response.status === 'SUCCESS' && response.data) {
        const docsData = (response.data as any).data || response.data;
        setDocuments(Array.isArray(docsData) ? docsData : []);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setToast({ message: 'Dokümanlar yüklenirken hata oluştu!', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productService.getAll();
      if (response.status === 'SUCCESS' && response.data) {
        const productsData = (response.data as any).data || response.data;
        const activeProducts = Array.isArray(productsData) 
          ? productsData.filter((p: any) => p.active) 
          : [];
        setProducts(activeProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleDelete = async (code: string) => {
    try {
      const response = await fetch(`/api/v1/documents/${code}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (result.status === 'SUCCESS') {
        setToast({ message: 'Doküman başarıyla silindi!', type: 'success' });
        loadDocuments();
      } else {
        setToast({ message: 'Silme işlemi başarısız!', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      setToast({ message: 'Silme işlemi sırasında hata oluştu!', type: 'error' });
    } finally {
      setDeleteDialog({ isOpen: false, code: null });
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return <FileText className="w-8 h-8 text-blue-600" />;
  };

  // Filtreleme
  const filteredDocuments = documents.filter(doc => {
    if (!doc.active) return false;
    
    if (selectedProduct !== 'all') {
      if (selectedProduct === 'general' && doc.products && doc.products.length > 0) return false;
      if (selectedProduct !== 'general' && !doc.products?.find(p => p.code === selectedProduct)) return false;
    }
    
    return true;
  });

  // Ürüne göre grupla
  const groupedByProduct = filteredDocuments.reduce((acc, doc) => {
    if (!doc.products || doc.products.length === 0) {
      if (!acc['general']) acc['general'] = [];
      acc['general'].push(doc);
    } else {
      doc.products.forEach(product => {
        if (!acc[product.code]) acc[product.code] = [];
        acc[product.code].push(doc);
      });
    }
    return acc;
  }, {} as Record<string, Document[]>);

  const getProductName = (productCode: string) => {
    if (productCode === 'general') return 'Genel Dokümanlar';
    const product = products.find(p => p.code === productCode);
    return product?.name.tr || product?.name.en || 'Bilinmeyen Ürün';
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Dokümanlar
          </h1>
          <p className="text-gray-600">Satış dokümanlarını ve sunumları yönetin</p>
        </div>
        <Button
          onClick={() => router.push('/admin/documents/new')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Yeni Doküman
        </Button>
      </div>

      {/* Filtreler */}
      <Card className="p-6 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filtrele</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ürün
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tüm Dokümanlar</option>
              <option value="general">Genel Dokümanlar</option>
              {products.map(product => (
                <option key={product.code} value={product.code}>
                  {product.name.tr || product.name.en}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Ürüne göre gruplandırılmış dokümanlar */}
      {Object.entries(groupedByProduct).map(([productCode, docs]) => {
        const productName = getProductName(productCode);
        
        return (
          <div key={productCode} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-2 h-8 bg-blue-600 rounded"></div>
              {productName}
              <span className="text-sm font-normal text-gray-500">({docs.length} doküman)</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {docs.map((doc) => (
                <Card key={doc.code} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-center h-32 mb-4 bg-gray-50 rounded">
                    {doc.medias && doc.medias.length > 0 ? (
                      <img
                        src={doc.medias[0].absolutePath}
                        alt={doc.title.tr || doc.title.en}
                        className="max-w-full max-h-full object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<div class="w-8 h-8 text-blue-600"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>';
                        }}
                      />
                    ) : (
                      getFileIcon('document')
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {doc.title.tr || doc.title.en || 'Başlıksız'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {doc.description.tr || doc.description.en || ''}
                  </p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {doc.medias?.length || 0} Dosya
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {doc.medias && doc.medias.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(doc.medias[0].absolutePath, '_blank')}
                        className="flex-1 flex items-center justify-center border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                        title="Görüntüle"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {canManage && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admin/documents/${doc.code}`)}
                          className="flex-1 flex items-center justify-center border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteDialog({ isOpen: true, code: doc.code })}
                          className="flex items-center justify-center border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {filteredDocuments.length === 0 && (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">
            {documents.length === 0 ? 'Henüz doküman eklenmemiş' : 'Bu filtreye uygun doküman bulunamadı'}
          </p>
          {canManage && documents.length === 0 && (
            <Button onClick={() => router.push('/admin/documents/new')} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              İlk Dokümanı Ekle
            </Button>
          )}
        </Card>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Dokümanı Sil"
        message="Bu dokümanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        onConfirm={() => deleteDialog.code && handleDelete(deleteDialog.code)}
        onClose={() => setDeleteDialog({ isOpen: false, code: null })}
      />
    </div>
  );
}
