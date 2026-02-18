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
import RichTextEditor from '../../components/RichTextEditor';
import { legalDocumentService } from '../../services/legalDocument.service';

type LegalDocumentType = 'KVKK' | 'GDPR' | 'PRIVACY_POLICY' | 'TERMS_OF_USE' | 'COOKIE_POLICY' | 'CONSENT_TEXT';

interface LegalDocumentFormProps {
  documentCode?: string;
}

const documentTypeLabels: Record<LegalDocumentType, string> = {
  KVKK: 'KVKK Aydınlatma Metni',
  GDPR: 'GDPR Privacy Policy',
  PRIVACY_POLICY: 'Gizlilik Politikası',
  TERMS_OF_USE: 'Kullanım Koşulları',
  COOKIE_POLICY: 'Çerez Politikası',
  CONSENT_TEXT: 'Onay Metni'
};

export default function LegalDocumentForm({ documentCode }: LegalDocumentFormProps) {
  const router = useRouter();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const [activeContentTab, setActiveContentTab] = useState<'tr' | 'en' | 'de' | 'fr' | 'es' | 'it'>('tr');
  
  const isEditing = !!documentCode;

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
    code: undefined as string | undefined,
    documentType: 'KVKK' as LegalDocumentType,
    title: { tr: '', en: '', de: '', fr: '', es: '', it: '' },
    content: { tr: '', en: '', de: '', fr: '', es: '', it: '' },
    shortText: { tr: '', en: '', de: '', fr: '', es: '', it: '' },
    version: '1.0',
    effectiveDate: new Date().toISOString().split('T')[0],
    isCurrentVersion: true,
    active: true
  });

  const isOldVersion = isEditing && !formData.isCurrentVersion;

  useEffect(() => {
    if (documentCode) {
      loadDocument();
    }
  }, [documentCode]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const response = await legalDocumentService.getByCode(documentCode!);
      
      if (response.status === 'SUCCESS' && response.data) {
        const docData = (response.data as any).data || response.data;
        
        setFormData({
          id: docData.id,
          code: docData.code,
          documentType: docData.documentType,
          title: docData.title || { tr: '', en: '', de: '', fr: '', es: '', it: '' },
          content: docData.content || { tr: '', en: '', de: '', fr: '', es: '', it: '' },
          shortText: docData.shortText || { tr: '', en: '', de: '', fr: '', es: '', it: '' },
          version: docData.version || '1.0',
          effectiveDate: docData.effectiveDate ? docData.effectiveDate.split('T')[0] : new Date().toISOString().split('T')[0],
          isCurrentVersion: docData.isCurrentVersion ?? true,
          active: docData.active ?? true
        });
      }
    } catch (error) {
      console.error('Error loading document:', error);
      setToast({ message: 'Doküman yüklenirken hata oluştu', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Eski versiyon editlenememeli
    if (isOldVersion) {
      setToast({ message: 'Eski versiyonlar düzenlenemez', type: 'error' });
      return;
    }

    // Validasyon
    if (!formData.title.tr || !formData.content.tr) {
      setToast({ message: 'Başlık ve içerik alanları zorunludur', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      
      const documentData = {
        ...(formData.id && { id: formData.id }),
        ...(formData.code && { code: formData.code }),
        documentType: formData.documentType,
        title: formData.title,
        content: formData.content,
        shortText: formData.shortText,
        effectiveDate: formData.effectiveDate,
        active: formData.active
      };

      const response = await legalDocumentService.save(documentData);
      
      if (response.status === 'ERROR') {
        setToast({ 
          message: response.errorMessage || 'Doküman kaydedilirken hata oluştu', 
          type: 'error' 
        });
        return;
      }
      
      setToast({ 
        message: isEditing ? 'Doküman güncellendi' : 'Doküman eklendi', 
        type: 'success' 
      });

      setTimeout(() => {
        router.push('/admin/legal-documents');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving document:', error);
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
            onClick={() => router.push('/admin/legal-documents')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isEditing ? (isOldVersion ? 'Doküman Görüntüle (Eski Versiyon)' : 'Doküman Düzenle') : 'Yeni Doküman'}
          </h1>
          {isOldVersion && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Bu eski bir versiyondur ve düzenlenemez. Sadece görüntüleme modundasınız.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Temel Bilgiler</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doküman Tipi *
                  </label>
                  <select
                    value={formData.documentType}
                    onChange={(e) => !isOldVersion && setFormData({ ...formData, documentType: e.target.value as LegalDocumentType })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isEditing}
                  >
                    {Object.entries(documentTypeLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  {isEditing && (
                    <p className="text-xs text-gray-500 mt-1">Doküman tipi düzenlenemez</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {isEditing && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Versiyon
                      </label>
                      <input
                        type="text"
                        value={formData.version}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">İçerik değişirse otomatik artar</p>
                    </div>
                  )}
                  
                  <Input
                    label="Yürürlük Tarihi *"
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Başlık *</h2>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Başlık</label>
                  <button
                    type="button"
                    onClick={() => toggleField('title')}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <span>Diğer Diller</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">5</span>
                    <span className="text-gray-400">{expandedFields.has('title') ? '▼' : '▶'}</span>
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <Input
                    placeholder="🇹🇷 Türkçe - Başlık"
                    value={formData.title.tr}
                    onChange={(e) => setFormData({ ...formData, title: { ...formData.title, tr: e.target.value } })}
                  />
                  
                  {expandedFields.has('title') && (
                    <div className="space-y-3 pt-3 border-t border-gray-200">
                      <Input placeholder="🇬🇧 English" value={formData.title.en} onChange={(e) => setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })} />
                      <Input placeholder="🇩🇪 Deutsch" value={formData.title.de} onChange={(e) => setFormData({ ...formData, title: { ...formData.title, de: e.target.value } })} />
                      <Input placeholder="🇫🇷 Français" value={formData.title.fr} onChange={(e) => setFormData({ ...formData, title: { ...formData.title, fr: e.target.value } })} />
                      <Input placeholder="🇪🇸 Español" value={formData.title.es} onChange={(e) => setFormData({ ...formData, title: { ...formData.title, es: e.target.value } })} />
                      <Input placeholder="🇮🇹 Italiano" value={formData.title.it} onChange={(e) => setFormData({ ...formData, title: { ...formData.title, it: e.target.value } })} />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-2">Kısa Açıklama</h2>
              <p className="text-sm text-gray-600 mb-4">Doküman hakkında özet bilgi (opsiyonel)</p>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Kısa Açıklama</label>
                  <button
                    type="button"
                    onClick={() => toggleField('shortText')}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <span>Diğer Diller</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">5</span>
                    <span className="text-gray-400">{expandedFields.has('shortText') ? '▼' : '▶'}</span>
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <textarea
                    placeholder="🇹🇷 Türkçe - Kısa açıklama"
                    value={formData.shortText.tr}
                    onChange={(e) => setFormData({ ...formData, shortText: { ...formData.shortText, tr: e.target.value } })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  {expandedFields.has('shortText') && (
                    <div className="space-y-3 pt-3 border-t border-gray-200">
                      <textarea placeholder="🇬🇧 English" value={formData.shortText.en} onChange={(e) => setFormData({ ...formData, shortText: { ...formData.shortText, en: e.target.value } })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                      <textarea placeholder="🇩🇪 Deutsch" value={formData.shortText.de} onChange={(e) => setFormData({ ...formData, shortText: { ...formData.shortText, de: e.target.value } })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                      <textarea placeholder="🇫🇷 Français" value={formData.shortText.fr} onChange={(e) => setFormData({ ...formData, shortText: { ...formData.shortText, fr: e.target.value } })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                      <textarea placeholder="🇪🇸 Español" value={formData.shortText.es} onChange={(e) => setFormData({ ...formData, shortText: { ...formData.shortText, es: e.target.value } })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                      <textarea placeholder="🇮🇹 Italiano" value={formData.shortText.it} onChange={(e) => setFormData({ ...formData, shortText: { ...formData.shortText, it: e.target.value } })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-2">İçerik (Tam Metin) *</h2>
              <p className="text-sm text-gray-600 mb-4">Detaylı doküman içeriği</p>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200">
                  <div className="flex overflow-x-auto">
                    {(['tr', 'en', 'de', 'fr', 'es', 'it'] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setActiveContentTab(lang)}
                        className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                          activeContentTab === lang
                            ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        {lang === 'tr' && '🇹🇷 Türkçe'}
                        {lang === 'en' && '🇬🇧 English'}
                        {lang === 'de' && '🇩🇪 Deutsch'}
                        {lang === 'fr' && '🇫🇷 Français'}
                        {lang === 'es' && '🇪🇸 Español'}
                        {lang === 'it' && '🇮🇹 Italiano'}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="p-4">
                  <RichTextEditor
                    value={formData.content[activeContentTab]}
                    onChange={(value) => setFormData({ ...formData, content: { ...formData.content, [activeContentTab]: value } })}
                    placeholder={`Doküman içeriğini buraya yazın... (${activeContentTab.toUpperCase()})`}
                  />
                </div>
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
                    onChange={(e) => !isOldVersion && setFormData({ ...formData, active: e.target.checked })}
                    disabled={isOldVersion}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700">
                    Aktif
                  </label>
                </div>
                
                {isEditing && formData.isCurrentVersion && (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Güncel Versiyon</span>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">İşlemler</h2>
              <div className="space-y-3">
                {!isOldVersion && (
                  <Button 
                    onClick={handleSave} 
                    fullWidth 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/admin/legal-documents')} 
                  fullWidth
                  disabled={loading}
                >
                  <X className="w-4 h-4 mr-2" />
                  {isOldVersion ? 'Kapat' : 'İptal'}
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Otomatik Versiyon Yönetimi</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Yeni doküman 1.0 versiyonu ile başlar</li>
                <li>• İçerik değişirse versiyon otomatik artar (1.0 → 1.1 → 1.2)</li>
                <li>• 1.9'dan sonra 2.0'a geçer</li>
                <li>• Sadece tarih/durum değişirse versiyon artmaz</li>
                <li>• Yeni versiyon otomatik olarak "güncel" olur</li>
                <li>• Kod otomatik oluşturulur</li>
              </ul>
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
