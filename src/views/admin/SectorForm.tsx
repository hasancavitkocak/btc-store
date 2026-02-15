'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, ArrowLeft } from 'lucide-react';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Toast from '../../components/Toast';
import { sectorService } from '../../services/admin.service';

interface SectorFormProps {
  sectorId?: string;
}

export default function SectorForm({ sectorId }: SectorFormProps) {
  const router = useRouter();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  
  const isEditing = !!sectorId;

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
    name: { tr: '', en: '', de: '', fr: '', es: '', it: '' },
    active: true
  });

  useEffect(() => {
    if (sectorId) {
      loadSector();
    }
  }, [sectorId]);

  const loadSector = async () => {
    try {
      setLoading(true);
      const response = await sectorService.getByCode(sectorId!);
      
      if (response.status === 'SUCCESS' && response.data) {
        const sectorData = (response.data as any).data || response.data;
        
        setFormData({
          id: sectorData.id,
          code: sectorData.code,
          name: sectorData.name || { tr: '', en: '', de: '', fr: '', es: '', it: '' },
          active: sectorData.active ?? true
        });
      }
    } catch (error) {
      console.error('Error loading sector:', error);
      setToast({ message: 'Sektör yüklenirken hata oluştu', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const sectorData = {
        ...(formData.id && { id: formData.id }),
        code: formData.code || undefined,
        name: formData.name,
        active: formData.active
      };

      const response = await sectorService.save(sectorData);

      if (response.status === 'ERROR') {
        setToast({ 
          message: response.errorMessage || 'Sektör kaydedilirken hata oluştu', 
          type: 'error' 
        });
        return;
      }

      setToast({ 
        message: isEditing ? 'Sektör güncellendi' : 'Sektör eklendi', 
        type: 'success' 
      });

      setTimeout(() => {
        router.push('/admin/sectors');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving sector:', error);
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
            onClick={() => router.push('/admin/sectors')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isEditing ? 'Sektör Düzenle' : 'Yeni Sektör'}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Sektör Bilgileri</h2>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">İsim</label>
                    <button
                      type="button"
                      onClick={() => toggleField('name')}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                      <span className="text-base">{expandedFields.has('name') ? '🌐' : '🌍'}</span>
                      <span>Diğer Diller</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">5</span>
                      <span className="text-gray-400">{expandedFields.has('name') ? '▼' : '▶'}</span>
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <Input
                      placeholder="🇹🇷 Türkçe"
                      value={formData.name.tr}
                      onChange={(e) => setFormData({ ...formData, name: { ...formData.name, tr: e.target.value } })}
                    />
                    
                    {expandedFields.has('name') && (
                      <div className="space-y-3 pt-3 border-t border-gray-200">
                        <Input
                          placeholder="🇬🇧 English"
                          value={formData.name.en}
                          onChange={(e) => setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })}
                        />
                        <Input
                          placeholder="🇩🇪 Deutsch"
                          value={formData.name.de}
                          onChange={(e) => setFormData({ ...formData, name: { ...formData.name, de: e.target.value } })}
                        />
                        <Input
                          placeholder="🇫🇷 Français"
                          value={formData.name.fr}
                          onChange={(e) => setFormData({ ...formData, name: { ...formData.name, fr: e.target.value } })}
                        />
                        <Input
                          placeholder="🇪🇸 Español"
                          value={formData.name.es}
                          onChange={(e) => setFormData({ ...formData, name: { ...formData.name, es: e.target.value } })}
                        />
                        <Input
                          placeholder="🇮🇹 Italiano"
                          value={formData.name.it}
                          onChange={(e) => setFormData({ ...formData, name: { ...formData.name, it: e.target.value } })}
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
              <h2 className="text-xl font-semibold mb-4">Görünürlük</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700">
                    Aktif
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
                  onClick={() => router.push('/admin/sectors')} 
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
