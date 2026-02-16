'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Plus, Menu as MenuIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import { menuLinkItemService } from '../../services/admin.service';

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

export default function PublicMenus() {
  const router = useRouter();
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
      const response = await menuLinkItemService.getByType('PUBLIC');
      
      if (response.status === 'SUCCESS' && response.data) {
        // Backend response zaten wrapped, response.data içinde asıl data var
        const backendResponse = response.data as any;
        
        if (backendResponse.data && Array.isArray(backendResponse.data)) {
          // Backend artık tree yapısında dönüyor, bunu flat listeye çevirelim
          const flatList = flattenMenuTree(backendResponse.data);
          setMenus(flatList);
        } else {
          console.error('Backend data is not an array:', backendResponse);
          setMenus([]);
          setToast({ 
            message: 'Menü listesi formatı hatalı', 
            type: 'error' 
          });
        }
      } else {
        setMenus([]);
        setToast({ 
          message: response.errorMessage || 'Menü listesi yüklenirken hata oluştu', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error loading menus:', error);
      setMenus([]);
      setToast({ message: 'Menü listesi yüklenirken hata oluştu', type: 'error' });
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
        setToast({ message: 'Menü silindi', type: 'success' });
        loadMenus();
      } else {
        setToast({ message: response.errorMessage || 'Silme işlemi başarısız', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
      setToast({ message: 'Menü silinirken hata oluştu', type: 'error' });
    }
  };

  const renderIcon = (iconValue?: string) => {
    console.log('Rendering icon:', iconValue);
    
    if (!iconValue) {
      return <MenuIcon className="w-6 h-6 text-blue-600" />;
    }

    // Emoji ise direkt göster (Unicode emoji pattern)
    if (/\p{Emoji}/u.test(iconValue)) {
      console.log('Detected as emoji:', iconValue);
      return <span className="text-2xl">{iconValue}</span>;
    }
    
    // Lucide icon ise component olarak render et
    const IconComponent = (LucideIcons as any)[iconValue];
    if (IconComponent) {
      console.log('Detected as Lucide icon:', iconValue);
      return <IconComponent className="w-6 h-6 text-blue-600" />;
    }
    
    // Fallback - icon bulunamadı
    console.log('Icon not found, using fallback for:', iconValue);
    return <MenuIcon className="w-6 h-6 text-blue-600" />;
  };

  return (
    <Section>
      <Container>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🌐 Public Menüler
            </h1>
            <p className="text-gray-600">Toplam {flatMenus.length} menü</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/admin/menus/admin')}
            >
              ⚙️ Admin Menüler
            </Button>
            <Button 
              onClick={() => router.push('/admin/menus/public/new')} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Yeni Public Menü
            </Button>
          </div>
        </div>

        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">Yükleniyor...</p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {Array.isArray(flatMenus) && flatMenus.map((menu) => {
                const indent = menu.level * 32; // Her seviye için 32px girinti
                return (
                  <div key={menu.code} style={{ marginLeft: `${indent}px` }}>
                    <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500">
                      <div className="flex items-center gap-4">
                        {menu.level > 0 && (
                          <div className="text-gray-400 text-sm font-mono">
                            {'└─'.repeat(1)}
                          </div>
                        )}
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          {renderIcon(menu.icon)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {menu.level > 0 && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                Alt Menü
                              </span>
                            )}
                            <h3 className="font-semibold text-lg">{menu.name?.tr || menu.name?.en || 'İsimsiz Menü'}</h3>
                          </div>
                          {menu.url && <p className="text-gray-600 text-sm">{menu.url}</p>}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded ${menu.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {menu.active ? 'Aktif' : 'Pasif'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${menu.isRoot ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                              {menu.isRoot ? 'Ana Menü' : 'Alt Menü'}
                            </span>
                            <span className="text-xs text-gray-500">Sıra: {menu.displayOrder}</span>
                            {menu.userGroups && menu.userGroups.length > 0 && (
                              <span className="text-xs text-gray-500">
                                {menu.userGroups.length} Kullanıcı Grubu
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/menus/public/${menu.code}`)}
                            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteDialog({ 
                              isOpen: true, 
                              code: menu.code, 
                              name: menu.name?.tr || menu.name?.en || 'İsimsiz Menü'
                            })}
                            className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>

            {(!Array.isArray(flatMenus) || flatMenus.length === 0) && (
              <Card className="p-12 text-center">
                <p className="text-gray-500 mb-4">Henüz public menü eklenmemiş</p>
                <Button onClick={() => router.push('/admin/menus/public/new')} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  İlk Public Menüyü Ekle
                </Button>
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
          title="Public Menü Sil"
          message={`"${deleteDialog.name}" menüsünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
          confirmText="Sil"
          cancelText="İptal"
          type="danger"
        />
      </Container>
    </Section>
  );
}
