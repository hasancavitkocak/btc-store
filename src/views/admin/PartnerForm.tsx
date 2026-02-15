'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Save, X, ArrowLeft } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Toast from '../../components/Toast';
import ImageUpload from '../../components/ImageUpload';
import ImageLightbox from '../../components/ImageLightbox';
import { partnerService } from '../../services/admin.service';

interface PartnerFormProps {
  partnerId?: string;
}

export default function PartnerForm({ partnerId }: PartnerFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [newMediaFile, setNewMediaFile] = useState<File | null>(null);
  const [shouldRemoveMedia, setShouldRemoveMedia] = useState(false);
  const [lightbox, setLightbox] = useState<{ isOpen: boolean; imageUrl: string }>({
    isOpen: false,
    imageUrl: ''
  });
  
  const isEditing = !!partnerId;

  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    code: '',
    name: '',
    logo: '',
    order: 0,
    active: true,
    showOnHome: false
  });

  useEffect(() => {
    if (partnerId) {
      loadPartner();
    }
  }, [partnerId]);

  const loadPartner = async () => {
    try {
      setLoading(true);
      const response = await partnerService.getByCode(partnerId!);
      
      if (response.status === 'SUCCESS' && response.data) {
        const partnerData = (response.data as any).data || response.data;
        
        setFormData({
          id: partnerData.id,
          code: partnerData.code,
          name: partnerData.name || '',
          logo: partnerData.logo || '',
          order: partnerData.order || 0,
          active: partnerData.active ?? true,
          showOnHome: partnerData.showOnHome ?? false
        });
        
        if (partnerData.media?.absolutePath) {
          setImageFiles([partnerData.media.absolutePath]);
        } else if (partnerData.logo) {
          setImageFiles([partnerData.logo]);
        }
      }
    } catch (error) {
      console.error('Error loading partner:', error);
      setToast({ message: 'Partner yüklenirken hata oluştu', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (images: string[]) => {
    setImageFiles(images);
    
    if (images.length === 0) {
      setNewMediaFile(null);
      setShouldRemoveMedia(true);
    } else if (images[0].startsWith('data:')) {
      setShouldRemoveMedia(false);
      fetch(images[0])
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'partner-logo.jpg', { type: 'image/jpeg' });
          setNewMediaFile(file);
        });
    } else {
      setShouldRemoveMedia(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setToast({ message: 'Şirket adı zorunludur', type: 'error' });
      return;
    }

    try {
      setLoading(true);

      const partnerData = {
        ...(formData.id && { id: formData.id }),
        code: formData.code || undefined,
        name: formData.name,
        logo: formData.logo,
        order: formData.order,
        active: formData.active,
        showOnHome: formData.showOnHome
      };

      const response = await partnerService.save(partnerData, newMediaFile || undefined, shouldRemoveMedia);

      if (response.status === 'ERROR') {
        setToast({ 
          message: response.errorMessage || 'Partner kaydedilirken hata oluştu', 
          type: 'error' 
        });
        return;
      }

      setToast({ 
        message: isEditing ? 'Partner güncellendi' : 'Partner eklendi', 
        type: 'success' 
      });

      setTimeout(() => {
        router.push('/admin/partners');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving partner:', error);
      setToast({ 
        message: error.message || 'Beklenmeyen bir hata oluştu', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
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
          {isEditing ? 'Partner Düzenle' : 'Yeni Partner Ekle'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Partner Bilgileri</h2>
            <div className="space-y-4">
              <Input
                label="Şirket Adı"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Company Inc."
                required
              />
              
              <ImageUpload
                images={imageFiles}
                onChange={handleImageChange}
                onImageClick={(imageUrl) => setLightbox({ isOpen: true, imageUrl })}
                maxImages={1}
                label="Logo"
              />
              
              <Input
                label="Sıra"
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
                Ana sayfada sadece aktif ve &quot;Ana Sayfada Göster&quot; işaretli partnerler gösterilir.
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
                disabled={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/admin/partners')} 
                fullWidth
                disabled={loading}
              >
                <X className="w-4 h-4 mr-2" />
                İptal
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

      <ImageLightbox
        isOpen={lightbox.isOpen}
        imageUrl={lightbox.imageUrl}
        alt="Partner Logosu"
        onClose={() => setLightbox({ isOpen: false, imageUrl: '' })}
      />
    </div>
  );
}
