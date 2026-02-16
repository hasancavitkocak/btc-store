'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import ImageLightbox from '../../components/ImageLightbox';
import { searchService, SearchFormData } from '../../services/search.service';
import { productService } from '../../services/product.service';

interface Product {
  code: string;
  name: { tr: string; en: string };
  shortDescription: { tr: string; en: string };
  categories?: Array<{ code: string; name: { tr: string; en: string } }>;
  mainImage?: { absolutePath: string };
  responsibleUsers?: Array<{ username: string; email: string }>;
  active: boolean;
}

export default function ProductsAdmin() {
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; code: string; name: string }>({
    isOpen: false,
    code: '',
    name: ''
  });
  const [lightbox, setLightbox] = useState<{ isOpen: boolean; imageUrl: string; alt: string }>({
    isOpen: false,
    imageUrl: '',
    alt: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadProducts();
    }
  }, [page, mounted]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      const searchFormData: SearchFormData = {
        filters: [],
        sort: { name: 'code', direction: 'ASC' }
      };

      const response = await searchService.search<Product>('product', searchFormData, page);
      
      if (response.status === 'SUCCESS' && response.data) {
        const pageData = (response.data as any).data;
        
        if (pageData && pageData.content) {
          setProducts(pageData.content || []);
          setTotalPages(pageData.totalPages || 0);
          setTotalElements(pageData.totalElements || 0);
        } else {
          console.error('pageData structure is wrong:', pageData);
          setToast({ message: 'Veri formatı hatalı', type: 'error' });
        }
      } else {
        setToast({ 
          message: response.errorMessage || 'Ürünler yüklenirken hata oluştu', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setToast({ message: 'Ürünler yüklenirken hata oluştu', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    try {
      const response = await productService.delete(code);
      
      if (response.status === 'SUCCESS') {
        setToast({ message: 'Ürün silindi', type: 'success' });
        setPage(1);
        if (page === 1) {
          loadProducts();
        }
      } else {
        setToast({ message: response.errorMessage || 'Silme işlemi başarısız', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setToast({ message: 'Ürün silinirken hata oluştu', type: 'error' });
    }
  };

  return (
    <Section>
      <Container>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Ürünler
            </h1>
            <p className="text-gray-600">Toplam {totalElements} ürün</p>
          </div>
          <Button onClick={() => router.push('/admin/products/new')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-2" />
            Yeni Ürün
          </Button>
        </div>

        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">Yükleniyor...</p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <Card key={product.code} className="p-4 hover:shadow-lg transition-shadow">
                  <img
                    src={product.mainImage?.absolutePath || '/no-image.svg'}
                    alt={product.name.tr || product.name.en}
                    className="w-full h-40 object-cover rounded-lg mb-3 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => product.mainImage?.absolutePath && setLightbox({
                      isOpen: true,
                      imageUrl: product.mainImage.absolutePath,
                      alt: product.name.tr || product.name.en
                    })}
                  />
                  <h3 className="font-semibold text-lg mb-2">
                    {product.name.tr || product.name.en}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {product.shortDescription.tr || product.shortDescription.en}
                  </p>
                  
                  {product.categories && product.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {product.categories.slice(0, 2).map((cat, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                          {cat.name.tr || cat.name.en}
                        </span>
                      ))}
                      {product.categories.length > 2 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          +{product.categories.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {product.responsibleUsers && product.responsibleUsers.length > 0 && (
                    <div className="text-xs text-gray-500 mb-2 flex flex-wrap gap-1">
                      {product.responsibleUsers.slice(0, 2).map((user, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1">
                          👤 {user.username}
                        </span>
                      ))}
                      {product.responsibleUsers.length > 2 && (
                        <span>+{product.responsibleUsers.length - 2}</span>
                      )}
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <span className={`text-xs px-2 py-1 rounded ${product.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.active ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/products/${product.code}`)}
                      className="flex-1 flex items-center justify-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                      Düzenle
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteDialog({ 
                        isOpen: true, 
                        code: product.code, 
                        name: product.name.tr || product.name.en
                      })}
                      className="flex items-center justify-center gap-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {products.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-gray-500 mb-4">Henüz ürün eklenmemiş</p>
                <Button onClick={() => router.push('/admin/products/new')} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  İlk Ürünü Ekle
                </Button>
              </Card>
            )}

            {totalElements > 0 && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-600">
                  Toplam <span className="font-medium">{totalElements}</span> kayıt
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Önceki
                  </Button>
                  
                  <span className="text-sm text-gray-600 px-4">
                    Sayfa <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages || 1}</span>
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                  >
                    Sonraki
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
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
          onClose={() => setDeleteDialog({ isOpen: false, code: '', name: '' })}
          onConfirm={() => handleDelete(deleteDialog.code)}
          title="Ürün Sil"
          message={`"${deleteDialog.name}" ürününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
          confirmText="Sil"
          cancelText="İptal"
          type="danger"
        />

        <ImageLightbox
          isOpen={lightbox.isOpen}
          imageUrl={lightbox.imageUrl}
          alt={lightbox.alt}
          onClose={() => setLightbox({ isOpen: false, imageUrl: '', alt: '' })}
        />
      </Container>
    </Section>
  );
}
