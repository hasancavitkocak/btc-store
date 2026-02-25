'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { LayoutDashboard, Settings, Image, FolderTree, Package, Users, BookOpen, FileText, MessageSquare, Home, LogOut, ChevronDown, ChevronRight, Phone, Mail, Shield, LucideIcon, Edit, Trash2, Plus, Eye, Save, Upload, Download, Search, Filter, Calendar, Clock, CheckCircle, XCircle, AlertTriangle, User, Lock, Key, Globe, Database, Server, Cloud, Activity, BarChart, PieChart, TrendingUp, Award, Target, Briefcase } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { MenuLinkItemData, LocalizeData } from '@/types/menu';

// Icon mapping - backend'den gelen icon string'ini Lucide icon'a çevir
const iconMap: Record<string, LucideIcon> = {
  'LayoutDashboard': LayoutDashboard,
  'Settings': Settings,
  'Image': Image,
  'FolderTree': FolderTree,
  'Package': Package,
  'Users': Users,
  'BookOpen': BookOpen,
  'FileText': FileText,
  'MessageSquare': MessageSquare,
  'Phone': Phone,
  'Mail': Mail,
  'Shield': Shield,
  'Edit': Edit,
  'Trash2': Trash2,
  'Plus': Plus,
  'Eye': Eye,
  'Save': Save,
  'Upload': Upload,
  'Download': Download,
  'Search': Search,
  'Filter': Filter,
  'Calendar': Calendar,
  'Clock': Clock,
  'CheckCircle': CheckCircle,
  'XCircle': XCircle,
  'AlertTriangle': AlertTriangle,
  'User': User,
  'Lock': Lock,
  'Key': Key,
  'Globe': Globe,
  'Database': Database,
  'Server': Server,
  'Cloud': Cloud,
  'Activity': Activity,
  'BarChart': BarChart,
  'PieChart': PieChart,
  'TrendingUp': TrendingUp,
  'Award': Award,
  'Target': Target,
  'Briefcase': Briefcase,
};

const getIcon = (iconName?: string): LucideIcon => {
  if (!iconName) return Settings;
  return iconMap[iconName] || Settings;
};

// URL mapping - backend'den URL gelmezse code'a göre URL oluştur
const urlMap: Record<string, string> = {
  'dashboard': '/admin',
  'product_management': '/admin/products',
  'category_management': '/admin/categories',
  'sectors': '/admin/sectors',
  'documents': '/admin/documents',
  'banner_management': '/admin/banners',
  'success_stories': '/admin/stories',
  'reference_management': '/admin/references',
  'partners': '/admin/partners',
  'call_requests': '/admin/call-requests',
  'all_calls': '/admin/call-requests',
  'my_tasks': '/admin/call-requests/my-requests',
  'data_privacy_compliance': '/admin/legal-documents',
  'email_templates': '/admin/email-templates',
  'site_configurations': '/admin/site-configuration',
  'dashboard_modules': '/admin/dashboard-modules',
  'menu_management': '/admin/menus',
  'admin_menus': '/admin/menus/admin',
  'public_menus': '/admin/menus/public',
  'parameters': '/admin/parameters',
  'user_management': '/admin/users',
  'users': '/admin/users',
  'roles': '/admin/user-groups',
  'permissions': '/admin/user-roles',
};

const getMenuUrl = (menu: MenuLinkItemData): string => {
  return menu.url || urlMap[menu.code] || '#';
};

export default function AdminSidebar() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.currentUser);
  const hasUserGroup = useAuthStore((state) => state.hasUserGroup);
  const logout = useAuthStore((state) => state.logout);
  
  // Kullanıcının dilini auth store'dan al, yoksa locale kullan
  const userLanguage = currentUser?.language || locale;
  
  const [menus, setMenus] = useState<MenuLinkItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSubMenus, setOpenSubMenus] = useState<string[]>([]);

  // Menüleri servisten çek
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getMenusByType('ADMIN_PANEL');
        
        if (response.status === 'SUCCESS' && response.data) {
          // Backend'den gelen data ServiceResponseData içinde wrap edilmiş
          // response.data.data içinde asıl menü array'i var
          const actualData = response.data.data || response.data;
          const menuData = Array.isArray(actualData) ? actualData : [];
          console.log('Menüler yüklendi:', menuData.length, 'adet menü');
          setMenus(menuData);
        } else {
          console.error('Menüler yüklenemedi:', response.errorMessage);
          setMenus([]);
        }
      } catch (error) {
        console.error('Menü yükleme hatası:', error);
        setMenus([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchMenus();
    }
  }, [currentUser]);

  // Aktif menüyü otomatik aç
  useEffect(() => {
    if (menus.length === 0) return;

    // Alt menüleri otomatik aç
    menus.forEach(menu => {
      if (menu.subMenuLinkItems && menu.subMenuLinkItems.length > 0) {
        const hasActiveSubItem = menu.subMenuLinkItems.some((subItem) => {
          const subUrl = getMenuUrl(subItem);
          return pathname === subUrl || pathname?.startsWith(subUrl + '/');
        });
        if (hasActiveSubItem && !openSubMenus.includes(menu.code)) {
          setOpenSubMenus(prev => [...prev, menu.code]);
        }
      }
    });
  }, [pathname, menus]);

  const toggleSubMenu = (code: string) => {
    setOpenSubMenus(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  // Kullanıcının menüye erişim yetkisi var mı kontrol et
  const hasMenuAccess = (menu: MenuLinkItemData): boolean => {
    if (!menu.userGroups || menu.userGroups.length === 0) return true;
    
    return menu.userGroups.some(group => hasUserGroup(group.code));
  };

  // Menü adını kullanıcının diline göre al
  const getMenuName = (name: LocalizeData): string => {
    if (!name) return '';
    
    // taskStep alanını çıkar
    const { taskStep, ...translations } = name;
    
    // Kullanıcının diline göre çeviriyi al
    const translation = translations[userLanguage] || translations['tr'] || translations['en'] || '';
    return typeof translation === 'string' ? translation : '';
  };

  // Root menüleri filtrele ve sırala
  const rootMenus = Array.isArray(menus)
    ? menus
        .filter(menu => menu.isRoot && menu.active && hasMenuAccess(menu))
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    : [];

  if (loading) {
    return (
      <aside className="w-64 bg-gray-900 text-white h-screen sticky top-0 flex items-center justify-center">
        <div className="text-gray-400">Yükleniyor...</div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen sticky top-0 flex flex-col">
      <div className="p-4 flex-1 overflow-y-auto">
        <Link href="/admin" className="block mb-8">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </Link>

        {currentUser && (
          <div className="mb-6 p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              {currentUser.picture && (
                <img 
                  src={currentUser.picture} 
                  alt={`${currentUser.firstName} ${currentUser.lastName}`}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-400">Hoş geldiniz</p>
                <p className="font-semibold truncate">
                  {currentUser.firstName} {currentUser.lastName}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500">@{currentUser.username}</p>
          </div>
        )}

        <nav className="space-y-2">
          {rootMenus.map((menu) => {
            const Icon = getIcon(menu.icon);
            const menuUrl = getMenuUrl(menu);
            const hasSubItems = menu.subMenuLinkItems && menu.subMenuLinkItems.length > 0;
            
            // Alt menüleri filtrele ve sırala
            const subMenus = hasSubItems 
              ? menu.subMenuLinkItems
                  .filter(sub => sub.active && hasMenuAccess(sub))
                  .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
              : [];
            
            // Ana item veya alt itemlerden biri aktif mi? (recursive check)
            const checkIfActive = (items: MenuLinkItemData[]): boolean => {
              return items.some(item => {
                const url = getMenuUrl(item);
                const isItemActive = pathname === url || pathname?.startsWith(url + '/');
                if (isItemActive) return true;
                if (item.subMenuLinkItems && item.subMenuLinkItems.length > 0) {
                  return checkIfActive(item.subMenuLinkItems);
                }
                return false;
              });
            };
            
            const isActive = pathname === menuUrl || 
                            (menuUrl !== '/admin' && pathname?.startsWith(menuUrl + '/'));
            const hasActiveSubItem = checkIfActive(subMenus);
            const isSubMenuOpen = openSubMenus.includes(menu.code);

            // Recursive render function for nested menus
            const renderSubMenu = (items: MenuLinkItemData[], level: number = 1) => {
              return items.map((subItem) => {
                const subUrl = getMenuUrl(subItem);
                const isSubActive = pathname === subUrl || pathname?.startsWith(subUrl + '/');
                const SubIcon = getIcon(subItem.icon);
                const hasNestedItems = subItem.subMenuLinkItems && subItem.subMenuLinkItems.length > 0;
                
                const nestedItems = hasNestedItems
                  ? subItem.subMenuLinkItems!
                      .filter(nested => nested.active && hasMenuAccess(nested))
                      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                  : [];
                
                const isNestedOpen = openSubMenus.includes(subItem.code);
                const hasActiveNested = hasNestedItems && checkIfActive(nestedItems);

                return (
                  <div key={subItem.code}>
                    {hasNestedItems && nestedItems.length > 0 ? (
                      <>
                        <button
                          onClick={() => toggleSubMenu(subItem.code)}
                          className={`w-full flex items-center justify-between gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                            isSubActive || hasActiveNested
                              ? 'bg-blue-800 text-white'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <SubIcon className="w-3 h-3" />
                            <span>{getMenuName(subItem.name)}</span>
                          </div>
                          {isNestedOpen ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </button>
                        
                        {isNestedOpen && (
                          <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-700 pl-2">
                            {renderSubMenu(nestedItems, level + 1)}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        href={subUrl}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                          isSubActive
                            ? 'bg-blue-800 text-white'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <SubIcon className="w-3 h-3" />
                        <span>{getMenuName(subItem.name)}</span>
                      </Link>
                    )}
                  </div>
                );
              });
            };

            return (
              <div key={menu.code}>
                {hasSubItems && subMenus.length > 0 ? (
                  <>
                    <button
                      onClick={() => toggleSubMenu(menu.code)}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                        isActive || hasActiveSubItem
                          ? 'bg-blue-900 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{getMenuName(menu.name)}</span>
                      </div>
                      {isSubMenuOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    
                    {isSubMenuOpen && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-700 pl-2">
                        {renderSubMenu(subMenus)}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={menuUrl}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-900 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{getMenuName(menu.name)}</span>
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-700 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>Siteye Dön</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
}
