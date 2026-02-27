'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Plus, Menu as MenuIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useTranslations } from 'next-intl';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import { menuLinkItemService } from '../../services/admin.service';
import { getLocalizedText, getCurrentLocale, type SupportedLocale } from '../../lib/i18n-utils';

interface Menu {
  code: string;
  name: { tr: string; en: string };
  icon?: string;
  displayOrder: number;
  isRoot: boolean;
  active: boolean;
  url?: string;
  menuType?: 'ADMIN_PANEL' | 'PUBLIC';
  parentMenuCode?: string;
  userGroups?: Array<{ code: string; name: { tr: string; en: string } }>;
}

export default function AdminMenus() {
  const router = useRouter();
  const t = useTranslations();
  const locale = getCurrentLocale() as SupportedLocale;
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; code: string; name: string }>({
    isOpen: false,
    code: '',
    name: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadMenus();
    }
  }, [mounted]);

  const loadMenus = async () => {
    try {
      setLoading(true);
      console.log('Loading admin menus...');
      const response = await menuLinkItemService.getByType('ADMIN_PANEL');
      console.log('Admin menus response:', response);
      
      if (response.status === 'SUCCESS' && response.data) {
        // Backend response zaten wrapped, response.data içinde asıl data var
        const backendResponse = response.data as any;
        console.log('Backend response:', backendResponse);
        
        if (backendResponse.data && Array.isArray(backendResponse.data)) {
          console.log('Setting menus (tree structure):', backendResponse.data);
          // Backend artık tree yapısında dönüyor, bunu flat listeye çevirelim
          const flatList = flattenMenuTree(backendResponse.data);
          console.log('Flattened menus:', flatList);
          setMenus(flatList);
        } else {
          console.error('Backend data is not an array:', backendResponse);
          setMenus([]);
          setToast({ 
            message: t('menusPage.adminMenus.dataFormatError'), 
            type: 'error' 
          });
        }
      } else {
        console.log('Response not successful or no data');
        setMenus([]);
        setToast({ 
          message: response.errorMessage || t('menusPage.adminMenus.loadError'), 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error loading menus:', error);
      setMenus([]);
      setToast({ message: t('menusPage.adminMenus.loadError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Backend'den gelen tree yapısını flat listeye çevir
  const flattenMenuTree = (tree: any[], level: number = 0): any[] => {
    const result: any[] = [];
    tree.forEach(node => {
      result.push({ ...node, level });
      if (node.subMenuLinkItems && node.subMenuLinkItems.length > 0) {
        result.push(...flattenMenuTree(node.subMenuLinkItems, level + 1));
      }
    });
    return result;
  };

  // Menüleri tree yapısına dönüştür (TreeSelect için)
  const buildMenuTree = (parentCode: string | null = null, level: number = 0): any[] => {
    return menus
      .filter(m => parentCode === null ? m.isRoot : m.parentMenuCode === parentCode)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(menu => ({
        ...menu,
        level,
        children: buildMenuTree(menu.code, level + 1)
      }));
  };

  // Tree'yi flat liste haline getir (render için)
  const flattenTree = (tree: any[]): any[] => {
    const result: any[] = [];
    tree.forEach(node => {
      result.push(node);
      if (node.children && node.children.length > 0) {
        result.push(...flattenTree(node.children));
      }
    });
    return result;
  };

  const menuTree = buildMenuTree();
  const flatMenus = flattenTree(menuTree);

  const handleDelete = async (code: string) => {
    try {
      const response = await menuLinkItemService.delete(code);
      
      if (response.status === 'SUCCESS') {
        setToast({ message: t('menusPage.adminMenus.deleteSuccess'), type: 'success' });
        loadMenus();
      } else {
        setToast({ message: response.errorMessage || t('menusPage.adminMenus.deleteFailed'), type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
      setToast({ message: t('menusPage.adminMenus.deleteError'), type: 'error' });
    }
  };

  const renderIcon = (iconValue?: string) => {
    console.log('Rendering icon:', iconValue);
    
    if (!iconValue) {
      return <MenuIcon className="w-4 h-4 text-blue-600" />;
    }

    // Emoji ise direkt göster (Unicode emoji pattern)
    if (/\p{Emoji}/u.test(iconValue)) {
      console.log('Detected as emoji:', iconValue);
      return <span className="text-lg">{iconValue}</span>;
    }
    
    // Lucide icon ise component olarak render et
    const IconComponent = (LucideIcons as any)[iconValue];
    if (IconComponent) {
      console.log('Detected as Lucide icon:', iconValue);
      return <IconComponent className="w-4 h-4 text-blue-600" />;
    }
    
    // Fallback - icon bulunamadı
    console.log('Icon not found, using fallback for:', iconValue);
    return <MenuIcon className="w-4 h-4 text-blue-600" />;
  };

  return (
    <Section>
      <Container>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              ⚙️ {t('menusPage.adminMenus.title')}
            </h1>
            <p className="text-gray-600">{t('menusPage.adminMenus.totalMenus', { count: flatMenus.length })}</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/admin/menus/public')}
            >
              🌐 {t('menusPage.adminMenus.publicMenus')}
            </Button>
            <Button 
              onClick={() => router.push('/admin/menus/admin/new')} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('menusPage.adminMenus.newMenu')}
            </Button>
          </div>
        </div>

        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">{t('menusPage.adminMenus.loading')}</p>
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {t('menusPage.adminMenus.table.menu')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {t('menusPage.adminMenus.table.url')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {t('menusPage.adminMenus.table.groups')}
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {t('menusPage.adminMenus.table.order')}
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {t('menusPage.adminMenus.table.status')}
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {t('menusPage.adminMenus.table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {(() => {
                      console.log('Rendering menus, count:', flatMenus.length);
                      return Array.isArray(flatMenus) && flatMenus.map((menu, index) => {
                        console.log('Rendering menu:', menu);
                        return (
                          <tr 
                            key={menu.code}
                            className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3" style={{ paddingLeft: `${menu.level * 24}px` }}>
                                {menu.level > 0 && (
                                  <span className="text-gray-400 text-xs">└─</span>
                                )}
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  {renderIcon(menu.icon)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-900">
                                      {getLocalizedText(menu.name, locale)}
                                    </span>
                                    {menu.level > 0 && (
                                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">
                                        {t('menusPage.adminMenus.status.sub')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs text-gray-600 font-mono">
                                {menu.url || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {menu.userGroups && menu.userGroups.length > 0 ? (
                                  <>
                                    {menu.userGroups.slice(0, 2).map((ug: any, idx: number) => (
                                      <span 
                                        key={idx}
                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
                                      >
                                        {getLocalizedText(ug.name, locale)}
                                      </span>
                                    ))}
                                    {menu.userGroups.length > 2 && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
                                        +{menu.userGroups.length - 2}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-xs text-gray-400">{t('menusPage.adminMenus.allGroups')}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                                {menu.displayOrder}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                menu.active 
                                  ? 'bg-green-100 text-green-800 ring-1 ring-green-600/20' 
                                  : 'bg-red-100 text-red-800 ring-1 ring-red-600/20'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                  menu.active ? 'bg-green-600' : 'bg-red-600'
                                }`}></span>
                                {menu.active ? t('menusPage.adminMenus.status.active') : t('menusPage.adminMenus.status.inactive')}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => router.push(`/admin/menus/admin/${menu.code}`)}
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
                                  title={t('menusPage.adminMenus.edit')}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteDialog({ 
                                    isOpen: true, 
                                    code: menu.code, 
                                    name: getLocalizedText(menu.name, locale)
                                  })}
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
                                  title={t('menusPage.adminMenus.delete')}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </Card>

            {(!Array.isArray(flatMenus) || flatMenus.length === 0) && (
              <Card className="p-12 text-center mt-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl">⚙️</span>
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium mb-1">{t('menusPage.adminMenus.noMenus')}</p>
                    <p className="text-gray-500 text-sm mb-4">{t('menusPage.adminMenus.noMenusDesc')}</p>
                  </div>
                  <Button onClick={() => router.push('/admin/menus/admin/new')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('menusPage.adminMenus.addFirstMenu')}
                  </Button>
                </div>
              </Card>
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
          onClose={() => setDeleteDialog({ isOpen: false, code: '', name: '' })}
          onConfirm={() => handleDelete(deleteDialog.code)}
          title={t('menusPage.adminMenus.deleteDialog.title')}
          message={t('menusPage.adminMenus.deleteDialog.message', { name: deleteDialog.name })}
          confirmText={t('menusPage.adminMenus.deleteDialog.confirm')}
          cancelText={t('menusPage.adminMenus.deleteDialog.cancel')}
          type="danger"
        />
      </Container>
    </Section>
  );
}
