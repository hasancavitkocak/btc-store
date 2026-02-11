'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Edit2, Trash2, Plus, Save, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import RichTextEditor from '../../components/RichTextEditor';

export default function ProductsAdmin() {
  const t = useTranslations();
  const { products, categories } = useStore();
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [formData, setFormData] = useState({
    nameKey: '',
    shortDescKey: '',
    categoryId: '',
    image: '',
    images: '',
    features: '',
    htmlContent: '',
    active: true
  });

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      nameKey: product.nameKey,
      shortDescKey: product.shortDescKey,
      categoryId: product.categoryId,
      image: product.image,
      images: product.images?.join('\n') || '',
      features: product.features.join('\n'),
      htmlContent: product.htmlContent || '',
      active: product.active
    });
  };

  const handleSave = () => {
    setToast({ message: t('admin.productUpdated'), type: 'success' });
    setEditingProduct(null);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('admin.deleteConfirm'))) {
      setToast({ message: t('admin.productDeleted'), type: 'success' });
    }
  };

  const handleAdd = () => {
    setToast({ message: t('admin.productAdded'), type: 'success' });
    setIsAddModalOpen(false);
    setFormData({
      nameKey: '',
      shortDescKey: '',
      categoryId: '',
      image: '',
      images: '',
      features: '',
      htmlContent: '',
      active: true
    });
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
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="p-4">
              <img
                src={product.image}
                alt={t(product.nameKey)}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
              <h3 className="font-semibold">{t(product.nameKey)}</h3>
              <p className="text-sm text-gray-600">{t(product.shortDescKey)}</p>
              <div className="mt-2 mb-3">
                <span className={`text-xs px-2 py-1 rounded ${product.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {product.active ? t('admin.active') : t('admin.inactive')}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(product)}
                  className="flex-1 flex items-center justify-center gap-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
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

        {editingProduct && (
          <Modal isOpen={true} onClose={() => setEditingProduct(null)} title={t('admin.editProduct')} size="lg">
            <div className="space-y-4 p-6 max-h-[80vh] overflow-y-auto">
              <Input
                label="Name Key"
                value={formData.nameKey}
                onChange={(e) => setFormData({...formData, nameKey: e.target.value})}
              />
              <Input
                label="Short Description Key"
                value={formData.shortDescKey}
                onChange={(e) => setFormData({...formData, shortDescKey: e.target.value})}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{t(cat.nameKey)}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Main Image URL"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
              />
              <Textarea
                label="Additional Images (one per line)"
                value={formData.images}
                onChange={(e) => setFormData({...formData, images: e.target.value})}
                rows={3}
              />
              <Textarea
                label="Features (one per line)"
                value={formData.features}
                onChange={(e) => setFormData({...formData, features: e.target.value})}
                rows={4}
              />
              <RichTextEditor
                label="HTML Content"
                value={formData.htmlContent}
                onChange={(value) => setFormData({...formData, htmlContent: value})}
                placeholder="Ürün detaylı açıklamasını buraya yazın..."
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="w-4 h-4 text-blue-900 border-gray-300 rounded focus:ring-blue-900"
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1 bg-blue-900 hover:bg-blue-800">
                  <Save className="w-4 h-4 mr-2" />
                  {t('common.save')}
                </Button>
                <Button variant="outline" onClick={() => setEditingProduct(null)} className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {isAddModalOpen && (
          <Modal isOpen={true} onClose={() => setIsAddModalOpen(false)} title={t('admin.addProduct')} size="lg">
            <div className="space-y-4 p-6 max-h-[80vh] overflow-y-auto">
              <Input
                label="Name Key"
                value={formData.nameKey}
                onChange={(e) => setFormData({...formData, nameKey: e.target.value})}
                placeholder="product.newProduct.name"
              />
              <Input
                label="Short Description Key"
                value={formData.shortDescKey}
                onChange={(e) => setFormData({...formData, shortDescKey: e.target.value})}
                placeholder="product.newProduct.shortDesc"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{t(cat.nameKey)}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Main Image URL"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                placeholder="https://images.pexels.com/..."
              />
              <Textarea
                label="Additional Images (one per line)"
                value={formData.images}
                onChange={(e) => setFormData({...formData, images: e.target.value})}
                rows={3}
              />
              <Textarea
                label="Features (one per line)"
                value={formData.features}
                onChange={(e) => setFormData({...formData, features: e.target.value})}
                rows={4}
                placeholder="product.newProduct.feature1&#10;product.newProduct.feature2"
              />
              <RichTextEditor
                label="HTML Content"
                value={formData.htmlContent}
                onChange={(value) => setFormData({...formData, htmlContent: value})}
                placeholder="Ürün detaylı açıklamasını buraya yazın..."
              />
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAdd} className="flex-1 bg-blue-900 hover:bg-blue-800">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('admin.addProduct')}
                </Button>
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          </Modal>
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
