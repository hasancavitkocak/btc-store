'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import { searchService, SearchFormData } from '../../services/search.service';
import { parameterService } from '../../services/admin.service';
import { useTranslations } from 'next-intl';

interface Parameter {
  code: string;
  value: string;
  description?: { tr?: string; en?: string };
  dataType: string;
  parameterType: string;
  encrypt: boolean;
}

export default function ParametersAdmin() {
  const router = useRouter();
  const t = useTranslations();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; code: string; value: string }>({
    isOpen: false,
    code: '',
    value: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadParameters();
    }
  }, [page, mounted]);

  const loadParameters = async () => {
    try {
      setLoading(true);
      
      const searchFormData: SearchFormData = {
        filters: [],
        sort: { name: 'code', direction: 'ASC' }
      };

      const response = await searchService.search<Parameter>('parameter', searchFormData, page);
      
      if (response.status === 'SUCCESS' && response.data) {
        const pageData = (response.data as any).data;
        
        if (pageData && pageData.content) {
          setParameters(pageData.content || []);
          setTotalPages(pageData.totalPages || 0);
          setTotalElements(pageData.totalElements || 0);
        } else {
          console.error('pageData structure is wrong:', pageData);
          setToast({ message: t('parametersAdmin.dataFormatError'), type: 'error' });
        }
      } else {
        setToast({ 
          message: response.errorMessage || t('parametersAdmin.loadError'), 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error loading parameters:', error);
      setToast({ message: t('parametersAdmin.loadError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    try {
      const response = await parameterService.delete(code);
      
      if (response.status === 'SUCCESS') {
        setToast({ message: t('parametersAdmin.deleteSuccess'), type: 'success' });
        setPage(1);
        if (page === 1) {
          loadParameters();
        }
      } else {
        setToast({ message: response.errorMessage || t('parametersAdmin.deleteFailed'), type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting parameter:', error);
      setToast({ message: t('parametersAdmin.deleteError'), type: 'error' });
    }
  };

  return (
    <Section>
      <Container>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('parametersAdmin.title')}
            </h1>
            <p className="text-gray-600">{t('parametersAdmin.totalParameters', { count: totalElements })}</p>
          </div>
          <Button onClick={() => router.push('/admin/parameters/new')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-2" />
            {t('parametersAdmin.newParameter')}
          </Button>
        </div>

        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">{t('parametersAdmin.loading')}</p>
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {t('parametersAdmin.table.code')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {t('parametersAdmin.table.value')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {t('parametersAdmin.table.description')}
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {t('parametersAdmin.table.type')}
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {t('parametersAdmin.table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {parameters.map((parameter, index) => (
                      <tr 
                        key={parameter.code} 
                        className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">{parameter.code}</span>
                            {parameter.encrypt && (
                              <span className="text-yellow-600" title={t('parametersAdmin.encrypted')}>🔒</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-xs truncate font-mono">
                            {parameter.encrypt ? '••••••••' : parameter.value}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-500 max-w-xs truncate">
                            {parameter.description?.tr || parameter.description?.en || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {parameter.dataType}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              {parameter.parameterType}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => router.push(`/admin/parameters/${parameter.code}`)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
                              title={t('parametersAdmin.edit')}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteDialog({ 
                                isOpen: true, 
                                code: parameter.code, 
                                value: parameter.code 
                              })}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
                              title={t('parametersAdmin.delete')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {parameters.length === 0 && (
              <Card className="p-12 text-center mt-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl">⚙️</span>
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium mb-1">{t('parametersAdmin.noParameters')}</p>
                    <p className="text-gray-500 text-sm mb-4">{t('parametersAdmin.noParametersDesc')}</p>
                  </div>
                  <Button onClick={() => router.push('/admin/parameters/new')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('parametersAdmin.addFirstParameter')}
                  </Button>
                </div>
              </Card>
            )}

            {totalElements > 0 && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-600">
                  {t('parametersAdmin.totalRecords', { count: totalElements })}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {t('parametersAdmin.previous')}
                  </Button>
                  
                  <span className="text-sm text-gray-600 px-4">
                    {t('parametersAdmin.page')} <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages || 1}</span>
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                  >
                    {t('parametersAdmin.next')}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, code: '', value: '' })}
          onConfirm={() => handleDelete(deleteDialog.code)}
          title={t('parametersAdmin.deleteDialog.title')}
          message={t('parametersAdmin.deleteDialog.message', { value: deleteDialog.value })}
          confirmText={t('parametersAdmin.deleteDialog.confirm')}
          cancelText={t('parametersAdmin.deleteDialog.cancel')}
          type="danger"
        />
      </Container>
    </Section>
  );
}
