'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';

export default function Banners() {
  const t = useTranslations();
  const router = useRouter();
  const { banners, deleteBanner } = useStore();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleDelete = (id: string) => {
    if (confirm(t('admin.deleteConfirm'))) {
      deleteBanner(id);
      setToast({ message: t('admin.bannerDeleted'), type: 'success' });
    }
  };

  return (
    <Section>
      <Container>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('admin.banners')}
            </h1>
            <p className="text-gray-600">{t('admin.manageBanners')}</p>
          </div>
          <Button onClick={() => router.push('/admin/banners/new')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-2" />
            {t('admin.addBanner')}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {banners.sort((a, b) => a.order - b.order).map((banner) => (
            <Card key={banner.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <img
                  src={banner.image}
                  alt={t(banner.titleKey)}
                  className="w-32 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{t(banner.titleKey)}</h3>
                  <p className="text-gray-600 text-sm">{t(banner.subtitleKey)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${banner.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {banner.active ? t('admin.active') : t('admin.inactive')}
                    </span>
                    <span className="text-xs text-gray-500">{t('admin.order')}: {banner.order}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/banners/${banner.id}`)}
                    className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(banner.id)}
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {banners.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-gray-500 mb-4">Henüz banner eklenmemiş</p>
            <Button onClick={() => router.push('/admin/banners/new')} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              İlk Banner&apos;ı Ekle
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
