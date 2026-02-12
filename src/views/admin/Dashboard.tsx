'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { LayoutDashboard, Image, FolderTree, Package, Users, BookOpen, FileText, MessageSquare, RefreshCw } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';

export default function Dashboard() {
  const t = useTranslations();
  const { banners, categories, products, references, stories, callRequests, productContactForms, resetToDefaults } = useStore();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const handleReset = () => {
    if (confirm('Tüm veriler varsayılan değerlere sıfırlanacak. Emin misiniz?')) {
      // Store'u sıfırla
      resetToDefaults();
      
      // Auth store'u da sıfırla (localStorage'dan sil)
      localStorage.removeItem('auth-store');
      
      setToast({ message: 'Veriler başarıyla sıfırlandı! Sayfa yenileniyor...', type: 'success' });
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 1500);
    }
  };

  const stats = [
    { icon: Image, label: t('admin.banners'), count: banners.length, link: '/admin/banners' },
    { icon: FolderTree, label: t('admin.categories'), count: categories.length, link: '/admin/categories' },
    { icon: Package, label: t('admin.products'), count: products.length, link: '/admin/products' },
    { icon: Users, label: t('admin.references'), count: references.length, link: '/admin/references' },
    { icon: BookOpen, label: t('admin.stories'), count: stories.length, link: '/admin/stories' },
    { icon: MessageSquare, label: t('admin.forms'), count: callRequests.length + productContactForms.length, link: '/admin/forms' }
  ];

  return (
    <Section>
      <Container>
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('admin.dashboard')}
            </h1>
            <p className="text-gray-600">{t('admin.welcome')}</p>
          </div>
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
            Verileri Sıfırla
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} href={stat.link}>
                <Card hover className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.count}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('admin.quickActions')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/admin/forms">
              <Card hover className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('admin.viewForms')}
                </h3>
                <p className="text-gray-600">
                  {callRequests.length + productContactForms.length} {t('admin.totalSubmissions')}
                </p>
              </Card>
            </Link>
            <Link href="/admin/header">
              <Card hover className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('admin.updateHeader')}
                </h3>
                <p className="text-gray-600">
                  {t('admin.manageLogoPhone')}
                </p>
              </Card>
            </Link>
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