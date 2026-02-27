'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Save, ArrowLeft } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Toast from '../../components/Toast';
import { userRoleService } from '../../services/admin.service';
import { type SupportedLocale } from '../../lib/i18n-utils';

interface UserRoleFormProps {
  id?: string;
}

// Dil bilgileri
const languageInfo: Record<SupportedLocale, { code: string; name: string }> = {
  tr: { code: 'TR', name: 'Türkçe' },
  en: { code: 'EN', name: 'English' },
  de: { code: 'DE', name: 'Deutsch' },
  fr: { code: 'FR', name: 'Français' },
  es: { code: 'ES', name: 'Español' },
  it: { code: 'IT', name: 'Italiano' }
};

export default function UserRoleForm({ id }: UserRoleFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale() as SupportedLocale;
  const isEdit = !!id;

  // Kullanıcının dilini en üste, diğerlerini sıraya koy
  const getOrderedLanguages = (): SupportedLocale[] => {
    const allLanguages: SupportedLocale[] = ['tr', 'en', 'de', 'fr', 'es', 'it'];
    return [locale, ...allLanguages.filter(lang => lang !== locale)];
  };

  const orderedLanguages = getOrderedLanguages();

  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    code: '',
    description: {
      tr: '',
      en: '',
      de: '',
      fr: '',
      es: '',
      it: ''
    },
    active: true
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  const toggleField = (fieldName: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(fieldName)) {
      newExpanded.delete(fieldName);
    } else {
      newExpanded.add(fieldName);
    }
    setExpandedFields(newExpanded);
  };

  useEffect(() => {
    if (isEdit) {
      loadUserRole();
    }
  }, [isEdit, id]);

  const loadUserRole = async () => {
    if (!id) return;
    try {
      const response = await userRoleService.getByCode(id);
      if (response.status === 'SUCCESS' && response.data) {
        const data = (response.data as any).data || response.data;
        setFormData({
          id: data.id,
          code: data.code || '',
          description: data.description || { tr: '', en: '', de: '', fr: '', es: '', it: '' },
          active: data.active ?? true
        });
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const payload = {
        ...(formData.id && { id: formData.id }),
        code: formData.code,
        description: formData.description,
        active: formData.active
      };

      console.log('Saving user role with payload:', payload);
      const response = await userRoleService.save(payload);
      console.log('Save response:', response);
      
      if (response.status === 'SUCCESS') {
        setToast({ message: isEdit ? t('userRoleForm.updateSuccess') : t('userRoleForm.createSuccess'), type: 'success' });
        setTimeout(() => {
          router.push('/admin/user-roles');
        }, 1000);
      } else {
        setToast({ message: response.errorMessage || t('userRoleForm.saveError'), type: 'error' });
      }
    } catch (error: any) {
      console.error('Error saving user role:', error);
      setToast({ message: error.message || t('userRoleForm.unexpectedError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/user-roles')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Button>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {isEdit ? t('userRoleForm.editPermission') : t('userRoleForm.newPermission')}
        </h1>
        <p className="text-gray-600">{t('userRoleForm.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('userRoleForm.basicInfo')}</h2>
              
              <div className="space-y-4">
                <Input
                  label={`${t('userRoleForm.permissionCode')} *`}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="MANAGE_PRODUCTS"
                  required
                />

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">{t('userRoleForm.description')} *</label>
                    <button
                      type="button"
                      onClick={() => toggleField('description')}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                      <span className="text-base">{expandedFields.has('description') ? '🌐' : '🌍'}</span>
                      <span>{t('userRoleForm.otherLanguages')}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">5</span>
                      <span className="text-gray-400">{expandedFields.has('description') ? '▼' : '▶'}</span>
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <Textarea
                      placeholder={`${languageInfo[orderedLanguages[0]].code} - ${languageInfo[orderedLanguages[0]].name}`}
                      value={formData.description[orderedLanguages[0]]}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        description: { ...formData.description, [orderedLanguages[0]]: e.target.value }
                      })}
                      rows={3}
                      required
                    />
                    
                    {expandedFields.has('description') && (
                      <div className="space-y-3 pt-3 border-t border-gray-200">
                        {orderedLanguages.slice(1).map((lang) => (
                          <Textarea
                            key={lang}
                            placeholder={`${languageInfo[lang].code} - ${languageInfo[lang].name}`}
                            value={formData.description[lang]}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              description: { ...formData.description, [lang]: e.target.value }
                            })}
                            rows={3}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{t('userRoleForm.active')}</div>
                    <div className="text-sm text-gray-600">{t('userRoleForm.activeDescription')}</div>
                  </div>
                </label>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('userRoleForm.actions')}</h2>
              
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? t('userRoleForm.saving') : t('common.save')}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/user-roles')}
                  className="w-full"
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">{t('userRoleForm.infoTitle')}</h3>
              <p className="text-sm text-blue-800">
                {t('userRoleForm.infoText')}
              </p>
            </Card>
          </div>
        </div>
      </form>

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
