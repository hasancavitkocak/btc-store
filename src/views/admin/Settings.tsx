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
import ImageUpload from '../../components/ImageUpload';

export default function Settings() {
  const t = useTranslations();
  const { header, updateHeader } = useStore();
  const [logo, setLogo] = useState(header.logo);
  const [logoImage, setLogoImage] = useState<string[]>([]); // Logo görseli için
  const [phone, setPhone] = useState(header.phone);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSave = () => {
    updateHeader({
      ...header,
      logo,
      phone
    });
    setToast({ message: 'Ayarlar başarıyla güncellendi!', type: 'success' });
  };

  return (
    <Section>
      <Container>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sistem Ayarları
          </h1>
          <p className="text-gray-600">Genel sistem ayarlarını yönetin</p>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Logo Ayarları</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mevcut Logo
                </label>
                <div className="bg-gray-50 p-4 rounded-lg inline-block">
                  <img 
                    src="/btc-store-logo.png" 
                    alt="Current Logo" 
                    className="h-16 w-auto"
                  />
                </div>
              </div>

              <ImageUpload
                images={logoImage}
                onChange={(images) => setLogoImage(images)}
                maxImages={1}
                label="Yeni Logo Yükle"
              />
              <p className="text-sm text-gray-500">
                Logo değiştirmek için yeni bir görsel yükleyin. Önerilen boyut: 200x60 px (PNG formatı önerilir)
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Genel Ayarlar</h2>
            <div className="space-y-4">
              <Input
                label="Site Adı"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="BTC Store"
              />

              <Input
                label="İletişim Telefonu"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+90 555 123 45 67"
              />
            </div>
          </Card>

          <Button onClick={handleSave} fullWidth className="bg-blue-900 hover:bg-blue-800">
            Değişiklikleri Kaydet
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
