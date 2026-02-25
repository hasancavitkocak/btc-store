'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { emailTemplateService } from '@/services/admin.service';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';

interface Props {
  templateCode?: string;
}

interface EmailTemplateData {
  id?: number;
  code: string;
  templateName: string;
  relatedItem?: string; // Model class name
  subject: string;
  body: string;
  description?: string;
  isActive: boolean;
}

interface ModelInfo {
  className: string;
  displayName: string;
}

interface FieldInfo {
  fieldName: string;
  fieldType: string;
  displayName: string;
}

export default function EmailTemplateForm({ templateCode }: Props) {
  const router = useRouter();
  const t = useTranslations('admin.emailTemplateForm');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [fields, setFields] = useState<FieldInfo[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState<EmailTemplateData>({
    code: '',
    templateName: '',
    relatedItem: '',
    subject: '',
    body: '',
    description: '',
    isActive: true,
  });

  const isEditMode = !!templateCode;

  useEffect(() => {
    loadModels();
  }, []); // Sadece component mount olduğunda çalış

  useEffect(() => {
    if (templateCode) {
      loadTemplate();
    }
  }, [templateCode]);

  useEffect(() => {
    if (formData.relatedItem) {
      loadFields(formData.relatedItem);
    }
  }, [formData.relatedItem]);

  const loadModels = async () => {
    try {
      const response = await emailTemplateService.getAllModels();
      
      if (response.status === 'SUCCESS' && response.data) {
        // response.data bir ServiceResponseData daha içeriyor, onun data'sını al
        const innerData = (response.data as any).data;
        const rawData = innerData || response.data;
        
        // API'den gelen data'yı map et: code -> className, name -> displayName
        const modelsData = Array.isArray(rawData) 
          ? rawData.map((item: any) => ({
              className: item.code,
              displayName: item.name
            }))
          : [];
        
        console.log('Final models data:', modelsData);
        setModels(modelsData);
      }
    } catch (error) {
      console.error('Modeller yüklenirken hata:', error);
      setModels([]);
    }
  };

  const loadFields = async (modelName: string) => {
    try {
      setLoading(true);
      const response = await emailTemplateService.getModelFields(modelName);
      
      if (response.status === 'SUCCESS' && response.data) {
        // response.data bir ServiceResponseData daha içeriyor, onun data'sını al
        const innerData = (response.data as any).data;
        const rawData = innerData || response.data;
        
        // API'den sadece string array dönüyor: ["cmsCategory", "code", "name", ...]
        const fieldsData = Array.isArray(rawData) 
          ? rawData.map((fieldName: string) => ({
              fieldName: fieldName,
              fieldType: 'String', // Tip bilgisi yok, default String
              displayName: fieldName.charAt(0).toUpperCase() + fieldName.slice(1) // İlk harfi büyük yap
            }))
          : [];
        
        console.log('Fields data:', fieldsData);
        setFields(fieldsData);
      }
    } catch (error) {
      console.error('Field\'lar yüklenirken hata:', error);
      setFields([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = async () => {
    try {
      setLoading(true);
      const response = await emailTemplateService.getByCode(templateCode!);
      
      if (response.status === 'SUCCESS' && response.data) {
        // Handle wrapped data
        const actualData = response.data.data || response.data;
        
        // Map 'active' to 'isActive' for form compatibility
        const mappedData = {
          ...actualData,
          isActive: actualData.active !== undefined ? actualData.active : actualData.isActive
        };
        
        setFormData(mappedData as EmailTemplateData);
      }
    } catch (error) {
      console.error('Template yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Backend'e gönderilecek data - 'active' field'ını kullan
      const submitData = {
        ...formData,
        active: formData.isActive, // isActive'i active'e map et
      };
      
      // isActive field'ını kaldır (backend active bekliyor)
      delete (submitData as any).isActive;
      
      const response = await emailTemplateService.save(submitData);
      
      if (response.status === 'SUCCESS') {
        setToast({ message: t('saveSuccess'), type: 'success' });
        setTimeout(() => {
          router.push('/admin/email-templates');
        }, 1500);
      } else {
        setToast({ message: response.errorMessage || t('saveError'), type: 'error' });
      }
    } catch (error) {
      console.error('Template kaydedilirken hata:', error);
      setToast({ message: t('saveError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const insertVariable = (fieldName: string) => {
    const variableTag = `{{${fieldName}}}`;
    setFormData(prev => ({
      ...prev,
      body: prev.body + variableTag,
    }));
  };

  const getPreviewBody = () => {
    let preview = formData.body;
    if (Array.isArray(fields)) {
      fields.forEach((field: FieldInfo) => {
        const regex = new RegExp(`{{${field.fieldName}}}`, 'g');
        const exampleValue = getExampleValue(field.fieldType);
        preview = preview.replace(regex, `<strong class="text-blue-600">${exampleValue}</strong>`);
      });
    }
    return preview;
  };

  const getExampleValue = (fieldType: string): string => {
    switch (fieldType) {
      case 'String':
        return t('exampleText');
      case 'Integer':
      case 'Long':
      case 'Double':
        return '123';
      case 'Date':
        return '18.02.2024 10:30';
      case 'Boolean':
        return t('yes');
      default:
        return t('exampleValue');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('back')}
        </Button>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {isEditMode ? t('editTitle') : t('newTitle')}
        </h1>
        <p className="text-gray-600">
          {t('subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('basicInfo')}</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('templateCode')} *
                  </label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder={t('templateCodePlaceholder')}
                    disabled={isEditMode}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('templateCodeNote')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('templateName')} *
                  </label>
                  <Input
                    value={formData.templateName}
                    onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                    placeholder={t('templateNamePlaceholder')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('relatedModel')} *
                  </label>
                  <select
                    value={formData.relatedItem || ''}
                    onChange={(e) => {
                      const newRelatedItem = e.target.value;
                      setFormData({ ...formData, relatedItem: newRelatedItem });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">{t('selectModel')}</option>
                    {Array.isArray(models) && models.map((model) => (
                      <option key={model.className} value={model.className}>
                        {model.displayName}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('relatedModelNote')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('description')}
                  </label>
                  <Textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('descriptionPlaceholder')}
                    rows={2}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{t('active')}</span>
                  </label>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('mailContent')}</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('subject')} *
                  </label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder={t('subjectPlaceholder')}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('subjectNote')}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {t('body')} *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowLivePreview(!showLivePreview)}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      {showLivePreview ? t('hidePreview') : t('livePreview')}
                    </button>
                  </div>
                  
                  <div className={showLivePreview ? 'grid grid-cols-2 gap-4' : ''}>
                    <div>
                      <textarea
                        value={formData.body}
                        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                        placeholder={t('bodyPlaceholder')}
                        rows={showLivePreview ? 25 : 15}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
                        required
                      />
                    </div>
                    {showLivePreview && (
                      <div>
                        <div className="border border-gray-300 rounded-lg bg-white overflow-auto" style={{ height: '600px' }}>
                          <iframe
                            srcDoc={getPreviewBody()}
                            className="w-full h-full border-0"
                            title="Email Preview"
                            sandbox="allow-same-origin"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('bodyNote')}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Variables & Actions */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                {t('availableVariables')}
                {formData.relatedItem && Array.isArray(models) && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({models.find(m => m.className === formData.relatedItem)?.displayName || formData.relatedItem})
                  </span>
                )}
              </h3>
              
              {!formData.relatedItem ? (
                <p className="text-sm text-gray-600">
                  {t('selectModelFirst')}
                </p>
              ) : fields.length === 0 ? (
                <p className="text-sm text-gray-600">
                  {t('loadingFields')}
                </p>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    {t('variablesNote')}
                  </p>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {Array.isArray(fields) && fields.map((field: FieldInfo) => (
                      <button
                        key={field.fieldName}
                        type="button"
                        onClick={() => insertVariable(field.fieldName)}
                        className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{field.displayName}</div>
                            <code className="text-xs text-gray-600">{`{{${field.fieldName}}}`}</code>
                          </div>
                          <Plus className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>{t('variableNote')}</strong> {t('variableNoteText')}
                    </p>
                  </div>
                </>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">{t('actions')}</h3>
              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  disabled={!formData.relatedItem || fields.length === 0}
                >
                  <Eye className="w-4 h-4" />
                  {t('preview')}
                </Button>
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? t('saving') : t('save')}
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-yellow-50 border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-2">{t('tips')}</h3>
              <ul className="text-sm text-yellow-800 space-y-2">
                <li>{t('tip1')}</li>
                <li>{t('tip2')}</li>
                <li>{t('tip3')}</li>
                <li>{t('tip4')}</li>
              </ul>
            </Card>
          </div>
        </div>
      </form>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={t('previewTitle')}
        size="lg"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('previewSubject')}
            </label>
            <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
              {formData.subject}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('previewContent')}
            </label>
            <div 
              className="border border-gray-200 rounded-lg p-4 bg-white max-h-96 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: getPreviewBody() }}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              {t('previewNote')}
            </p>
          </div>

          <Button
            onClick={() => setShowPreview(false)}
            className="w-full bg-gray-600 hover:bg-gray-700"
          >
            {t('close')}
          </Button>
        </div>
      </Modal>

      {/* Toast Notifications */}
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
