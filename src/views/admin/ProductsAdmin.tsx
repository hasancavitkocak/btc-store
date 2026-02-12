'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';
import { useState } from 'react';

export default function ProductsAdmin() {
  const t = useTranslations();
  const router = useRouter();
  const { products, deleteProduct } = useStore();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const handleEdit = (productId: string) => {
    router.push(`/admin/products/${productId}`);
  };

  const handleAdd = () => {
    router.push('/admin/products/new');
  };

  const handleDelete = (id: string) => {
    if (confirm(t('admin.deleteConfirm'))) {
      deleteProduct(id);
      setToast({ message: t('admin.productDeleted'), type: 'success' });
    }
  };

  return (
    <Section>
      <Container>
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('admin.products')}
            </h1>
            <p className="text-gray-600">{t('admin.manageProducts')}</p>
          </div>
          <Button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            {t('admin.addProduct')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="p-4 hover:shadow-lg transition-shadow">
              <img
                src={product.image}
                alt={t(product.nameKey)}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
              <h3 className="font-semibold">{t(product.nameKey)}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{t(product.shortDescKey)}</p>
              <div className="mt-2 mb-3">
                <span className={`text-xs px-2 py-1 rounded ${product.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {product.active ? t('admin.active') : t('admin.inactive')}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(product.id)}
                  className="flex-1 flex items-center justify-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                  {t('common.edit')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(product.id)}
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
            <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              İlk Ürünü Ekle
            </Button>
          </Card>
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </Container>
    </Section>
  );
}
