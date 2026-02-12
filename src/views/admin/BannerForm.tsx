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

interface BannerFormProps {
  bannerId?: string;
}

export default function BannerForm({ bannerId }: BannerFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const { banners, addBanner, updateBanner } = useStore();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const isEditing = !!bannerId;
  const banner = isEditing ? banners.find(b => b.id === bannerId) : null;

  const [formData, setFormData] = useState({
    titleKey: '',
    subtitleKey: '',
    buttonTextKey: '',
    buttonLink: '',
    image: '',
    imageFile: [] as string[],
    order: 0,
    active: true
  });

  useEffect(() => {
    if (banner) {
      setFormData({
        titleKey: banner.titleKey,
        subtitleKey: banner.subtitleKey,
        buttonTextKey: banner.buttonTextKey || '',
        buttonLink: banner.buttonLink || '',
        image: banner.image,
        imageFile: banner.image ? [banner.image] : [],
        order: banner.order,
        active: banner.active
      });
    } else {
      setFormData(prev => ({ ...prev, order: banners.length + 1 }));
    }
  }, [banner, banners.length]);

  const handleSave = () => {
    const bannerData = {
      titleKey: formData.titleKey,
      subtitleKey: formData.subtitleKey,
      buttonTextKey: formData.buttonTextKey,
      buttonLink: formData.buttonLink,
      image: formData.imageFile[0] || formData.image,
      order: formData.order,
      active: formData.active
    };

    if (isEditing && bannerId) {
      updateBanner(bannerId, bannerData);
      setToast({ message: t('admin.bannerUpdated'), type: 'success' });
    } else {
      const newBanner = {
        ...bannerData,
        id: Date.now().toString()
      };
      addBanner(newBanner as any);
      setToast({ message: t('admin.bannerAdded'), type: 'success' });
    }

    setTimeout(() => {
      router.push('/admin/banners');
    }, 1000);
  };

  return (
    <Section>
      <Container>
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/banners')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isEditing ? t('admin.editBanner') : t('admin.addBanner')}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Banner Bilgileri</h2>
              <div className="space-y-4">
                <div>
                  <Input
                    label={t('admin.titleKey')}
                    value={formData.titleKey}
                    onChange={(e) => setFormData({ ...formData, titleKey: e.target.value })}
                    placeholder="banner.hero.title"
                    required
                  />
                  {formData.titleKey && (
                    <div className="mt-1 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                      <span className="font-medium">Önizleme:</span> {t(formData.titleKey)}
                    </div>
                  )}
                </div>
                <div>
                  <Input
                    label={t('admin.subtitleKey')}
                    value={formData.subtitleKey}
                    onChange={(e) => setFormData({ ...formData, subtitleKey: e.target.value })}
                    placeholder="banner.hero.subtitle"
                    required
                  />
                  {formData.subtitleKey && (
                    <div className="mt-1 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                      <span className="font-medium">Önizleme:</span> {t(formData.subtitleKey)}
                    </div>
                  )}
                </div>
                <div>
                  <Input
                    label={t('admin.buttonTextKey')}
                    value={formData.buttonTextKey}
                    onChange={(e) => setFormData({ ...formData, buttonTextKey: e.target.value })}
                    placeholder="banner.hero.button"
                  />
                  {formData.buttonTextKey && (
                    <div className="mt-1 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                      <span className="font-medium">Önizleme:</span> {t(formData.buttonTextKey)}
                    </div>
                  )}
                </div>
                <Input
                  label={t('admin.buttonLink')}
                  value={formData.buttonLink}
                  onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                  placeholder="/products"
                />
                
                <ImageUpload
                  images={formData.imageFile}
                  onChange={(images) => setFormData({ ...formData, imageFile: images })}
                  maxImages={1}
                  label="Banner Görseli"
                />
                
                <Input
                  label={t('admin.order')}
                  type="number"
                  value={formData.order.toString()}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Durum</h2>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                  {t('admin.active')}
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
                <Button variant="outline" onClick={() => router.push('/admin/banners')} fullWidth>
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
