'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, Plus, FileText, Download, Eye, Filter } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';

export default function DocumentsAdminList() {
  const router = useRouter();
  const { documents, deleteDocument, products, categories } = useStore();
  const { hasPermission } = useAuthStore();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const canManage = hasPermission('manage_documents');

  const handleDelete = (id: string) => {
    if (confirm('Bu dokümanı silmek istediğinizden emin misiniz?')) {
      deleteDocument(id);
      setToast({ message: 'Doküman başarıyla silindi!', type: 'success' });
    }
  };

  const getFileIcon = (fileType: string) => {
    return <FileText className="w-8 h-8 text-blue-600" />;
  };

  const getProductName = (productId?: string) => {
    if (!productId) return 'Genel';
    const product = products.find(p => p.id === productId);
    return product?.nameKey || 'Bilinmeyen Ürün';
  };

  // Filtreleme
  const filteredDocuments = documents.filter(doc => {
    if (!doc.active) return false;
    
    if (selectedProduct !== 'all') {
      if (selectedProduct === 'general' && doc.productId) return false;
      if (selectedProduct !== 'general' && doc.productId !== selectedProduct) return false;
    }
    
    if (selectedCategory !== 'all' && doc.categoryId !== selectedCategory) return false;
    
    return true;
  });

  // Ürüne göre grupla
  const groupedByProduct = filteredDocuments.reduce((acc, doc) => {
    const key = doc.productId || 'general';
    if (!acc[key]) acc[key] = [];
    acc[key].push(doc);
    return acc;
  }, {} as Record<string, typeof documents>);

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Dokümanlar
          </h1>
          <p className="text-gray-600">Satış dokümanlarını ve sunumları yönetin</p>
        </div>
        {canManage && (
          <Button
            onClick={() => router.push('/admin/documents/new')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Yeni Doküman
          </Button>
        )}
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
                <option key={product.id} value={product.id}>
                  {product.nameKey}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.nameKey}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Ürüne göre gruplandırılmış dokümanlar */}
      {Object.entries(groupedByProduct).map(([productId, docs]) => {
        const productName = productId === 'general' ? 'Genel Dokümanlar' : getProductName(productId);
        
        return (
          <div key={productId} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-2 h-8 bg-blue-600 rounded"></div>
              {productName}
              <span className="text-sm font-normal text-gray-500">({docs.length} doküman)</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {docs.map((doc) => (
                <Card key={doc.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-center h-32 mb-4 bg-gray-50 rounded">
                    {doc.thumbnail ? (
                      <img
                        src={doc.thumbnail}
                        alt={doc.title}
                        className="max-w-full max-h-full object-cover rounded"
                      />
                    ) : (
                      getFileIcon(doc.fileType)
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{doc.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{doc.description}</p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {doc.fileType.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(doc.fileUrl, '_blank')}
                      className="flex-1 flex items-center justify-center border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                      title="Görüntüle"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    {canManage && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admin/documents/${doc.id}`)}
                          className="flex-1 flex items-center justify-center border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(doc.id)}
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
    </div>
  );
}
