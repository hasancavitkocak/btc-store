'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, ArrowLeft } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Toast from '../../components/Toast';
import RichTextEditor from '../../components/RichTextEditor';
import { legalDocumentService } from '../../services/legalDocument.service';
import { type SupportedLocale } from '../../lib/i18n-utils';

type LegalDocumentType = 'KVKK' | 'GDPR' | 'PRIVACY_POLICY' | 'TERMS_OF_USE' | 'COOKIE_POLICY' | 'CONSENT_TEXT';

interface LegalDocumentFormProps {
  documentCode?: string;
}

// Dil bilgileri
const languageInfo: Record<SupportedLocale, { code: string; name: string; flag: string }> = {
  tr: { code: 'TR', name: 'Türkçe', flag: '🇹🇷' },
  en: { code: 'EN', name: 'English', flag: '🇬🇧' },
  de: { code: 'DE', name: 'Deutsch', flag: '🇩🇪' },
  fr: { code: 'FR', name: 'Français', flag: '🇫🇷' },
  es: { code: 'ES', name: 'Español', flag: '🇪🇸' },
  it: { code: 'IT', name: 'Italiano', flag: '🇮🇹' }
};

export default function LegalDocumentForm({ documentCode }: LegalDocumentFormProps) {
  const router = useRouter();
  const locale = useLocale() as SupportedLocale;
  const t = useTranslations('admin.legalDocumentForm');
  const tTypes = useTranslations('admin.legalDocumentTypes');
  const tCommon = useTranslations('common');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const [activeContentTab, setActiveContentTab] = useState<SupportedLocale>(locale);
  
  const isEditing = !!documentCode;

  // Kullanıcının dilini en üste, diğerlerini sıraya koy
  const getOrderedLanguages = (): SupportedLocale[] => {
    const allLanguages: SupportedLocale[] = ['tr', 'en', 'de', 'fr', 'es', 'it'];
    return [locale, ...allLanguages.filter(lang => lang !== locale)];
  };

  const orderedLanguages = getOrderedLanguages();

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
      setToast({ message: t('loadError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Eski versiyon editlenememeli
    if (isOldVersion) {
      setToast({ message: t('oldVersionError'), type: 'error' });
      return;
    }

    // Validasyon
    if (!formData.title.tr || !formData.content.tr) {
      setToast({ message: t('titleRequired'), type: 'error' });
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
          message: response.errorMessage || t('saveError'), 
          type: 'error' 
        });
        return;
      }
      
      setToast({ 
        message: isEditing ? t('updateSuccess') : t('createSuccess'), 
        type: 'success' 
      });

      setTimeout(() => {
        router.push('/admin/legal-documents');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving document:', error);
      setToast({ 
        message: error.message || t('unexpectedError'), 
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
            {t('back')}
          </Button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isEditing ? (isOldVersion ? t('viewDocument') : t('editDocument')) : t('newDocument')}
          </h1>
          {isOldVersion && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                {t('oldVersionWarning')}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('basicInfo')}</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('documentType')} *
                  </label>
                  <select
                    value={formData.documentType}
                    onChange={(e) => !isOldVersion && setFormData({ ...formData, documentType: e.target.value as LegalDocumentType })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isEditing}
                  >
                    {(['KVKK', 'GDPR', 'PRIVACY_POLICY', 'TERMS_OF_USE', 'COOKIE_POLICY', 'CONSENT_TEXT'] as LegalDocumentType[]).map((type) => (
                      <option key={type} value={type}>{tTypes(type)}</option>
                    ))}
                  </select>
                  {isEditing && (
                    <p className="text-xs text-gray-500 mt-1">{t('documentTypeNote')}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {isEditing && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('version')}
                      </label>
                      <input
                        type="text"
                        value={formData.version}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">{t('versionNote')}</p>
                    </div>
                  )}
                  
                  <Input
                    label={`${t('effectiveDate')} *`}
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('title')} *</h2>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">{t('title')}</label>
                  <button
                    type="button"
                    onClick={() => toggleField('title')}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <span>{t('otherLanguages')}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{orderedLanguages.length - 1}</span>
                    <span className="text-gray-400">{expandedFields.has('title') ? '▼' : '▶'}</span>
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <Input
                    placeholder={`${languageInfo[orderedLanguages[0]].code} - ${languageInfo[orderedLanguages[0]].name}`}
                    value={formData.title[orderedLanguages[0]]}
                    onChange={(e) => setFormData({ ...formData, title: { ...formData.title, [orderedLanguages[0]]: e.target.value } })}
                  />
                  
                  {expandedFields.has('title') && (
                    <div className="space-y-3 pt-3 border-t border-gray-200">
                      {orderedLanguages.slice(1).map((lang) => (
                        <Input 
                          key={lang}
                          placeholder={`${languageInfo[lang].code} - ${languageInfo[lang].name}`}
                          value={formData.title[lang]} 
                          onChange={(e) => setFormData({ ...formData, title: { ...formData.title, [lang]: e.target.value } })} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-2">{t('shortDescription')}</h2>
              <p className="text-sm text-gray-600 mb-4">{t('shortDescriptionNote')}</p>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">{t('shortDescription')}</label>
                  <button
                    type="button"
                    onClick={() => toggleField('shortText')}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <span>{t('otherLanguages')}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{orderedLanguages.length - 1}</span>
                    <span className="text-gray-400">{expandedFields.has('shortText') ? '▼' : '▶'}</span>
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <textarea
                    placeholder={`${languageInfo[orderedLanguages[0]].code} - ${languageInfo[orderedLanguages[0]].name}`}
                    value={formData.shortText[orderedLanguages[0]]}
                    onChange={(e) => setFormData({ ...formData, shortText: { ...formData.shortText, [orderedLanguages[0]]: e.target.value } })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  {expandedFields.has('shortText') && (
                    <div className="space-y-3 pt-3 border-t border-gray-200">
                      {orderedLanguages.slice(1).map((lang) => (
                        <textarea 
                          key={lang}
                          placeholder={`${languageInfo[lang].code} - ${languageInfo[lang].name}`}
                          value={formData.shortText[lang]} 
                          onChange={(e) => setFormData({ ...formData, shortText: { ...formData.shortText, [lang]: e.target.value } })} 
                          rows={3} 
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-2">{t('detailedContent')} *</h2>
              <p className="text-sm text-gray-600 mb-4">{t('detailedContentNote')}</p>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200">
                  <div className="flex overflow-x-auto">
                    {orderedLanguages.map((lang) => (
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
                        {languageInfo[lang].code} - {languageInfo[lang].name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="p-4">
                  <RichTextEditor
                    value={formData.content[activeContentTab]}
                    onChange={(value) => setFormData({ ...formData, content: { ...formData.content, [activeContentTab]: value } })}
                    placeholder={`${languageInfo[activeContentTab].code} - ${languageInfo[activeContentTab].name}`}
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('status')}</h2>
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
                    {t('active')}
                  </label>
                </div>
                
                {isEditing && formData.isCurrentVersion && (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{t('currentVersion')}</span>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('actions')}</h2>
              <div className="space-y-3">
                {!isOldVersion && (
                  <Button 
                    onClick={handleSave} 
                    fullWidth 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? t('saving') : t('save')}
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/admin/legal-documents')} 
                  fullWidth
                  disabled={loading}
                >
                  <X className="w-4 h-4 mr-2" />
                  {isOldVersion ? t('close') : t('cancel')}
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">{t('versionInfo')}</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                {(t.raw('versionInfoList') as string[]).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
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
