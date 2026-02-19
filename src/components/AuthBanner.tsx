'use client';

import { usePublicAuthStore } from '@/store/usePublicAuthStore';
import { LogOut, User } from 'lucide-react';

export default function AuthBanner() {
  const { isAuthenticated, currentUser, logout } = usePublicAuthStore();

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  const displayName = currentUser.firstName && currentUser.lastName
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : currentUser.username;

  return (
    <div className="bg-gray-100 border-b border-gray-200">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between py-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-700">
            <User className="w-3.5 h-3.5" />
            <span className="font-medium">Yetkili Modu</span>
            <span className="text-gray-400">•</span>
            <span>{displayName}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Çıkış</span>
          </button>
        </div>
      </div>
    </div>
  );
}
