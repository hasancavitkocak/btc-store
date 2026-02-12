'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, ArrowLeft, Upload } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Toast from '../../components/Toast';
import ImageUpload from '../../components/ImageUpload';
import FileUpload from '../../components/FileUpload';

interface DocumentFormProps {
  documentId?: string;
}

export default function DocumentForm({ documentId }: DocumentFormProps) {
  const router = useRouter();
  const { documents, addDocument, updateDocument, products, categories } = useStore();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const isEditing = !!documentId;
  const document = isEditing ? documents.find(d => d.id === documentId) : null;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileUrl: '',
    fileType: 'pdf' as 'pdf' | 'pptx' | 'docx' | 'xlsx' | 'image',
    productId: '',
    categoryId: '',
    thumbnail: '',
    thumbnailImage: [] as string[],
    active: true
  });

  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title,
        description: document.description,
        fileUrl: document.fileUrl,
        fileType: document.fileType,
        productId: document.productId || '',
        categoryId: document.categoryId || '',
        thumbnail: document.thumbnail || '',
        thumbnailImage: document.thumbnail ? [document.thumbnail] : [],
        active: document.active
      });
    }
  }, [document]);

  const handleSave = () => {
    if (!formData.title || !formData.fileUrl) {
      setToast({ message: 'Lütfen zorunlu alanları doldurun!', type: 'error' });
      return;
    }

    const documentData = {
      title: formData.title,
      description: formData.description,
      fileUrl: formData.fileUrl,
      fileType: formData.fileType,
      productId: formData.productId || undefined,
      categoryId: formData.categoryId || undefined,
      thumbnail: formData.thumbnailImage[0] || formData.thumbnail || undefined,
      uploadDate: document?.uploadDate || new Date().toISOString(),
      active: formData.active,
      order: document?.order || documents.length + 1
    };

    if (isEditing && documentId) {
      updateDocument(documentId, documentData);
      setToast({ message: 'Doküman güncellendi!', type: 'success' });
    } else {
      const newDocument = {
        ...documentData,
        id: Date.now().toString()
      };
      addDocument(newDocument as any);
      setToast({ message: 'Doküman eklendi!', type: 'success' });
    }

    setTimeout(() => {
      router.push('/admin/documents');
    }, 1000);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/documents')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri
        </Button>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {isEditing ? 'Doküman Düzenle' : 'Yeni Doküman'}
        </h1>
      </div>

      <div className="max-w-4xl space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Doküman Bilgileri</h2>
          <div className="space-y-4">
            <Input
              label="Doküman Başlığı"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Ürün Kataloğu 2024"
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Doküman hakkında kısa açıklama"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <FileUpload
              file={formData.fileUrl}
              onChange={(file) => setFormData({...formData, fileUrl: file})}
              label="Dosya"
              accept=".pdf,.pptx,.docx,.xlsx,.png,.jpg,.jpeg"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dosya Tipi
              </label>
              <select
                value={formData.fileType}
                onChange={(e) => setFormData({...formData, fileType: e.target.value as any})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pdf">PDF</option>
                <option value="pptx">PowerPoint</option>
                <option value="docx">Word</option>
                <option value="xlsx">Excel</option>
                <option value="image">Görsel</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İlgili Ürün (Opsiyonel)
              </label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({...formData, productId: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Genel Doküman</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.nameKey}
                  </option>
                ))}
              </select>
            </div>

            <ImageUpload
              images={formData.thumbnailImage}
              onChange={(images) => setFormData({...formData, thumbnailImage: images})}
              maxImages={1}
              label="Önizleme Görseli (Opsiyonel)"
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
              Kaydet
            </Button>
            <Button variant="outline" onClick={() => router.push('/admin/documents')} fullWidth>
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
    </div>
  );
}
