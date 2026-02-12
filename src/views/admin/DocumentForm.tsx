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
import MultiFileUpload from '../../components/MultiFileUpload';

interface DocumentFormProps {
  documentId?: string;
}

export default function DocumentForm({ documentId }: DocumentFormProps) {
  const router = useRouter();
  const { documents, addDocument, updateDocument, products, categories } = useStore();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const isEditing = !!documentId;
  const document = isEditing ? documents.find(d => d.id === documentId) : null;

  // Dosya uzantısından tip belirle
  const getFileType = (url: string): 'pdf' | 'pptx' | 'docx' | 'xlsx' | 'image' => {
    const ext = url.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'pptx' || ext === 'ppt') return 'pptx';
    if (ext === 'docx' || ext === 'doc') return 'docx';
    if (ext === 'xlsx' || ext === 'xls') return 'xlsx';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
    return 'pdf'; // default
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileUrls: [] as string[],
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
        fileUrls: document.fileUrl ? [document.fileUrl] : [],
        productId: document.productId || '',
        categoryId: document.categoryId || '',
        thumbnail: document.thumbnail || '',
        thumbnailImage: document.thumbnail ? [document.thumbnail] : [],
        active: document.active
      });
    }
  }, [document]);

  const handleSave = () => {
    if (!formData.title || formData.fileUrls.length === 0) {
      setToast({ message: 'Lütfen zorunlu alanları doldurun!', type: 'error' });
      return;
    }

    // Her dosya için ayrı doküman kaydı oluştur
    formData.fileUrls.forEach((fileUrl, index) => {
      const documentData = {
        title: formData.fileUrls.length > 1 ? `${formData.title} (${index + 1})` : formData.title,
        description: formData.description,
        fileUrl: fileUrl,
        fileType: getFileType(fileUrl),
        productId: formData.productId || undefined,
        categoryId: formData.categoryId || undefined,
        thumbnail: formData.thumbnailImage[0] || formData.thumbnail || undefined,
        uploadDate: new Date().toISOString(),
        active: formData.active,
        order: documents.length + index + 1
      };

      if (isEditing && documentId && index === 0) {
        // İlk dosya için mevcut kaydı güncelle
        updateDocument(documentId, documentData);
      } else {
        // Yeni kayıt oluştur
        const newDocument = {
          ...documentData,
          id: `${Date.now()}-${index}`
        };
        addDocument(newDocument as any);
      }
    });

    setToast({ 
      message: isEditing ? 'Doküman güncellendi!' : `${formData.fileUrls.length} doküman eklendi!`, 
      type: 'success' 
    });

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

            <MultiFileUpload
              files={formData.fileUrls}
              onChange={(files) => setFormData({...formData, fileUrls: files})}
              label="Dosyalar"
              accept=".pdf,.pptx,.docx,.xlsx,.png,.jpg,.jpeg"
              maxFiles={20}
            />
            <p className="text-sm text-gray-500 mt-2">
              Birden fazla dosya yükleyebilirsiniz. Her dosya için ayrı doküman kaydı oluşturulacak.
            </p>

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
