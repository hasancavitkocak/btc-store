'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Button from './Button';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  onImageClick?: (imageUrl: string) => void;
}

export default function ImageUpload({ images, onChange, maxImages = 5, label = 'Görseller', onImageClick }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const newImages: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Dosyayı base64'e çevir
        const base64 = await fileToBase64(file);
        newImages.push(base64);
      }

      // Mevcut görsellere ekle
      const updatedImages = [...images, ...newImages].slice(0, maxImages);
      onChange(updatedImages);
    } catch (error) {
      console.error('Görsel yükleme hatası:', error);
      alert('Görsel yüklenirken bir hata oluştu');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleRemove = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onChange(updatedImages);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} ({images.length}/{maxImages})
      </label>

      {/* Görsel Önizlemeleri */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image}
              alt={`Görsel ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onImageClick?.(image)}
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
            {index === 0 && (
              <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                Ana Görsel
              </div>
            )}
          </div>
        ))}

        {/* Boş Slot'lar */}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={uploading}
            className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            ) : (
              <>
                <img src="/no-image.svg" alt="No image" className="absolute inset-0 w-full h-full object-contain opacity-20" />
                <Upload className="w-8 h-8 text-gray-400 mb-2 relative z-10" />
                <span className="text-sm text-gray-600 relative z-10">Görsel Ekle</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Gizli File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Bilgi Mesajı */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <ImageIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Görsel Yükleme İpuçları:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>İlk görsel ana görsel olarak kullanılacak</li>
            <li>En fazla {maxImages} görsel yükleyebilirsiniz</li>
            <li>Önerilen boyut: 1200x800 piksel</li>
            <li>Desteklenen formatlar: JPG, PNG, WebP</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
