'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import Button from './Button';

interface MultiFileUploadProps {
  files: string[];
  onChange: (files: string[]) => void;
  label?: string;
  accept?: string;
  maxFiles?: number;
}

export default function MultiFileUpload({ 
  files, 
  onChange, 
  label = 'Dosyalar Yükle', 
  accept,
  maxFiles = 10
}: MultiFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList) => {
    const newFiles: string[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      // Gerçek uygulamada burada dosya sunucuya yüklenecek
      const fileUrl = `/documents/${file.name}`;
      if (!files.includes(fileUrl)) {
        newFiles.push(fileUrl);
      }
    }
    
    const updatedFiles = [...files, ...newFiles].slice(0, maxFiles);
    onChange(updatedFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
    // Input'u temizle ki aynı dosya tekrar seçilebilsin
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    onChange(updatedFiles);
  };

  const getFileName = (url: string) => {
    return url.split('/').pop() || url;
  };

  const getFileExtension = (url: string) => {
    return url.split('.').pop()?.toLowerCase() || '';
  };

  const getFileIcon = (url: string) => {
    const ext = getFileExtension(url);
    // Farklı dosya tipleri için farklı renkler
    if (ext === 'pdf') return 'text-red-600';
    if (['doc', 'docx'].includes(ext)) return 'text-blue-600';
    if (['xls', 'xlsx'].includes(ext)) return 'text-green-600';
    if (['ppt', 'pptx'].includes(ext)) return 'text-orange-600';
    return 'text-gray-600';
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      {/* Yüklü Dosyalar */}
      {files.length > 0 && (
        <div className="space-y-2 mb-4">
          {files.map((file, index) => (
            <div 
              key={index} 
              className="border border-gray-300 rounded-lg p-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className={`w-6 h-6 flex-shrink-0 ${getFileIcon(file)}`} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{getFileName(file)}</p>
                  <p className="text-xs text-gray-500 truncate">{file}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRemove(index)}
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white flex-shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Dosya Yükleme Alanı */}
      {files.length < maxFiles && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            accept={accept}
            multiple
            className="hidden"
          />
          
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">
            Dosyaları sürükleyip bırakın veya
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            Dosya Seç
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            {files.length} / {maxFiles} dosya yüklendi
          </p>
          {accept && (
            <p className="text-xs text-gray-500 mt-1">
              Desteklenen formatlar: {accept}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
