'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
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
import { getLocalizedText, type SupportedLocale } from '../../lib/i18n-utils';

interface Product {
  code: string;
  name: { tr: string; en: string };
  shortDescription: { tr: string; en: string };
  categories?: Array<{ code: string; name: { tr: string; en: string } }>;
  mainImage?: { absolutePath: string };
  responsibleUsers?: Array<{ username: string; email: string; picture?: { absolutePath: string } }>;
  active: boolean;
}

export default function ProductsAdmin() {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale() as SupportedLocale;
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
          setToast({ message: t('admin.productsPage.dataFormatError'), type: 'error' });
        }
      } else {
        setToast({ 
          message: response.errorMessage || t('admin.productsPage.loadError'), 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setToast({ message: t('admin.productsPage.loadError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    try {
      const response = await productService.delete(code);
      
      if (response.status === 'SUCCESS') {
        setToast({ message: t('admin.productsPage.deleteSuccess'), type: 'success' });
        setPage(1);
        if (page === 1) {
          loadProducts();
        }
      } else {
        setToast({ message: response.errorMessage || t('admin.productsPage.deleteFailed'), type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setToast({ message: t('admin.productsPage.deleteError'), type: 'error' });
    }
  };

  return (
    <Section>
      <Container>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('admin.productsPage.title')}</h1>
            <p className="text-gray-600">{t('admin.productsPage.totalProducts', { count: totalElements })}</p>
          </div>
          <Button onClick={() => router.push('/admin/products/new')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-2" />
            {t('admin.productsPage.newProduct')}
          </Button>
        </div>

        <Card>
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">{t('admin.productsPage.loading')}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">{t('admin.productsPage.noProducts')}</p>
              <Button onClick={() => router.push('/admin/products/new')} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                {t('admin.productsPage.addFirstProduct')}
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.productsPage.image')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.productsPage.productName')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.productsPage.categories')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.productsPage.responsibles')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.productsPage.status')}</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.productsPage.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.code} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={product.mainImage?.absolutePath || '/no-image.svg'}
                            alt={getLocalizedText(product.name, locale)}
                            className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => product.mainImage?.absolutePath && setLightbox({
                              isOpen: true,
                              imageUrl: product.mainImage.absolutePath,
                              alt: getLocalizedText(product.name, locale)
                            })}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{getLocalizedText(product.name, locale)}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{getLocalizedText(product.shortDescription, locale)}</div>
                        </td>
                        <td className="px-6 py-4">
                          {product.categories && product.categories.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {product.categories.slice(0, 2).map((cat, idx) => (
                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {getLocalizedText(cat.name, locale)}
                                </span>
                              ))}
                              {product.categories.length > 2 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  +{product.categories.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {product.responsibleUsers && product.responsibleUsers.length > 0 ? (
                            <div className="flex items-center gap-1">
                              {product.responsibleUsers.slice(0, 3).map((user, idx) => (
                                <div key={idx} className="relative group">
                                  {user.picture?.absolutePath ? (
                                    <img
                                      src={user.picture.absolutePath}
                                      alt={user.username}
                                      className="w-8 h-8 rounded-full object-cover border-2 border-white"
                                      title={user.username}
                                    />
                                  ) : (
                                    <div
                                      className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-semibold border-2 border-white"
                                      title={user.username}
                                    >
                                      {user.username.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                              ))}
                              {product.responsibleUsers.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-semibold border-2 border-white">
                                  +{product.responsibleUsers.length - 3}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {product.active ? t('admin.productsPage.active') : t('admin.productsPage.inactive')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/admin/products/${product.code}`)}
                              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteDialog({ 
                                isOpen: true, 
                                code: product.code, 
                                name: getLocalizedText(product.name, locale)
                              })}
                              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {t('admin.productsPage.totalRecords', { count: totalElements })}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {t('admin.productsPage.previous')}
                  </Button>
                  
                  <span className="text-sm text-gray-600 px-4">
                    {t('admin.productsPage.page')} <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages || 1}</span>
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                  >
                    {t('admin.productsPage.next')}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>

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
          title={t('admin.productsPage.deleteDialogTitle')}
          message={t('admin.productsPage.deleteDialogMessage', { name: deleteDialog.name })}
          confirmText={t('admin.productsPage.delete')}
          cancelText={t('admin.productsPage.cancel')}
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
