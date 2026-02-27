'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Save, X, ArrowLeft, Search } from 'lucide-react';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import TreeSelect from '../../components/TreeSelect';
import IconPicker from '../../components/IconPicker';
import { menuLinkItemService, userGroupService } from '../../services/admin.service';
import Toast from '@/components/Toast';
import { getLocalizedText, type SupportedLocale } from '../../lib/i18n-utils';

interface MenuFormProps {
  menuId?: string;
  menuType: 'ADMIN_PANEL' | 'PUBLIC';
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

export default function MenuForm({ menuId, menuType }: MenuFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale() as SupportedLocale;
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [loading, setLoading] = useState(false);
  const [menus, setMenus] = useState<any[]>([]);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [filteredUserGroups, setFilteredUserGroups] = useState<any[]>([]);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  
  const isEditing = !!menuId;

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
    code: '',
    name: { tr: '', en: '', de: '', fr: '', es: '', it: '' },
    icon: '',
    displayOrder: 0,
    isRoot: true,
    active: true,
    url: '',
    menuType: menuType,
    parentMenuCode: '',
    userGroups: [] as string[]
  });

  // Debug: formData değişikliklerini logla
  useEffect(() => {
    console.log('Form data updated:', formData);
  }, [formData]);

  useEffect(() => {
    loadMenus();
    // Kullanıcı gruplarını sadece ADMIN_PANEL için yükle
    if (menuType === 'ADMIN_PANEL') {
      loadUserGroups();
    }
  }, [menuType]);

  // menuId değiştiğinde menüyü yükle
  useEffect(() => {
    if (menuId) {
      loadMenu();
    }
  }, [menuId]);

  const loadMenus = async () => {
    // API'den menüleri çek
    try {
      const response = await menuLinkItemService.getByType(menuType);
      if (response.status === 'SUCCESS' && response.data) {
        const backendResponse = response.data as any;
        if (backendResponse.data && Array.isArray(backendResponse.data)) {
          console.log('Menus from API (tree structure):', backendResponse.data);
          // Backend tree yapısında dönüyor, düz listeye çevir
          const flatList = flattenMenuTreeForForm(backendResponse.data);
          console.log('Flattened menus for form:', flatList);
          setMenus(flatList);
        }
      }
    } catch (error) {
      console.log('API failed:', error);
      setMenus([]);
    }
  };

  // Backend'den gelen tree yapısını düz listeye çevir (form için)
  const flattenMenuTreeForForm = (tree: any[]): any[] => {
    const result: any[] = [];
    tree.forEach(node => {
      result.push(node);
      if (node.subMenuLinkItems && node.subMenuLinkItems.length > 0) {
        result.push(...flattenMenuTreeForForm(node.subMenuLinkItems));
      }
    });
    return result;
  };

  const loadUserGroups = async () => {
    // Mock data - her zaman göster
    const mockUserGroups = [
      {
        code: 'admin',
        description: { tr: 'Yöneticiler', en: 'Administrators' }
      },
      {
        code: 'editor',
        description: { tr: 'İçerik Editörleri', en: 'Content Editors' }
      },
      {
        code: 'viewer',
        description: { tr: 'Görüntüleyenler', en: 'Viewers' }
      },
      {
        code: 'moderator',
        description: { tr: 'Moderatörler', en: 'Moderators' }
      },
      {
        code: 'support',
        description: { tr: 'Destek Ekibi', en: 'Support Team' }
      },
      {
        code: 'manager',
        description: { tr: 'Yöneticiler', en: 'Managers' }
      },
      {
        code: 'developer',
        description: { tr: 'Geliştiriciler', en: 'Developers' }
      }
    ];

    console.log('Loading user groups, mock data:', mockUserGroups);
    setUserGroups(mockUserGroups);
    setFilteredUserGroups(mockUserGroups);

    // API'yi de dene ama mock data zaten yüklü
    try {
      const response = await userGroupService.getAll();
      if (response.status === 'SUCCESS' && response.data && Array.isArray(response.data)) {
        console.log('User groups from API:', response.data);
        setUserGroups(response.data as any[]);
        setFilteredUserGroups(response.data as any[]);
      } else if (response.status === 'SUCCESS' && response.data) {
        // Backend wrapped response
        const backendResponse = response.data as any;
        if (backendResponse.data && Array.isArray(backendResponse.data)) {
          console.log('User groups from API (wrapped):', backendResponse.data);
          setUserGroups(backendResponse.data as any[]);
          setFilteredUserGroups(backendResponse.data as any[]);
        }
      }
    } catch (error) {
      console.log('API failed, using mock data');
    }
  };

  const loadMenu = async () => {
    try {
      setLoading(true);
      const response = await menuLinkItemService.getByCode(menuId!);
      console.log('Load menu response:', response);
      
      if (response.status === 'SUCCESS' && response.data) {
        // Backend response wrapped: response.data.data içinde asıl data var
        const backendResponse = response.data as any;
        console.log('Backend response:', backendResponse);
        
        // İki seviye kontrol: backendResponse.data veya direkt backendResponse
        let menuData = backendResponse;
        if (backendResponse.data) {
          menuData = backendResponse.data;
        }
        console.log('Menu data to populate form:', menuData);
        
        // Form verilerini doldur
        const newFormData = {
          id: menuData.id,
          code: menuData.code || '',
          name: menuData.name || { tr: '', en: '', de: '', fr: '', es: '', it: '' },
          icon: menuData.icon || '',
          displayOrder: menuData.displayOrder ?? 0,
          isRoot: menuData.isRoot ?? true,
          active: menuData.active ?? true,
          url: menuData.url || '',
          menuType: menuData.menuType || menuType,
          parentMenuCode: menuData.parentMenuCode || '',
          userGroups: menuData.userGroups?.map((ug: any) => ug.code) || []
        };
        
        console.log('Setting form data:', newFormData);
        setFormData(newFormData);
      }
    } catch (error) {
      console.error('Error loading menu:', error);
      setToast({ message: t('menusPage.menuForm.loadError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.tr && !formData.name.en) {
      setToast({ message: t('menusPage.menuForm.nameRequired'), type: 'error' });
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        // PUBLIC menüler için userGroups boş gönder
        userGroups: menuType === 'ADMIN_PANEL' 
          ? formData.userGroups.map(code => ({ code }))
          : []
      };

      const response = await menuLinkItemService.save(submitData);
      
      if (response.status === 'SUCCESS') {
        setToast({ message: isEditing ? t('menusPage.menuForm.updateSuccess') : t('menusPage.menuForm.createSuccess'), type: 'success' });
        setTimeout(() => router.push(menuType === 'ADMIN_PANEL' ? '/admin/menus/admin' : '/admin/menus/public'), 1500);
      } else {
        setToast({ message: response.errorMessage || t('menusPage.menuForm.saveError'), type: 'error' });
      }
    } catch (error) {
      console.error('Error saving menu:', error);
      setToast({ message: t('menusPage.menuForm.saveError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserGroup = (code: string) => {
    setFormData(prev => ({
      ...prev,
      userGroups: prev.userGroups.includes(code)
        ? prev.userGroups.filter(c => c !== code)
        : [...prev.userGroups, code]
    }));
  };

  const handleUserGroupSearch = (term: string) => {
    if (!Array.isArray(userGroups)) {
      console.error('userGroups is not an array:', userGroups);
      setFilteredUserGroups([]);
      return;
    }
    
    if (!term) {
      setFilteredUserGroups(userGroups);
      return;
    }
    
    const filtered = userGroups.filter(group => 
      group.description?.tr?.toLowerCase().includes(term.toLowerCase()) ||
      group.description?.en?.toLowerCase().includes(term.toLowerCase()) ||
      group.code.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredUserGroups(filtered);
  };

  // Tree select için menüleri hiyerarşik yapıya dönüştür
  const buildMenuTree = (parentCode: string | null = null, level: number = 0): any[] => {
    if (!Array.isArray(menus)) {
      console.error('menus is not an array:', menus);
      return [];
    }
    
    const tree = menus
      .filter(m => 
        m.code !== formData.code && 
        (m.menuType === menuType || !m.menuType) && // Sadece aynı tip menüleri göster
        (parentCode === null ? m.isRoot : m.parentMenuCode === parentCode)
      )
      .map(menu => {
        console.log('Building tree node for menu:', menu.code, 'icon:', menu.icon);
        return {
          ...menu,
          level,
          children: buildMenuTree(menu.code, level + 1)
        };
      });
    
    if (parentCode === null) {
      console.log('Final menu tree:', tree);
    }
    
    return tree;
  };

  const renderMenuOption = (menu: any) => {
    // Her seviye için 2 boşluk ekle
    const indent = '\u00A0\u00A0'.repeat(menu.level * 2);
    // Alt menü için özel işaret
    const prefix = menu.level > 0 ? '├─ ' : '';
    const icon = menu.icon ? `${menu.icon} ` : '';
    return (
      <option key={menu.code} value={menu.code} style={{ paddingLeft: `${menu.level * 20}px` }}>
        {indent}{prefix}{icon}{menu.name.tr || menu.name.en}
      </option>
    );
  };

  const renderMenuTree = (menuTree: any[]): JSX.Element[] => {
    const result: JSX.Element[] = [];
    menuTree.forEach(menu => {
      result.push(renderMenuOption(menu));
      if (menu.children && menu.children.length > 0) {
        result.push(...renderMenuTree(menu.children));
      }
    });
    return result;
  };

  const menuTree = buildMenuTree();

  return (
    <Section>
      <Container>
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push(menuType === 'ADMIN_PANEL' ? '/admin/menus/admin' : '/admin/menus/public')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('menusPage.menuForm.back')}
          </Button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isEditing 
              ? t('menusPage.menuForm.editMenu')
              : menuType === 'ADMIN_PANEL' 
                ? `⚙️ ${t('menusPage.menuForm.newAdminMenu')}`
                : `🌐 ${t('menusPage.menuForm.newPublicMenu')}`
            }
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('menusPage.menuForm.menuInfo')}</h2>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">{t('menusPage.menuForm.menuName')}</label>
                    <button
                      type="button"
                      onClick={() => toggleField('name')}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                      <span className="text-base">{expandedFields.has('name') ? '🌐' : '🌍'}</span>
                      <span>{t('menusPage.menuForm.otherLanguages')}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">5</span>
                      <span className="text-gray-400">{expandedFields.has('name') ? '▼' : '▶'}</span>
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <Input
                      placeholder={`${languageInfo[orderedLanguages[0]].code} - ${languageInfo[orderedLanguages[0]].name}`}
                      value={formData.name[orderedLanguages[0]]}
                      onChange={(e) => setFormData({ ...formData, name: { ...formData.name, [orderedLanguages[0]]: e.target.value } })}
                    />
                    
                    {expandedFields.has('name') && (
                      <div className="space-y-3 pt-3 border-t border-gray-200">
                        {orderedLanguages.slice(1).map((lang) => (
                          <Input
                            key={lang}
                            placeholder={`${languageInfo[lang].code} - ${languageInfo[lang].name}`}
                            value={formData.name[lang]}
                            onChange={(e) => setFormData({ ...formData, name: { ...formData.name, [lang]: e.target.value } })}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <IconPicker
                      label={t('menusPage.menuForm.icon')}
                      value={formData.icon}
                      onChange={(value) => {
                        console.log('Icon selected:', value);
                        setFormData({ ...formData, icon: value });
                      }}
                    />
                    {formData.icon && (
                      <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">{t('menusPage.menuForm.selectedIcon')}</p>
                        <p className="text-sm font-mono text-gray-800">{formData.icon}</p>
                      </div>
                    )}
                  </div>
                  <Input
                    label={t('menusPage.menuForm.order')}
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <Input
                  label={t('menusPage.menuForm.url')}
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="/admin/dashboard"
                />

                <TreeSelect
                  label={t('menusPage.menuForm.parentMenu')}
                  value={formData.parentMenuCode}
                  onChange={(value) => setFormData({ 
                    ...formData, 
                    parentMenuCode: value,
                    isRoot: !value
                  })}
                  options={menuTree}
                  placeholder={t('menusPage.menuForm.parentMenuPlaceholder')}
                />

                {/* Kullanıcı Grupları - Sadece ADMIN_PANEL için göster */}
                {menuType === 'ADMIN_PANEL' && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        {t('menusPage.menuForm.userGroups')}
                      </label>
                      {formData.userGroups.length > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                          {t('menusPage.menuForm.selectedCount', { count: formData.userGroups.length })}
                        </span>
                      )}
                    </div>
                    
                    {/* Search */}
                    <div className="p-3 border-b border-gray-200 bg-white">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder={t('menusPage.menuForm.searchGroups')}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          onChange={(e) => handleUserGroupSearch(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="p-3">
                      <div className="space-y-1 max-h-64 overflow-y-auto">
                        {!Array.isArray(filteredUserGroups) || filteredUserGroups.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">{t('menusPage.menuForm.noGroupsFound')}</p>
                        ) : (
                          filteredUserGroups.map(group => (
                            <label 
                              key={group.code} 
                              className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                                formData.userGroups.includes(group.code)
                                  ? 'bg-blue-50 border-2 border-blue-200'
                                  : 'border-2 border-transparent hover:bg-gray-50 hover:border-gray-200'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.userGroups.includes(group.code)}
                                onChange={() => toggleUserGroup(group.code)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <div className="ml-3 flex-1">
                                <span className="text-sm font-medium text-gray-900">
                                {getLocalizedText(group.description, locale)}
                              </span>
                            </div>
                            {formData.userGroups.includes(group.code) && (
                              <span className="text-blue-600 font-bold">✓</span>
                            )}
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('menusPage.menuForm.status')}</h2>
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
                    {t('menusPage.menuForm.active')}
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isRoot"
                    checked={formData.isRoot}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      isRoot: e.target.checked,
                      parentMenuCode: e.target.checked ? '' : formData.parentMenuCode
                    })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isRoot" className="text-sm font-medium text-gray-700">
                    {t('menusPage.menuForm.rootMenu')}
                  </label>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('menusPage.menuForm.actions')}</h2>
              <div className="space-y-3">
                <Button 
                  onClick={handleSave} 
                  fullWidth 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? t('menusPage.menuForm.saving') : t('menusPage.menuForm.save')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push(menuType === 'ADMIN_PANEL' ? '/admin/menus/admin' : '/admin/menus/public')} 
                  fullWidth
                  disabled={loading}
                >
                  <X className="w-4 h-4 mr-2" />
                  {t('menusPage.menuForm.cancel')}
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
