'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, Plus, FileText, Filter } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import SearchableAutocomplete from '../../components/SearchableAutocomplete';
import { searchService, SearchFilter } from '../../services/search.service';
import { apiClient } from '@/lib/api';

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
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; code: string | null; title: string }>({
    isOpen: false,
    code: null,
    title: ''
  });

  const canManage = hasPermission('manage_documents');

  useEffect(() => {
    setPage(1); // Filtre değiştiğinde sayfa 1'e dön
  }, [selectedProducts]);

  useEffect(() => {
    loadDocuments();
  }, [selectedProducts, page]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      
      const filters: SearchFilter[] = [
        { name: 'active', value: true, searchCondition: 'EQUALS' }
      ];

      // Seçili ürünler varsa filtrele
      if (selectedProducts.length > 0) {
        const productCodes = selectedProducts.map(product => product.code);
        filters.push({
          name: 'products',
          relationField: 'code',
          values: productCodes,
          searchCondition: 'CONTAINS'
        } as any);
      }

      const response = await searchService.search<Document>(
        'document',
        { filters },
        page
      );
      
      if (response.status === 'SUCCESS' && response.data) {
        const wrappedData = response.data as any;
        const pageData = wrappedData.data || wrappedData;
        
        console.log('Page data:', pageData);
        
        if (pageData && pageData.content) {
          setDocuments(pageData.content || []);
          setTotalPages(pageData.totalPages || 0);
          setTotalElements(pageData.totalElements || 0);
          console.log('Total pages:', pageData.totalPages, 'Total elements:', pageData.totalElements);
        } else {
          setDocuments([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setToast({ message: 'Dokümanlar yüklenirken hata oluştu!', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    try {
      const response = await apiClient.delete(`/v1/documents/${code}`);

      if (response.status === 'SUCCESS') {
        setToast({ message: 'Doküman başarıyla silindi!', type: 'success' });
        loadDocuments();
      } else {
        setToast({ 
          message: response.errorMessage || 'Silme işlemi başarısız!', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      setToast({ message: 'Silme işlemi sırasında hata oluştu!', type: 'error' });
    } finally {
      setDeleteDialog({ isOpen: false, code: null, title: '' });
    }
  };

  const getFileIcon = () => {
    return <FileText className="w-8 h-8 text-blue-600" />;
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
        
        <SearchableAutocomplete<Product>
          itemType="product"
          searchField="name"
          locale="tr"
          selectedItems={selectedProducts}
          onItemsChange={setSelectedProducts}
          getItemKey={(product) => product.code}
          getItemLabel={(product) => product.name.tr || product.name.en}
          placeholder="Ürün ara..."
          label="Ürüne Göre Filtrele"
          multiple={true}
          additionalFilters={[
            { name: 'active', value: true, searchCondition: 'EQUALS' }
          ]}
        />
      </Card>

      {/* Doküman Listesi */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {selectedProducts.length > 0 ? 'Seçili Filtredeki Dokümanlar' : 'Tüm Dokümanlar'}
          <span className="text-sm font-normal text-gray-500 ml-3">({totalElements} doküman)</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {documents.map((doc) => (
            <Card key={doc.code} className="p-6 hover:shadow-lg transition-shadow flex flex-col">
              {/* Dosya Önizleme */}
              <div className="flex items-center justify-center h-32 mb-4 bg-gray-50 rounded">
                <FileText className="w-16 h-16 text-blue-600" />
              </div>
              
              {/* Başlık */}
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {doc.title.tr || doc.title.en || 'Başlıksız'}
              </h3>
              
              {/* Açıklama */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">
                {doc.description.tr || doc.description.en || ''}
              </p>
              
              {/* Dosya Sayısı */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  {doc.medias?.length || 0} Dosya
                </span>
              </div>

              {/* İlgili Ürünler */}
              {doc.products && doc.products.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">İlgili Ürünler:</p>
                  <div className="flex flex-wrap gap-1">
                    {doc.products.map((product, idx) => (
                      <span 
                        key={idx}
                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded"
                      >
                        {product.name.tr || product.name.en}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Aksiyon Butonları */}
              <div className="flex gap-2 mt-auto">
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
                  onClick={() => setDeleteDialog({ 
                    isOpen: true, 
                    code: doc.code,
                    title: doc.title.tr || doc.title.en || 'Başlıksız'
                  })}
                  className="flex-1 flex items-center justify-center border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Pagination */}
        {totalPages > 0 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-600">
              Toplam {totalElements} doküman
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                Önceki
              </Button>
              
              <span className="text-sm text-gray-600 px-4">
                Sayfa <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages || 1}</span>
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
              >
                Sonraki
              </Button>
            </div>
          </div>
        )}
      </div>

      {documents.length === 0 && (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">
            {selectedProducts.length > 0 ? 'Bu filtreye uygun doküman bulunamadı' : 'Henüz doküman eklenmemiş'}
          </p>
          {canManage && selectedProducts.length === 0 && (
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
        message={`"${deleteDialog.title}" başlıklı dokümanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        onConfirm={() => deleteDialog.code && handleDelete(deleteDialog.code)}
        onClose={() => setDeleteDialog({ isOpen: false, code: null, title: '' })}
      />
    </div>
  );
}
