'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

// Popüler emojiler
const POPULAR_EMOJIS = [
  '📊', '📝', '🖼️', '📁', '📦', '⚙️', '👥', '🔧',
  '🏠', '🌐', '📱', '💼', '📈', '🎯', '🔔', '⭐',
  '🚀', '💡', '🔒', '🔑', '📧', '📞', '🌟', '🎨',
  '📅', '🕐', '💰', '🛒', '🎁', '📢', '🔍', '❤️'
];

// Popüler Lucide iconları
const POPULAR_LUCIDE_ICONS = [
  'Home', 'Settings', 'User', 'Users', 'Menu', 'Search',
  'Bell', 'Mail', 'Phone', 'Calendar', 'Clock', 'Star',
  'Heart', 'Bookmark', 'Tag', 'Folder', 'File', 'Image',
  'Video', 'Music', 'Download', 'Upload', 'Share', 'Link',
  'Lock', 'Unlock', 'Eye', 'EyeOff', 'Edit', 'Trash',
  'Plus', 'Minus', 'Check', 'X', 'ChevronRight', 'ChevronLeft',
  'ArrowRight', 'ArrowLeft', 'Package', 'ShoppingCart', 'CreditCard',
  'DollarSign', 'TrendingUp', 'BarChart', 'PieChart', 'Activity'
];

export default function IconPicker({ value, onChange, label }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'emoji' | 'lucide'>('emoji');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredEmojis = POPULAR_EMOJIS.filter(emoji => 
    !searchTerm || emoji.includes(searchTerm)
  );

  const filteredLucideIcons = POPULAR_LUCIDE_ICONS.filter(iconName =>
    iconName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (icon: string) => {
    onChange(icon);
    setIsOpen(false);
    setSearchTerm('');
  };

  const renderIcon = (iconValue: string) => {
    // Emoji ise direkt göster
    if (/\p{Emoji}/u.test(iconValue)) {
      return <span className="text-2xl">{iconValue}</span>;
    }
    
    // Lucide icon ise component olarak render et
    const IconComponent = (LucideIcons as any)[iconValue];
    if (IconComponent) {
      return <IconComponent className="w-6 h-6" />;
    }
    
    return <span className="text-sm text-gray-400">?</span>;
  };

  return (
    <div ref={dropdownRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white flex items-center justify-between hover:border-gray-400 transition-colors"
      >
        <div className="flex items-center gap-3">
          {value ? (
            <>
              <div className="w-8 h-8 flex items-center justify-center">
                {renderIcon(value)}
              </div>
              <span className="text-sm text-gray-600">{value}</span>
            </>
          ) : (
            <span className="text-gray-500">İkon seçin...</span>
          )}
        </div>
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('emoji')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'emoji'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              😀 Emoji
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('lucide')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'lucide'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              🎨 İkonlar
            </button>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={activeTab === 'emoji' ? 'Emoji ara...' : 'İkon ara...'}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Icon Grid */}
          <div className="p-3 max-h-64 overflow-y-auto">
            {activeTab === 'emoji' ? (
              <div className="grid grid-cols-8 gap-2">
                {filteredEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSelect(emoji)}
                    className={`p-2 rounded hover:bg-blue-50 transition-colors flex items-center justify-center ${
                      value === emoji ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                    }`}
                    title={emoji}
                  >
                    <span className="text-2xl">{emoji}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-2">
                {filteredLucideIcons.map((iconName) => {
                  const IconComponent = (LucideIcons as any)[iconName];
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => handleSelect(iconName)}
                      className={`p-3 rounded hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-1 ${
                        value === iconName ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                      }`}
                      title={iconName}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="text-xs text-gray-600 truncate w-full text-center">
                        {iconName}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            
            {((activeTab === 'emoji' && filteredEmojis.length === 0) ||
              (activeTab === 'lucide' && filteredLucideIcons.length === 0)) && (
              <p className="text-sm text-gray-500 text-center py-4">
                Sonuç bulunamadı
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
