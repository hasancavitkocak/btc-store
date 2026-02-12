'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Save, X, ArrowLeft } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Toast from '../../components/Toast';
import ImageUpload from '../../components/ImageUpload';

interface CategoryFormProps {
  categoryId?: string;
}

export default function CategoryForm({ categoryId }: CategoryFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const { categories, addCategory, updateCategory } = useStore();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const isEditing = !!categoryId;
  const category = isEditing ? categories.find(c => c.id === categoryId) : null;

  const [formData, setFormData] = useState({
    nameKey: '',
    descriptionKey: '',
    image: '',
    imageFile: [] as string[],
    icon: '',
    showOnHome: true,
    order: 0,
    bgColor: '#EFF6FF',
    iconBgColor: '#0EA5E9',
    showButton: true,
    buttonText: '',
    buttonBgColor: '#0EA5E9',
    buttonTextColor: '#FFFFFF',
    buttonBorderColor: '#0EA5E9'
  });

  useEffect(() => {
    if (category) {
      setFormData({
        nameKey: category.nameKey,
        descriptionKey: category.descriptionKey,
        image: category.image,
        imageFile: category.image ? [category.image] : [],
        icon: category.icon,
        showOnHome: category.showOnHome,
        order: category.order,
        bgColor: category.bgColor || '#EFF6FF',
        iconBgColor: category.iconBgColor || '#0EA5E9',
        showButton: category.showButton !== false,
        buttonText: category.buttonText || '',
        buttonBgColor: category.buttonBgColor || '#0EA5E9',
        buttonTextColor: category.buttonTextColor || '#FFFFFF',
        buttonBorderColor: category.buttonBorderColor || '#0EA5E9'
      });
    } else {
      setFormData(prev => ({ ...prev, order: categories.length + 1 }));
    }
  }, [category, categories.length]);

  const handleSave = () => {
    const categoryData = {
      nameKey: formData.nameKey,
      descriptionKey: formData.descriptionKey,
      image: formData.imageFile[0] || formData.image,
      icon: formData.icon,
      showOnHome: formData.showOnHome,
      order: formData.order,
      bgColor: formData.bgColor,
      iconBgColor: formData.iconBgColor,
      showButton: formData.showButton,
      buttonText: formData.buttonText,
      buttonBgColor: formData.buttonBgColor,
      buttonTextColor: formData.buttonTextColor,
      buttonBorderColor: formData.buttonBorderColor
    };

    if (isEditing && categoryId) {
      updateCategory(categoryId, categoryData);
      setToast({ message: t('admin.categoryUpdated'), type: 'success' });
    } else {
      const newCategory = {
        ...categoryData,
        id: Date.now().toString()
      };
      addCategory(newCategory as any);
      setToast({ message: t('admin.categoryAdded'), type: 'success' });
    }

    setTimeout(() => {
      router.push('/admin/categories');
    }, 1000);
  };

  return (
    <Section>
      <Container>
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/categories')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isEditing ? t('admin.editCategory') : t('admin.addCategory')}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Kategori Bilgileri</h2>
              <div className="space-y-4">
                <div>
                  <Input
                    label="Name Key (çeviri anahtarı)"
                    value={formData.nameKey}
                    onChange={(e) => setFormData({...formData, nameKey: e.target.value})}
                    placeholder="category.crm.name"
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
                    label="Description Key (çeviri anahtarı)"
                    value={formData.descriptionKey}
                    onChange={(e) => setFormData({...formData, descriptionKey: e.target.value})}
                    placeholder="category.crm.description"
                    required
                  />
                  {formData.descriptionKey && (
                    <div className="mt-1 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                      <span className="font-medium">Önizleme:</span> {t(formData.descriptionKey)}
                    </div>
                  )}
                </div>
                
                <ImageUpload
                  images={formData.imageFile}
                  onChange={(images) => setFormData({...formData, imageFile: images})}
                  maxImages={1}
                  label="Kategori Görseli"
                />
                
                <Input
                  label="Sıra"
                  type="number"
                  value={formData.order.toString()}
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Renk Ayarları</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arka Plan Rengi
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.bgColor}
                      onChange={(e) => setFormData({...formData, bgColor: e.target.value})}
                      className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={formData.bgColor}
                      onChange={(e) => setFormData({...formData, bgColor: e.target.value})}
                      placeholder="#EFF6FF"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Buton Ayarları</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="showButton"
                    checked={formData.showButton}
                    onChange={(e) => setFormData({...formData, showButton: e.target.checked})}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="showButton" className="text-sm font-medium text-gray-700">
                    Butonu Göster
                  </label>
                </div>

                {formData.showButton && (
                  <>
                    <Input
                      label="Buton Metni (opsiyonel, boş bırakılırsa 'Daha Fazla' kullanılır)"
                      value={formData.buttonText}
                      onChange={(e) => setFormData({...formData, buttonText: e.target.value})}
                      placeholder="Daha Fazla Bilgi"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Buton Arka Plan Rengi
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.buttonBgColor}
                          onChange={(e) => setFormData({...formData, buttonBgColor: e.target.value})}
                          className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                          value={formData.buttonBgColor}
                          onChange={(e) => setFormData({...formData, buttonBgColor: e.target.value})}
                          placeholder="#0EA5E9"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Buton Yazı Rengi
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.buttonTextColor}
                          onChange={(e) => setFormData({...formData, buttonTextColor: e.target.value})}
                          className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                          value={formData.buttonTextColor}
                          onChange={(e) => setFormData({...formData, buttonTextColor: e.target.value})}
                          placeholder="#FFFFFF"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Buton Çerçeve Rengi
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.buttonBorderColor}
                          onChange={(e) => setFormData({...formData, buttonBorderColor: e.target.value})}
                          className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                          value={formData.buttonBorderColor}
                          onChange={(e) => setFormData({...formData, buttonBorderColor: e.target.value})}
                          placeholder="#0EA5E9"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Önizleme</h2>
              <div 
                className="rounded-lg p-6 min-h-[200px] flex items-center justify-center"
                style={{ backgroundColor: formData.bgColor }}
              >
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {formData.nameKey ? t(formData.nameKey) : 'Kategori Adı'}
                  </h3>
                  {formData.showButton && (
                    <button
                      className="px-6 py-2 rounded-lg font-medium transition-all shadow-lg"
                      style={{
                        backgroundColor: formData.buttonBgColor,
                        color: formData.buttonTextColor,
                        borderWidth: '2px',
                        borderColor: formData.buttonBorderColor
                      }}
                    >
                      {formData.buttonText || t('common.learnMore')}
                    </button>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Görünürlük</h2>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="showOnHome"
                  checked={formData.showOnHome}
                  onChange={(e) => setFormData({...formData, showOnHome: e.target.checked})}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="showOnHome" className="text-sm font-medium text-gray-700">
                  Ana Sayfada Göster
                </label>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">İşlemler</h2>
              <div className="space-y-3">
                <Button onClick={handleSave} fullWidth className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  {t('common.save')}
                </Button>
                <Button variant="outline" onClick={() => router.push('/admin/categories')} fullWidth>
                  <X className="w-4 h-4 mr-2" />
                  {t('common.cancel')}
                </Button>
              </div>
            </Card>
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
