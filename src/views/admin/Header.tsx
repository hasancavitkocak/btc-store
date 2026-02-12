'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useStore } from '../../store/useStore';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Toast from '../../components/Toast';

export default function Header() {
  const t = useTranslations();
  const { header, updateHeader } = useStore();
  const [logo, setLogo] = useState(header.logo);
  const [phone, setPhone] = useState(header.phone);
  const [bannerEnabled, setBannerEnabled] = useState(!!header.topBanner);
  const [bannerText, setBannerText] = useState(header.topBanner?.textKey || '');
  const [bannerBgColor, setBannerBgColor] = useState(header.topBanner?.bgColor || '#1e3a8a');
  const [bannerLink, setBannerLink] = useState(header.topBanner?.link || '');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSave = () => {
    updateHeader({
      ...header,
      logo,
      phone,
      topBanner: bannerEnabled ? {
        textKey: bannerText,
        bgColor: bannerBgColor,
        link: bannerLink || undefined
      } : undefined
    });
    setToast({ message: t('admin.headerUpdated'), type: 'success' });
  };

  return (
    <Section>
      <Container>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('admin.header')}
          </h1>
          <p className="text-gray-600">{t('admin.manageHeader')}</p>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Genel Ayarlar</h2>
            <div className="space-y-4">
              <Input
                label={t('admin.logoText')}
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="BTC Store"
              />

              <Input
                label={t('admin.phoneNumber')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+90 555 123 45 67"
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{t('admin.topBanner')}</h2>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="bannerEnabled"
                  checked={bannerEnabled}
                  onChange={(e) => setBannerEnabled(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="bannerEnabled" className="text-sm font-medium text-gray-700">
                  {t('admin.enableBanner')}
                </label>
              </div>
            </div>

            {bannerEnabled && (
              <div className="space-y-4">
                <Input
                  label={t('admin.bannerText')}
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  placeholder="banner.campaign"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.bannerBgColor')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={bannerBgColor}
                      onChange={(e) => setBannerBgColor(e.target.value)}
                      className="w-16 h-10 rounded border border-gray-300"
                    />
                    <Input
                      value={bannerBgColor}
                      onChange={(e) => setBannerBgColor(e.target.value)}
                      placeholder="#1e3a8a"
                    />
                  </div>
                </div>

                <Input
                  label={t('admin.bannerLink')}
                  value={bannerLink}
                  onChange={(e) => setBannerLink(e.target.value)}
                  placeholder="/products"
                />

                <div 
                  className="p-3 rounded text-white text-center text-sm"
                  style={{ backgroundColor: bannerBgColor }}
                >
                  {t(bannerText) || 'Banner önizlemesi'}
                </div>
              </div>
            )}
          </Card>

          <Button onClick={handleSave} fullWidth className="bg-blue-900 hover:bg-blue-800">
            {t('admin.saveChanges')}
          </Button>
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
