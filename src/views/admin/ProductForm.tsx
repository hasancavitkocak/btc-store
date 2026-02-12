'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Save, X, ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Toast from '../../components/Toast';
import ImageUpload from '../../components/ImageUpload';

const RichTextEditor = dynamic(() => import('../../components/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-lg" />
});

interface ProductFormProps {
  productId?: string;
}

export default function ProductForm({ productId }: ProductFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const { products, categories, addProduct, updateProduct } = useStore();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const isEditing = !!productId;
  const product = isEditing ? products.find(p => p.id === productId) : null;
  const users = useAuthStore((state) => state.users);

  const [formData, setFormData] = useState({
    nameKey: '',
    shortDescKey: '',
    categoryId: categories[0]?.id || '',
    image: '',
    images: [] as string[],
    features: '',
    htmlContent: '',
    active: true,
    responsibleUserId: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        nameKey: product.nameKey,
        shortDescKey: product.shortDescKey,
        categoryId: product.categoryId,
        image: product.image,
        images: product.images || [],
        features: product.features.join('\n'),
        htmlContent: product.htmlContent || '',
        active: product.active,
        responsibleUserId: product.responsibleUserId || ''
      });
    }
  }, [product]);

  const handleSave = () => {
    const productData = {
      nameKey: formData.nameKey,
      shortDescKey: formData.shortDescKey,
      categoryId: formData.categoryId,
      image: formData.images[0] || formData.image, // İlk görsel ana görsel
      images: formData.images,
      features: formData.features.split('\n').filter(f => f.trim()),
      htmlContent: formData.htmlContent,
      active: formData.active,
      responsibleUserId: formData.responsibleUserId || undefined
    };

    if (isEditing && productId) {
      updateProduct(productId, productData);
      setToast({ message: t('admin.productUpdated'), type: 'success' });
    } else {
      const newProduct = {
        ...productData,
        id: Date.now().toString()
      };
      addProduct(newProduct as any);
      setToast({ message: t('admin.productAdded'), type: 'success' });
    }

    setTimeout(() => {
      router.push('/admin/products');
    }, 1000);
  };

  const handleCancel = () => {
    router.push('/admin/products');
  };

  return (
    <Section>
      <Container>
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isEditing ? t('admin.editProduct') : t('admin.addProduct')}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Ürün bilgilerini düzenleyin' : 'Yeni ürün bilgilerini girin'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Temel Bilgiler</h2>
              <div className="space-y-4">
                <div>
                  <Input
                    label="Name Key (çeviri anahtarı)"
                    value={formData.nameKey}
                    onChange={(e) => setFormData({...formData, nameKey: e.target.value})}
                    placeholder="product.newProduct.name"
                    required
                  />
                  {formData.nameKey && (
                    <div className="mt-1 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                      <span className="font-medium">Önizleme:</span> {t(formData.nameKey)}
                    </div>
                  )}
                </div>
                <div>
                  <Input
                    label="Short Description Key (çeviri anahtarı)"
                    value={formData.shortDescKey}
                    onChange={(e) => setFormData({...formData, shortDescKey: e.target.value})}
                    placeholder="product.newProduct.shortDesc"
                    required
                  />
                  {formData.shortDescKey && (
                    <div className="mt-1 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                      <span className="font-medium">Önizleme:</span> {t(formData.shortDescKey)}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{t(cat.nameKey)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ürün Sorumlusu
                  </label>
                  <select
                    value={formData.responsibleUserId}
                    onChange={(e) => setFormData({...formData, responsibleUserId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sorumlu Seçiniz</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.email})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    Form gönderildiğinde bu kullanıcıya e-posta gönderilecek
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Görseller</h2>
              <ImageUpload
                images={formData.images}
                onChange={(images) => setFormData({...formData, images})}
                maxImages={5}
                label="Ürün Görselleri"
              />
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Özellikler</h2>
              <Textarea
                label="Ürün Özellikleri (her satıra bir özellik - çeviri anahtarı)"
                value={formData.features}
                onChange={(e) => setFormData({...formData, features: e.target.value})}
                rows={6}
                placeholder="product.newProduct.feature1&#10;product.newProduct.feature2&#10;product.newProduct.feature3"
                required
              />
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Detaylı Açıklama</h2>
              <RichTextEditor
                label="HTML İçerik"
                value={formData.htmlContent}
                onChange={(value) => setFormData({...formData, htmlContent: value})}
                placeholder="Ürün detaylı açıklamasını buraya yazın..."
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Yayın Durumu</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700">
                    Ürünü Aktif Et
                  </label>
                </div>
                <p className="text-sm text-gray-500">
                  Aktif ürünler web sitesinde görüntülenir
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">İşlemler</h2>
              <div className="space-y-3">
                <Button 
                  onClick={handleSave} 
                  fullWidth 
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Değişiklikleri Kaydet' : 'Ürünü Oluştur'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancel} 
                  fullWidth
                >
                  <X className="w-4 h-4 mr-2" />
                  {t('common.cancel')}
                </Button>
              </div>
            </Card>

            {isEditing && product && (
              <Card className="p-6 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Ürün Bilgileri</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">ID:</span> {product.id}</p>
                  <p><span className="font-medium">Durum:</span> {product.active ? 'Aktif' : 'Pasif'}</p>
                </div>
              </Card>
            )}
          </div>
        </div>

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
