'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface TreeNode {
  code: string;
  name: { tr: string; en: string };
  icon?: string;
  level: number;
  isRoot: boolean;
  parentMenuCode?: string;
  children?: TreeNode[];
}

interface TreeSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: TreeNode[];
  placeholder?: string;
  label?: string;
}

export default function TreeSelect({ value, onChange, options, placeholder = 'Seçiniz...', label }: TreeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
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

  const toggleNode = (code: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(code)) {
      newExpanded.delete(code);
    } else {
      newExpanded.add(code);
    }
    setExpandedNodes(newExpanded);
  };

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getSelectedLabel = () => {
    if (!value) return null;
    const findNode = (nodes: TreeNode[]): TreeNode | null => {
      for (const node of nodes) {
        if (node.code === value) return node;
        if (node.children) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    const selected = findNode(options);
    if (!selected) return null;
    
    return (
      <div className="flex items-center gap-2">
        {selected.icon && (
          <div className="flex items-center justify-center">
            {renderIcon(selected.icon)}
          </div>
        )}
        <span>{selected.name.tr || selected.name.en}</span>
      </div>
    );
  };

  const filterNodes = (nodes: TreeNode[], term: string): TreeNode[] => {
    if (!term) return nodes;
    const filtered: TreeNode[] = [];
    
    for (const node of nodes) {
      const matches = 
        node.name.tr.toLowerCase().includes(term.toLowerCase()) ||
        node.name.en.toLowerCase().includes(term.toLowerCase());
      
      const filteredChildren = node.children ? filterNodes(node.children, term) : [];
      
      if (matches || filteredChildren.length > 0) {
        filtered.push({
          ...node,
          children: filteredChildren
        });
        // Eğer arama varsa ve eşleşme varsa, node'u aç
        if (term && (matches || filteredChildren.length > 0)) {
          expandedNodes.add(node.code);
        }
      }
    }
    
    return filtered;
  };

  const renderIcon = (iconValue?: string) => {
    console.log('TreeSelect renderIcon called with:', iconValue);
    
    if (!iconValue) return null;

    // Emoji ise direkt göster
    if (/\p{Emoji}/u.test(iconValue)) {
      console.log('TreeSelect: Detected as emoji');
      return <span className="text-lg">{iconValue}</span>;
    }
    
    // Lucide icon ise component olarak render et
    const IconComponent = (LucideIcons as any)[iconValue];
    if (IconComponent) {
      console.log('TreeSelect: Detected as Lucide icon');
      return <IconComponent className="w-4 h-4" />;
    }
    
    console.log('TreeSelect: Icon not found, returning null');
    return null;
  };

  const renderNode = (node: TreeNode) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.code);
    const isSelected = value === node.code;
    const indent = node.level * 20;

    return (
      <div key={node.code}>
        <div
          className={`flex items-center px-3 py-2 cursor-pointer transition-colors ${
            isSelected 
              ? 'bg-blue-100 text-blue-700 font-medium' 
              : 'hover:bg-gray-100'
          }`}
          style={{ paddingLeft: `${indent + 12}px` }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.code);
              }}
              className="mr-1 p-0.5 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}
          {!hasChildren && <span className="w-5" />}
          
          <div
            onClick={() => handleSelect(node.code)}
            className="flex-1 flex items-center gap-2"
          >
            {node.icon && (
              <div className="flex items-center justify-center w-5 h-5">
                {renderIcon(node.icon)}
              </div>
            )}
            <span className="text-sm">
              {node.name?.tr || node.name?.en || 'İsimsiz'}
            </span>
            {isSelected && (
              <span className="ml-auto text-blue-600">✓</span>
            )}
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  const filteredOptions = filterNodes(options, searchTerm);

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
        {value ? (
          <span className="text-gray-900">{getSelectedLabel()}</span>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
          {/* Search Bar */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ara..."
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                onClick={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Clear Selection */}
          {value && (
            <div className="p-2 border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => handleSelect('')}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
              >
                <span className="text-lg">🏠</span>
                <span>Ana Menü (Üst Seviye)</span>
              </button>
            </div>
          )}

          {/* Tree Options */}
          <div className="overflow-y-auto max-h-80">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Sonuç bulunamadı
              </div>
            ) : (
              filteredOptions.map(node => renderNode(node))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
