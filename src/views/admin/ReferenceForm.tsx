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

interface ReferenceFormProps {
  referenceId?: string;
}

export default function ReferenceForm({ referenceId }: ReferenceFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const { references, addReference, updateReference } = useStore();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const isEditing = !!referenceId;
  const reference = isEditing ? references.find(r => r.id === referenceId) : null;

  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    logoImage: [] as string[],
    active: true,
    showOnHome: false
  });

  useEffect(() => {
    if (reference) {
      setFormData({
        name: reference.name,
        logo: reference.logo,
        logoImage: reference.logo ? [reference.logo] : [],
        active: reference.active,
        showOnHome: reference.showOnHome || false
      });
    }
  }, [reference]);

  const handleSave = () => {
    const referenceData = {
      name: formData.name,
      logo: formData.logoImage[0] || formData.logo,
      active: formData.active,
      showOnHome: formData.showOnHome
    };

    if (isEditing && referenceId) {
      updateReference(referenceId, referenceData);
      setToast({ message: t('admin.referenceUpdated'), type: 'success' });
    } else {
      const newReference = {
        ...referenceData,
        id: Date.now().toString()
      };
      addReference(newReference as any);
      setToast({ message: t('admin.referenceAdded'), type: 'success' });
    }

    setTimeout(() => {
      router.push('/admin/references');
    }, 1000);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/references')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Button>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {isEditing ? t('admin.editReference') : t('admin.addReference')}
        </h1>
      </div>

      <div className="max-w-4xl space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Referans Bilgileri</h2>
            <div className="space-y-4">
              <Input
                label="Şirket Adı"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Company Inc."
                required
              />
              
              <ImageUpload
                images={formData.logoImage}
                onChange={(images) => setFormData({...formData, logoImage: images})}
                maxImages={1}
                label="Logo"
              />
              
              <div className="space-y-3">
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
                <p className="text-xs text-gray-500 ml-8">
                  Ana sayfada sadece 4 referans gösterilir. Sıralama &quot;order&quot; değerine göre yapılır.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex gap-3">
              <Button onClick={handleSave} fullWidth className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                {t('common.save')}
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin/references')} fullWidth>
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
