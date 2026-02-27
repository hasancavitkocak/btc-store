'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Trash2, Edit2, Plus, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import { searchService, SearchFormData } from '../../services/search.service';
import { userRoleService } from '../../services/admin.service';
import { getLocalizedText, type SupportedLocale } from '../../lib/i18n-utils';

interface UserRole {
  id: number;
  code: string;
  description: {
    tr?: string;
    en?: string;
  };
  active: boolean;
  createdDate?: string;
}

export default function UserRolesAdminList() {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale() as SupportedLocale;
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; code: string }>({
    isOpen: false,
    code: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadUserRoles();
    }
  }, [page, mounted]);

  const loadUserRoles = async () => {
    try {
      setLoading(true);
      
      const searchFormData: SearchFormData = {
        filters: [],
        sort: { name: 'code', direction: 'ASC' }
      };

      const response = await searchService.search<UserRole>('user-role', searchFormData, page);
      
      if (response.status === 'SUCCESS' && response.data) {
        const pageData = (response.data as any).data;
        
        if (pageData && pageData.content) {
          setUserRoles(pageData.content || []);
          setTotalPages(pageData.totalPages || 0);
          setTotalElements(pageData.totalElements || 0);
        } else {
          console.error('pageData structure is wrong:', pageData);
          setToast({ message: t('userRolesAdmin.dataFormatError'), type: 'error' });
        }
      } else {
        setToast({ 
          message: response.errorMessage || t('userRolesAdmin.loadError'), 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error loading user roles:', error);
      setToast({ message: t('userRolesAdmin.loadError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    try {
      const response = await userRoleService.delete(code);
      
      if (response.status === 'SUCCESS') {
        setToast({ message: t('userRolesAdmin.deleteSuccess'), type: 'success' });
        setPage(1);
        if (page === 1) {
          loadUserRoles();
        }
      } else {
        setToast({ message: response.errorMessage || t('userRolesAdmin.deleteFailed'), type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting user role:', error);
      setToast({ message: t('userRolesAdmin.deleteError'), type: 'error' });
    }
  };

  if (loading && !mounted) {
    return (
      <div className="p-8">
        <div className="text-center">{t('userRolesAdmin.loading')}</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('userRolesAdmin.title')}
          </h1>
          <p className="text-gray-600">{t('userRolesAdmin.totalPermissions', { count: totalElements })}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/users')}
            className="flex items-center gap-2"
          >
            {t('userRolesAdmin.backToUsers')}
          </Button>
          <Button
            onClick={() => router.push('/admin/user-roles/new')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            {t('userRolesAdmin.newPermission')}
          </Button>
        </div>
      </div>

      {loading ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">{t('userRolesAdmin.loading')}</p>
        </Card>
      ) : userRoles.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="text-gray-900 font-medium mb-1">{t('userRolesAdmin.noPermissions')}</p>
              <p className="text-gray-500 text-sm mb-4">{t('userRolesAdmin.addFirstPermission')}</p>
            </div>
            <Button onClick={() => router.push('/admin/user-roles/new')} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              {t('userRolesAdmin.addFirstPermissionButton')}
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t('userRolesAdmin.permission')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t('userRolesAdmin.description')}
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t('userRolesAdmin.status')}
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t('userRolesAdmin.createdDate')}
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t('userRolesAdmin.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {userRoles.map((role, index) => (
                    <tr 
                      key={role.id} 
                      className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                            <Shield className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{role.code}</div>
                            <div className="text-xs text-gray-500">{t('userRolesAdmin.userPermission')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {getLocalizedText(role.description, locale) || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          role.active 
                            ? 'bg-green-100 text-green-800 ring-1 ring-green-600/20' 
                            : 'bg-red-100 text-red-800 ring-1 ring-red-600/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            role.active ? 'bg-green-600' : 'bg-red-600'
                          }`}></span>
                          {role.active ? t('userRolesAdmin.active') : t('userRolesAdmin.inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-xs text-gray-500">
                          {role.createdDate ? new Date(role.createdDate).toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'en' ? 'en-US' : locale === 'de' ? 'de-DE' : locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : 'it-IT') : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => router.push(`/admin/user-roles/${role.code}`)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
                            title={t('userRolesAdmin.edit')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteDialog({ isOpen: true, code: role.code })}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
                            title={t('userRolesAdmin.delete')}
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

          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-600">
              {t('userRolesAdmin.totalRecords', { count: totalElements })}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                <ChevronLeft className="w-4 h-4" />
                {t('userRolesAdmin.previous')}
              </Button>
              
              <span className="text-sm text-gray-600 px-4">
                {t('userRolesAdmin.pageInfo', { current: page, total: totalPages || 1 })}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
              >
                {t('userRolesAdmin.next')}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
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
        onClose={() => setDeleteDialog({ isOpen: false, code: '' })}
        onConfirm={() => handleDelete(deleteDialog.code)}
        title={t('userRolesAdmin.deleteDialogTitle')}
        message={t('userRolesAdmin.deleteDialogMessage', { code: deleteDialog.code })}
        confirmText={t('userRolesAdmin.deleteConfirm')}
        cancelText={t('common.cancel')}
        type="danger"
      />
    </div>
  );
}
