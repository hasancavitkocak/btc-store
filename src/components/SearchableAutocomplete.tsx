'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, ChevronDown, Loader2 } from 'lucide-react';
import { searchService, SearchFilter } from '@/services/search.service';
import Button from './Button';

interface SearchableAutocompleteProps<T> {
  itemType: string;
  searchField: string;
  locale?: string;
  selectedItems: T[];
  onItemsChange: (items: T[]) => void;
  getItemKey: (item: T) => string;
  getItemLabel: (item: T) => string;
  placeholder?: string;
  label?: string;
  multiple?: boolean;
  disabled?: boolean;
  additionalFilters?: SearchFilter[];
}

export default function SearchableAutocomplete<T = any>({
  itemType,
  searchField,
  locale = 'tr',
  selectedItems,
  onItemsChange,
  getItemKey,
  getItemLabel,
  placeholder = 'Ara...',
  label,
  multiple = true,
  disabled = false,
  additionalFilters = [],
}: SearchableAutocompleteProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load items
  const loadItems = useCallback(async (pageNum: number, search: string, append: boolean = false) => {
    try {
      setLoading(true);
      
      const filters: SearchFilter[] = [...additionalFilters];
      
      if (search.trim()) {
        filters.push({
          name: searchField,
          locale: locale,
          value: search.trim(),
          searchCondition: 'LIKE'
        });
      }

      const response = await searchService.search<T>(
        itemType,
        { filters },
        pageNum
      );

      if (response.status === 'SUCCESS' && response.data) {
        // Backend response iki kez wrap edilmiş: response.data.data içinde gerçek PageableResponse var
        const wrappedData = response.data as any;
        const pageData = wrappedData.data || wrappedData;
        const content = pageData.content || [];
        
        if (append) {
          setItems(prev => [...prev, ...content]);
        } else {
          setItems(content);
        }
        
        setHasMore(pageData.totalPages > pageNum);
      }
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  }, [itemType, searchField, locale, additionalFilters]);

  // Initial load on open
  useEffect(() => {
    if (isOpen && items.length === 0) {
      loadItems(1, '');
    }
  }, [isOpen, items.length, loadItems]);

  // Search with debounce
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      setPage(1);
      loadItems(1, searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, isOpen, loadItems]);

  // Infinite scroll
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      
      if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loading) {
        const nextPage = page + 1;
        setPage(nextPage);
        loadItems(nextPage, searchTerm, true);
      }
    };

    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [page, hasMore, loading, searchTerm, loadItems]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleItem = (item: T) => {
    const itemKey = getItemKey(item);
    const exists = selectedItems.some(i => getItemKey(i) === itemKey);

    if (multiple) {
      if (exists) {
        onItemsChange(selectedItems.filter(i => getItemKey(i) !== itemKey));
      } else {
        onItemsChange([...selectedItems, item]);
      }
    } else {
      if (exists) {
        onItemsChange([]);
      } else {
        onItemsChange([item]);
      }
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const removeItem = (itemKey: string) => {
    onItemsChange(selectedItems.filter(i => getItemKey(i) !== itemKey));
  };

  const filteredItems = items.filter(
    item => !selectedItems.some(selected => getItemKey(selected) === getItemKey(item))
  );

  return (
    <div ref={dropdownRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-2 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between hover:border-gray-400 transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <span className={selectedItems.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
          {selectedItems.length > 0
            ? multiple
              ? `${selectedItems.length} öğe seçildi`
              : getItemLabel(selectedItems[0])
            : placeholder}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                autoFocus
              />
            </div>
          </div>

          {/* Items List */}
          <div ref={scrollRef} className="overflow-y-auto max-h-64">
            {loading && items.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                {searchTerm ? 'Sonuç bulunamadı' : 'Öğe bulunamadı'}
              </div>
            ) : (
              <>
                {filteredItems.map((item) => {
                  const itemKey = getItemKey(item);
                  const isSelected = selectedItems.some(i => getItemKey(i) === itemKey);

                  return (
                    <button
                      key={itemKey}
                      type="button"
                      onClick={() => toggleItem(item)}
                      className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0 ${
                        isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                      }`}
                    >
                      {multiple && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                        />
                      )}
                      <span className="text-sm flex-1">{getItemLabel(item)}</span>
                    </button>
                  );
                })}
                {loading && (
                  <div className="flex items-center justify-center py-3 border-t border-gray-200">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Selected Items */}
      {selectedItems.length > 0 && multiple && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedItems.map((item) => {
            const itemKey = getItemKey(item);
            return (
              <span
                key={itemKey}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm"
              >
                {getItemLabel(item)}
                <button
                  type="button"
                  onClick={() => removeItem(itemKey)}
                  className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  disabled={disabled}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
