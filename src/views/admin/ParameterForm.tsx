'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, ArrowLeft } from 'lucide-react';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Toast from '../../components/Toast';
import { parameterService } from '../../services/admin.service';

interface ParameterFormProps {
  parameterId?: string;
}

export default function ParameterForm({ parameterId }: ParameterFormProps) {
  const router = useRouter();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  
  const isEditing = !!parameterId;

  const toggleField = (fieldName: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(fieldName)) {
      newExpanded.delete(fieldName);
    } else {
      newExpanded.add(fieldName);
    }
    setExpandedFields(newExpanded);
  };

  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    code: '',
    value: '',
    description: { tr: '', en: '', de: '', fr: '', es: '', it: '' },
    dataType: 'STRING' as 'STRING' | 'INTEGER' | 'BOOLEAN' | 'DOUBLE',
    parameterType: 'SYSTEM' as 'SYSTEM' | 'USER',
    encrypt: false
  });

  useEffect(() => {
    if (parameterId) {
      loadParameter();
    }
  }, [parameterId]);

  const loadParameter = async () => {
    try {
      setLoading(true);
      const response = await parameterService.getByCode(parameterId!);
      
      if (response.status === 'SUCCESS' && response.data) {
        const parameterData = (response.data as any).data || response.data;
        
        setFormData({
          id: parameterData.id,
          code: parameterData.code,
          value: parameterData.value || '',
          description: parameterData.description || { tr: '', en: '', de: '', fr: '', es: '', it: '' },
          dataType: parameterData.dataType || 'STRING',
          parameterType: parameterData.parameterType || 'SYSTEM',
          encrypt: parameterData.encrypt ?? false
        });
      }
    } catch (error) {
      console.error('Error loading parameter:', error);
      setToast({ message: 'Parametre yüklenirken hata oluştu', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.code.trim()) {
      setToast({ message: 'Kod alanı zorunludur', type: 'error' });
      return;
    }

    if (!formData.value.trim()) {
      setToast({ message: 'Değer alanı zorunludur', type: 'error' });
      return;
    }

    try {
      setLoading(true);

      const parameterData = {
        ...(formData.id && { id: formData.id }),
        code: formData.code || undefined,
        value: formData.value,
        description: formData.description,
        dataType: formData.dataType,
        parameterType: formData.parameterType,
        encrypt: formData.encrypt
      };

      const response = await parameterService.save(parameterData);

      if (response.status === 'ERROR') {
        setToast({ 
          message: response.errorMessage || 'Parametre kaydedilirken hata oluştu', 
          type: 'error' 
        });
        return;
      }

      setToast({ 
        message: isEditing ? 'Parametre güncellendi' : 'Parametre eklendi', 
        type: 'success' 
      });

      setTimeout(() => {
        router.push('/admin/parameters');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving parameter:', error);
      setToast({ 
        message: error.message || 'Beklenmeyen bir hata oluştu', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section>
      <Container>
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/parameters')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isEditing ? 'Parametre Düzenle' : 'Yeni Parametre'}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Parametre Bilgileri</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kod <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Parametre kodu (örn: SITE_NAME)"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    disabled={isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Değer <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Parametre değeri"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    type={formData.encrypt ? 'password' : 'text'}
                  />
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Açıklama</label>
                    <button
                      type="button"
                      onClick={() => toggleField('description')}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                      <span className="text-base">{expandedFields.has('description') ? '🌐' : '🌍'}</span>
                      <span>Diğer Diller</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">5</span>
                      <span className="text-gray-400">{expandedFields.has('description') ? '▼' : '▶'}</span>
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <Textarea
                      placeholder="🇹🇷 Türkçe açıklama"
                      value={formData.description.tr}
                      onChange={(e) => setFormData({ ...formData, description: { ...formData.description, tr: e.target.value } })}
                      rows={3}
                    />
                    
                    {expandedFields.has('description') && (
                      <div className="space-y-3 pt-3 border-t border-gray-200">
                        <Textarea
                          placeholder="🇬🇧 English description"
                          value={formData.description.en}
                          onChange={(e) => setFormData({ ...formData, description: { ...formData.description, en: e.target.value } })}
                          rows={3}
                        />
                        <Textarea
                          placeholder="🇩🇪 Deutsch Beschreibung"
                          value={formData.description.de}
                          onChange={(e) => setFormData({ ...formData, description: { ...formData.description, de: e.target.value } })}
                          rows={3}
                        />
                        <Textarea
                          placeholder="🇫🇷 Description française"
                          value={formData.description.fr}
                          onChange={(e) => setFormData({ ...formData, description: { ...formData.description, fr: e.target.value } })}
                          rows={3}
                        />
                        <Textarea
                          placeholder="🇪🇸 Descripción en español"
                          value={formData.description.es}
                          onChange={(e) => setFormData({ ...formData, description: { ...formData.description, es: e.target.value } })}
                          rows={3}
                        />
                        <Textarea
                          placeholder="🇮🇹 Descrizione italiana"
                          value={formData.description.it}
                          onChange={(e) => setFormData({ ...formData, description: { ...formData.description, it: e.target.value } })}
                          rows={3}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Ayarlar</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Veri Tipi
                  </label>
                  <select
                    value={formData.dataType}
                    onChange={(e) => setFormData({ ...formData, dataType: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="STRING">Metin</option>
                    <option value="INTEGER">Tam Sayı</option>
                    <option value="DOUBLE">Ondalık Sayı</option>
                    <option value="BOOLEAN">Boolean</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parametre Tipi
                  </label>
                  <select
                    value={formData.parameterType}
                    onChange={(e) => setFormData({ ...formData, parameterType: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="SYSTEM">Sistem</option>
                    <option value="USER">Kullanıcı</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="encrypt"
                    checked={formData.encrypt}
                    onChange={(e) => setFormData({ ...formData, encrypt: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="encrypt" className="text-sm font-medium text-gray-700">
                    Şifreli
                  </label>
                </div>
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
                  onClick={() => router.push('/admin/parameters')} 
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
      </Container>
    </Section>
  );
}
