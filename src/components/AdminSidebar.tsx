'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, Settings, Image, FolderTree, Package, Users, BookOpen, FileText, MessageSquare, Home, Shield, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useState, useEffect } from 'react';

const menuGroups = [
  {
    title: '',
    items: [
      { icon: LayoutDashboard, labelKey: 'admin.dashboard', path: '/admin' }
    ]
  },
  {
    title: 'İçerik Yönetimi',
    items: [
      { icon: Settings, labelKey: 'admin.header', path: '/admin/header' },
      { icon: Image, labelKey: 'admin.banners', path: '/admin/banners' },
      { icon: FolderTree, labelKey: 'admin.categories', path: '/admin/categories' },
      { icon: Package, labelKey: 'admin.products', path: '/admin/products' },
      { icon: BookOpen, labelKey: 'admin.stories', path: '/admin/stories' },
      { icon: Users, labelKey: 'admin.references', path: '/admin/references' },
      { icon: Users, labelKey: 'admin.partners', path: '/admin/partners' },
      { icon: FileText, labelKey: 'admin.documents', path: '/admin/documents' },
      { icon: FolderTree, labelKey: 'admin.sectors', path: '/admin/sectors' }
    ]
  },
  {
    title: 'Form & İletişim',
    items: [
      { icon: MessageSquare, labelKey: 'admin.forms', path: '/admin/forms' },
      { icon: FileText, labelKey: 'admin.kvkk', path: '/admin/kvkk' }
    ]
  },
  {
    title: 'Sistem',
    items: [
      { icon: Shield, labelKey: 'admin.users', path: '/admin/users', permission: 'manage_users' as const }
    ]
  }
];

export default function AdminSidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, hasPermission, logout } = useAuthStore();
  const [openGroups, setOpenGroups] = useState<number[]>([]);

  // Aktif grubu otomatik aç
  useEffect(() => {
    menuGroups.forEach((group, index) => {
      const hasActiveItem = group.items.some(item => 
        pathname === item.path || (item.path !== '/admin' && pathname?.startsWith(item.path + '/'))
      );
      if (hasActiveItem && !openGroups.includes(index)) {
        setOpenGroups(prev => [...prev, index]);
      }
    });
  }, [pathname]);

  const toggleGroup = (index: number) => {
    setOpenGroups(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen sticky top-0 flex flex-col">
      <div className="p-4 flex-1 overflow-y-auto">
        <Link href="/admin" className="block mb-8">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </Link>

        {currentUser && (
          <div className="mb-6 p-3 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-400">Hoş geldiniz</p>
            <p className="font-semibold">{currentUser.username}</p>
          </div>
        )}

        <nav className="space-y-2">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {group.title && (
                <button
                  onClick={() => toggleGroup(groupIndex)}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-200 transition-colors"
                >
                  <span>{group.title}</span>
                  {openGroups.includes(groupIndex) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}
              
              {(openGroups.includes(groupIndex) || !group.title) && (
                <div className="space-y-1 mt-1">
                  {group.items.map((item) => {
                    // Check permission if required
                    if ('permission' in item && item.permission && !hasPermission(item.permission)) {
                      return null;
                    }

                    const Icon = item.icon;
                    // Daha iyi aktif kontrol - tam eşleşme veya alt sayfa kontrolü
                    const isActive = pathname === item.path || 
                                    (item.path !== '/admin' && pathname?.startsWith(item.path + '/'));

                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-blue-900 text-white shadow-lg'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{item.labelKey === 'Partnerler' ? item.labelKey : t(item.labelKey)}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
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
