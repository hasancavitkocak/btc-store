'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, ArrowLeft } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Toast from '../../components/Toast';
import ImageUpload from '../../components/ImageUpload';
import ImageLightbox from '../../components/ImageLightbox';
import { userService } from '../../services/admin.service';

interface UserFormProps {
  userId?: string;
}

export default function UserForm({ userId }: UserFormProps) {
  const router = useRouter();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [newPictureFile, setNewPictureFile] = useState<File | null>(null);
  const [shouldRemovePicture, setShouldRemovePicture] = useState(false);
  const [lightbox, setLightbox] = useState<{ isOpen: boolean; imageUrl: string }>({
    isOpen: false,
    imageUrl: ''
  });
  
  const isEditing = !!userId;

  const [formData, setFormData] = useState({
    code: '',
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    definedPassword: '',
    active: true
  });

  useEffect(() => {
    if (isEditing && userId) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await userService.getByCode(userId!);
      
      if (response.status === 'SUCCESS' && response.data) {
        const userData = response.data as any;
        setFormData({
          code: userData.code || '',
          username: userData.username || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          definedPassword: '',
          active: userData.active !== false
        });
        
        // Mevcut profil resmini göster
        if (userData.picture?.absolutePath) {
          setImageFiles([userData.picture.absolutePath]);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setToast({ message: 'Kullanıcı yüklenirken hata oluştu', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (images: string[]) => {
    setImageFiles(images);
    
    if (images.length === 0) {
      setNewPictureFile(null);
      setShouldRemovePicture(true);
    } else if (images[0].startsWith('data:')) {
      setShouldRemovePicture(false);
      fetch(images[0])
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' });
          setNewPictureFile(file);
        });
    } else {
      // Mevcut resim korunuyor
      setShouldRemovePicture(false);
    }
  };

  const handleSave = async () => {
    if (!formData.username || !formData.email) {
      setToast({ message: 'Kullanıcı adı ve e-posta zorunludur!', type: 'error' });
      return;
    }

    if (!isEditing && !formData.definedPassword) {
      setToast({ message: 'Yeni kullanıcı için şifre zorunludur!', type: 'error' });
      return;
    }

    try {
      setLoading(true);

      const userData = {
        code: formData.code || undefined,
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        definedPassword: formData.definedPassword || undefined,
        active: formData.active
      };

      const response = await userService.save(userData, newPictureFile || undefined, shouldRemovePicture);
      
      if (response.status === 'SUCCESS') {
        setToast({ 
          message: isEditing ? 'Kullanıcı güncellendi!' : 'Kullanıcı eklendi!', 
          type: 'success' 
        });
        
        setTimeout(() => {
          router.push('/admin/users');
        }, 1000);
      } else {
        setToast({ 
          message: response.errorMessage || 'Kayıt başarısız', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error saving user:', error);
      setToast({ message: 'Kullanıcı kaydedilirken hata oluştu', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <p className="text-gray-500">Yükleniyor...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/users')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri
        </Button>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {isEditing ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
        </h1>
      </div>

      <div className="max-w-4xl space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Profil Resmi</h2>
          <ImageUpload
            images={imageFiles}
            onChange={handleImageChange}
            onImageClick={(imageUrl) => setLightbox({ isOpen: true, imageUrl })}
            maxImages={1}
            label="Profil Resmi"
          />
          <p className="text-sm text-gray-500 mt-2">
            Önerilen boyut: 400x400px (kare). Maksimum dosya boyutu: 2MB
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Kullanıcı Bilgileri</h2>
          <div className="space-y-4">
            <Input
              label="Kullanıcı Adı"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              placeholder="kullanici_adi"
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ad"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                placeholder="Ad"
              />
              
              <Input
                label="Soyad"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                placeholder="Soyad"
              />
            </div>

            <Input
              label="E-posta"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="user@example.com"
              required
            />

            <Input
              label="Telefon"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              placeholder="+90 555 123 4567"
            />

            <Input
              label={isEditing ? "Yeni Şifre (boş bırakılırsa değişmez)" : "Şifre"}
              type="password"
              value={formData.definedPassword}
              onChange={(e) => setFormData({...formData, definedPassword: e.target.value})}
              placeholder="••••••"
              required={!isEditing}
            />

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({...formData, active: e.target.checked})}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">
                Aktif
              </label>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex gap-3">
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
              onClick={() => router.push('/admin/users')} 
              fullWidth
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              İptal
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

      <ImageLightbox
        isOpen={lightbox.isOpen}
        imageUrl={lightbox.imageUrl}
        alt="Profil Resmi"
        onClose={() => setLightbox({ isOpen: false, imageUrl: '' })}
      />
    </div>
  );
}
