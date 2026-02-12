'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Save, X, ArrowLeft } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Toast from '../../components/Toast';
import ImageUpload from '../../components/ImageUpload';

interface PartnerFormProps {
  partnerId?: string;
}

export default function PartnerForm({ partnerId }: PartnerFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const { partners, addPartner, updatePartner } = useStore();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const isEditing = !!partnerId;
  const partner = isEditing ? partners.find(p => p.id === partnerId) : null;

  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    logoImage: [] as string[],
    active: true
  });

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name,
        logo: partner.logo,
        logoImage: partner.logo ? [partner.logo] : [],
        active: partner.active
      });
    }
  }, [partner]);

  const handleSave = () => {
    const partnerData = {
      name: formData.name,
      logo: formData.logoImage[0] || formData.logo,
      active: formData.active,
      order: partner?.order || partners.length + 1
    };

    if (isEditing && partnerId) {
      updatePartner(partnerId, partnerData);
      setToast({ message: 'Partner güncellendi!', type: 'success' });
    } else {
      const newPartner = {
        ...partnerData,
        id: Date.now().toString()
      };
      addPartner(newPartner as any);
      setToast({ message: 'Partner eklendi!', type: 'success' });
    }

    setTimeout(() => {
      router.push('/admin/partners');
    }, 1000);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/partners')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Button>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {isEditing ? 'Partner Düzenle' : 'Yeni Partner'}
        </h1>
      </div>

      <div className="max-w-4xl space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Partner Bilgileri</h2>
            <div className="space-y-4">
              <Input
                label="Partner Adı"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Microsoft, SAP, Oracle..."
                required
              />
              
              <ImageUpload
                images={formData.logoImage}
                onChange={(images) => setFormData({...formData, logoImage: images})}
                maxImages={1}
                label="Partner Logosu"
              />
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                  Aktif
                </label>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex gap-3">
              <Button onClick={handleSave} fullWidth className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                {t('common.save')}
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin/partners')} fullWidth>
                <X className="w-4 h-4 mr-2" />
                {t('common.cancel')}
              </Button>
            </div>
          </Card>
        </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
