'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Eye, Mail, CheckCircle, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { emailTemplateService } from '@/services/admin.service';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';

interface EmailTemplate {
  id: number;
  code: string;
  templateName: string;
  subject: string;
  body: string;
  description?: string;
  isActive: boolean;
  createdDate: string;
  lastModifiedDate?: string;
}

export default function EmailTemplatesAdmin() {
  const router = useRouter();
  const t = useTranslations('admin.emailTemplates');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; code: string; name: string }>({
    isOpen: false,
    code: '',
    name: ''
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await emailTemplateService.getAll();
      
      if (response.status === 'SUCCESS' && response.data) {
        // Handle wrapped data
        const actualData = response.data.data || response.data;
        const dataArray = Array.isArray(actualData) ? actualData : [];
        
        // Map 'active' field to 'isActive'
        const mappedData = dataArray.map((template: any) => ({
          ...template,
          isActive: template.active !== undefined ? template.active : template.isActive
        }));
        
        setTemplates(mappedData as EmailTemplate[]);
      } else {
        setTemplates([]);
        setToast({ message: t('messages.loadError'), type: 'error' });
      }
    } catch (error) {
      console.error('Email templates yüklenirken hata:', error);
      setTemplates([]);
      setToast({ message: t('messages.loadErrorGeneric'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    try {
      const response = await emailTemplateService.delete(code);
      
      if (response.status === 'SUCCESS') {
        setToast({ message: t('messages.deleteSuccess'), type: 'success' });
        loadTemplates();
      } else {
        setToast({ message: response.errorMessage || t('messages.deleteError'), type: 'error' });
      }
    } catch (error) {
      console.error('Template silinirken hata:', error);
      setToast({ message: t('messages.deleteErrorGeneric'), type: 'error' });
    }
  };

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>
        <Button
          onClick={() => router.push('/admin/email-templates/new')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          {t('newTemplate')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">{t('stats.total')}</div>
              <div className="text-3xl font-bold text-gray-900">{templates.length}</div>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">{t('stats.active')}</div>
              <div className="text-3xl font-bold text-green-600">
                {templates.filter(t => t.isActive).length}
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">{t('stats.inactive')}</div>
              <div className="text-3xl font-bold text-red-600">
                {templates.filter(t => !t.isActive).length}
              </div>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Templates List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.templateName')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.code')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.subject')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.lastUpdate')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {t('loading')}
                  </td>
                </tr>
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {t('noTemplates')}
                  </td>
                </tr>
              ) : (
                templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{template.templateName}</div>
                      {template.description && (
                        <div className="text-sm text-gray-500 mt-1">{template.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-mono">
                        {template.code}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{template.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {template.isActive ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          {t('status.active')}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          {t('status.inactive')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(template.lastModifiedDate || template.createdDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreview(template)}
                          className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admin/email-templates/${template.code}`)}
                          className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteDialog({ 
                            isOpen: true, 
                            code: template.code, 
                            name: template.templateName 
                          })}
                          className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Preview Modal */}
      {showPreviewModal && selectedTemplate && (
        <Modal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          title={`${t('preview.title')}: ${selectedTemplate.templateName}`}
          size="lg"
        >
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('preview.subject')}
              </label>
              <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                {selectedTemplate.subject}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('preview.content')}
              </label>
              <div 
                className="border border-gray-200 rounded-lg p-4 bg-white max-h-96 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: selectedTemplate.body }}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{t('preview.note')}</strong> {t('preview.noteText')}
              </p>
            </div>

            <Button
              onClick={() => setShowPreviewModal(false)}
              className="w-full bg-gray-600 hover:bg-gray-700"
            >
              {t('preview.close')}
            </Button>
          </div>
        </Modal>
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, code: '', name: '' })}
        onConfirm={() => {
          handleDelete(deleteDialog.code);
          setDeleteDialog({ isOpen: false, code: '', name: '' });
        }}
        title={t('delete.title')}
        message={t('delete.message', { name: deleteDialog.name })}
        confirmText={t('delete.confirm')}
        cancelText={t('delete.cancel')}
        type="danger"
      />
    </div>
  );
}
