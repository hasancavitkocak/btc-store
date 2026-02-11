'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, Settings, Image, FolderTree, Package, Users, BookOpen, FileText, MessageSquare, Home } from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, labelKey: 'admin.dashboard', path: '/admin' },
  { icon: Settings, labelKey: 'admin.header', path: '/admin/header' },
  { icon: Image, labelKey: 'admin.banners', path: '/admin/banners' },
  { icon: FolderTree, labelKey: 'admin.categories', path: '/admin/categories' },
  { icon: Package, labelKey: 'admin.products', path: '/admin/products' },
  { icon: Users, labelKey: 'admin.references', path: '/admin/references' },
  { icon: BookOpen, labelKey: 'admin.stories', path: '/admin/stories' },
  { icon: FileText, labelKey: 'admin.kvkk', path: '/admin/kvkk' },
  { icon: MessageSquare, labelKey: 'admin.forms', path: '/admin/forms' }
];

export default function AdminSidebar() {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4 sticky top-0">
      <Link href="/admin" className="block mb-8">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
      </Link>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/');

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}

        <div className="pt-4 border-t border-gray-700">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Back to Website</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}
