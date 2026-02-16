'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, ArrowLeft, Star, Plus } from 'lucide-react';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Toast from '../../components/Toast';
import ImageUpload from '../../components/ImageUpload';
import RichTextEditor from '../../components/RichTextEditor';
import ImageLightbox from '../../components/ImageLightbox';
import { productService } from '../../services/product.service';
import { categoryService, userService } from '../../services/admin.service';

interface ProductFormProps {
  productId?: string;
}

interface Category {
  code: string;
  name: { tr: string; en: string };
  active: boolean;
}

interface User {
  code: string;
  username: string;
  email: string;
  picture?: { absolutePath: string };
  active: boolean;
}

export default function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{ code: string; absolutePath: string }>>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const [lightbox, setLightbox] = useState<{ isOpen: boolean; imageUrl: string }>({
    isOpen: false,
    imageUrl: ''
  });
  
  const isEditing = !!productId;
  const [activeDescTab, setActiveDescTab] = useState<'tr' | 'en' | 'de' | 'fr' | 'es' | 'it'>('tr');
  const [featureInput, setFeatureInput] = useState('');

  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    code: '',
    name: { tr: '', en: '', de: '', fr: '', es: '', it: '' },
    description: { tr: '', en: '', de: '', fr: '', es: '', it: '' },
    shortDescription: { tr: '', en: '', de: '', fr: '', es: '', it: '' },
    categories: [] as Array<{ code: string; name: { tr: string; en: string }; active: boolean }>,
    responsibleUsers: [] as Array<{ code: string; username: string; email: string; picture?: { absolutePath: string } }>,
    features: [] as string[],
    active: true
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const toggleField = (fieldName: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(fieldName)) {
      newExpanded.delete(fieldName);
    } else {
      newExpanded.add(fieldName);
    }
    setExpandedFields(newExpanded);
  };

  useEffect(() => {
    loadCategories();
    loadUsers();
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isCategoryDropdownOpen && !target.closest('.category-dropdown-container')) {
        setIsCategoryDropdownOpen(false);
        setCategorySearchTerm('');
      }
      if (isUserDropdownOpen && !target.closest('.user-dropdown-container')) {
        setIsUserDropdownOpen(false);
        setUserSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCategoryDropdownOpen, isUserDropdownOpen]);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getActive();
      if (response.status === 'SUCCESS' && response.data) {
        const categoriesData = (response.data as any).data || response.data;
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userService.getAll();
      if (response.status === 'SUCCESS' && response.data) {
        const usersData = (response.data as any).data || response.data;
        setUsers(Array.isArray(usersData) ? usersData : []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getByCode(productId!);
      
      if (response.status === 'SUCCESS' && response.data) {
        const productData = (response.data as any).data || response.data;
        
        setFormData({
          id: productData.id,
          code: productData.code,
          name: productData.name || { tr: '', en: '', de: '', fr: '', es: '', it: '' },
          description: productData.description || { tr: '', en: '', de: '', fr: '', es: '', it: '' },
          shortDescription: productData.shortDescription || { tr: '', en: '', de: '', fr: '', es: '', it: '' },
          categories: productData.categories || [],
          responsibleUsers: productData.responsibleUsers || [],
          features: productData.features || [],
          active: productData.active ?? true
        });
        
        if (productData.images && productData.images.length > 0) {
          const imagePaths = productData.images.map((img: any) => img.absolutePath);
          setImageFiles(imagePaths);
          setExistingImages(productData.images);
          
          // Find main image index
          if (productData.mainImage) {
            const mainIndex = productData.images.findIndex((img: any) => img.code === productData.mainImage.code);
            if (mainIndex !== -1) {
              setMainImageIndex(mainIndex);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
      setToast({ message: 'Ürün yüklenirken hata oluştu', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImagesChange = (images: string[]) => {
    setImageFiles(images);
    
    const newFiles: File[] = [];
    const promises = images
      .filter(img => img.startsWith('data:'))
      .map(img => 
        fetch(img)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], `product-image-${Date.now()}.jpg`, { type: 'image/jpeg' });
            newFiles.push(file);
          })
      );
    
    Promise.all(promises).then(() => {
      setNewImageFiles(newFiles);
    });
    
    // Reset main image if it's out of bounds
    if (mainImageIndex >= images.length) {
      setMainImageIndex(0);
    }
  };

  const toggleCategory = (category: Category) => {
    const exists = formData.categories.some(c => c.code === category.code);
    if (exists) {
      setFormData({
        ...formData,
        categories: formData.categories.filter(c => c.code !== category.code)
      });
    } else {
      setFormData({
        ...formData,
        categories: [...formData.categories, category]
      });
    }
  };

  const toggleUser = (user: User) => {
    const exists = formData.responsibleUsers.some(u => u.code === user.code);
    if (exists) {
      setFormData({
        ...formData,
        responsibleUsers: formData.responsibleUsers.filter(u => u.code !== user.code)
      });
    } else {
      const { active: _active, ...userWithoutActive } = user;
      setFormData({
        ...formData,
        responsibleUsers: [...formData.responsibleUsers, userWithoutActive]
      });
    }
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()]
      });
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const handleFeatureKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFeature();
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...imageFiles];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);

    // Also reorder existing images array
    const newExistingImages = [...existingImages];
    const draggedExisting = newExistingImages[draggedIndex];
    newExistingImages.splice(draggedIndex, 1);
    newExistingImages.splice(index, 0, draggedExisting);

    // Update main image index if needed
    if (mainImageIndex === draggedIndex) {
      setMainImageIndex(index);
    } else if (draggedIndex < mainImageIndex && index >= mainImageIndex) {
      setMainImageIndex(mainImageIndex - 1);
    } else if (draggedIndex > mainImageIndex && index <= mainImageIndex) {
      setMainImageIndex(mainImageIndex + 1);
    }

    setImageFiles(newImages);
    setExistingImages(newExistingImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Determine image order
      let imageCodesInOrder: string[] | undefined = undefined;
      
      // Always send existing image codes if we're editing (even if empty - to clear images)
      if (isEditing) {
        imageCodesInOrder = existingImages.map(img => img.code);
      }

      const productData = {
        ...(formData.id && { id: formData.id }),
        code: formData.code || undefined,
        name: formData.name,
        description: formData.description,
        shortDescription: formData.shortDescription,
        categories: formData.categories.map(c => ({ code: c.code })),
        responsibleUsers: formData.responsibleUsers.map(u => ({ code: u.code })),
        features: formData.features,
        mainImageIndex: mainImageIndex,
        imageCodesInOrder: imageCodesInOrder,
        active: formData.active
      };

      const response = await productService.save(
        productData, 
        undefined,
        newImageFiles.length > 0 ? newImageFiles : undefined,
        false
      );

      if (response.status === 'ERROR') {
        setToast({ 
          message: response.errorMessage || 'Ürün kaydedilirken hata oluştu', 
          type: 'error' 
        });
        return;
      }

      setToast({ 
        message: isEditing ? 'Ürün güncellendi' : 'Ürün eklendi', 
        type: 'success' 
      });

      setTimeout(() => {
        router.push('/admin/products');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving product:', error);
      setToast({ 
        message: error.message || 'Beklenmeyen bir hata oluştu', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section>
      <Container>
        <div className="mb-8">
          <Button variant="outline" onClick={() => router.push('/admin/products')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isEditing ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Ürün Bilgileri</h2>
              <div className="space-y-4">
                {/* Name - Localized */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Ürün Adı</label>
                    <button type="button" onClick={() => toggleField('name')} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                      <span>Diğer Diller</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">5</span>
                      <span className="text-gray-400">{expandedFields.has('name') ? '▼' : '▶'}</span>
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <Input placeholder="🇹🇷 Türkçe" value={formData.name.tr} onChange={(e) => setFormData({ ...formData, name: { ...formData.name, tr: e.target.value } })} />
                    {expandedFields.has('name') && (
                      <div className="space-y-3 pt-3 border-t border-gray-200">
                        <Input placeholder="🇬🇧 English" value={formData.name.en} onChange={(e) => setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })} />
                        <Input placeholder="🇩🇪 Deutsch" value={formData.name.de} onChange={(e) => setFormData({ ...formData, name: { ...formData.name, de: e.target.value } })} />
                        <Input placeholder="🇫🇷 Français" value={formData.name.fr} onChange={(e) => setFormData({ ...formData, name: { ...formData.name, fr: e.target.value } })} />
                        <Input placeholder="🇪🇸 Español" value={formData.name.es} onChange={(e) => setFormData({ ...formData, name: { ...formData.name, es: e.target.value } })} />
                        <Input placeholder="🇮🇹 Italiano" value={formData.name.it} onChange={(e) => setFormData({ ...formData, name: { ...formData.name, it: e.target.value } })} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Short Description - Localized */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Kısa Açıklama</label>
                    <button type="button" onClick={() => toggleField('shortDescription')} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                      <span>Diğer Diller</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">5</span>
                      <span className="text-gray-400">{expandedFields.has('shortDescription') ? '▼' : '▶'}</span>
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <Input placeholder="🇹🇷 Türkçe" value={formData.shortDescription.tr} onChange={(e) => setFormData({ ...formData, shortDescription: { ...formData.shortDescription, tr: e.target.value } })} />
                    {expandedFields.has('shortDescription') && (
                      <div className="space-y-3 pt-3 border-t border-gray-200">
                        <Input placeholder="🇬🇧 English" value={formData.shortDescription.en} onChange={(e) => setFormData({ ...formData, shortDescription: { ...formData.shortDescription, en: e.target.value } })} />
                        <Input placeholder="🇩🇪 Deutsch" value={formData.shortDescription.de} onChange={(e) => setFormData({ ...formData, shortDescription: { ...formData.shortDescription, de: e.target.value } })} />
                        <Input placeholder="🇫🇷 Français" value={formData.shortDescription.fr} onChange={(e) => setFormData({ ...formData, shortDescription: { ...formData.shortDescription, fr: e.target.value } })} />
                        <Input placeholder="🇪🇸 Español" value={formData.shortDescription.es} onChange={(e) => setFormData({ ...formData, shortDescription: { ...formData.shortDescription, es: e.target.value } })} />
                        <Input placeholder="🇮🇹 Italiano" value={formData.shortDescription.it} onChange={(e) => setFormData({ ...formData, shortDescription: { ...formData.shortDescription, it: e.target.value } })} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Categories - Multi Select */}
                <div className="relative category-dropdown-container">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategoriler (Çoklu Seçim)</label>
                  <div className="relative">
                    <button type="button" onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)} className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between hover:border-gray-400">
                      <span className={formData.categories.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
                        {formData.categories.length > 0 ? `${formData.categories.length} kategori seçildi` : 'Kategori Seçin'}
                      </span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {isCategoryDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
                        <div className="p-2 border-b border-gray-200">
                          <input type="text" placeholder="Kategori ara..." value={categorySearchTerm} onChange={(e) => setCategorySearchTerm(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm" onClick={(e) => e.stopPropagation()} />
                        </div>
                        <div className="overflow-y-auto max-h-48">
                          {categories.filter(cat => {
                            const searchLower = categorySearchTerm.toLowerCase();
                            return (cat.name.tr?.toLowerCase().includes(searchLower) || cat.name.en?.toLowerCase().includes(searchLower));
                          }).map((category) => (
                            <button key={category.code} type="button" onClick={() => toggleCategory(category)} className={`w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors flex items-center gap-2 ${formData.categories.some(c => c.code === category.code) ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}`}>
                              <input type="checkbox" checked={formData.categories.some(c => c.code === category.code)} onChange={() => {}} className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                              <span className="text-sm">{category.name.tr || category.name.en}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {formData.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.categories.map((cat) => (
                        <span key={cat.code} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {cat.name.tr || cat.name.en}
                          <button type="button" onClick={() => toggleCategory(cat)} className="hover:bg-blue-200 rounded-full p-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Responsible Users - Multi Select with Pictures */}
                <div className="relative user-dropdown-container">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Sorumluları (Çoklu Seçim)</label>
                  <div className="relative">
                    <button type="button" onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between hover:border-gray-400">
                      <span className={formData.responsibleUsers.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
                        {formData.responsibleUsers.length > 0 ? `${formData.responsibleUsers.length} sorumlu seçildi` : 'Sorumlu Seçin'}
                      </span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {isUserDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
                        <div className="p-2 border-b border-gray-200">
                          <input type="text" placeholder="Kullanıcı ara..." value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm" onClick={(e) => e.stopPropagation()} />
                        </div>
                        <div className="overflow-y-auto max-h-48">
                          {users.filter(user => {
                            const searchLower = userSearchTerm.toLowerCase();
                            return (user.username?.toLowerCase().includes(searchLower) || user.email?.toLowerCase().includes(searchLower));
                          }).map((user) => (
                            <button key={user.code} type="button" onClick={() => toggleUser(user)} className={`w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 ${formData.responsibleUsers.some(u => u.code === user.code) ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}`}>
                              <input type="checkbox" checked={formData.responsibleUsers.some(u => u.code === user.code)} onChange={() => {}} className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                              {user.picture?.absolutePath ? (
                                <img src={user.picture.absolutePath} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-semibold">
                                  {user.username.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="text-sm font-medium">{user.username}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {formData.responsibleUsers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.responsibleUsers.map((user) => (
                        <span key={user.code} className="inline-flex items-center gap-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                          {user.picture?.absolutePath ? (
                            <img src={user.picture.absolutePath} alt={user.username} className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-purple-300 flex items-center justify-center text-purple-700 text-xs font-semibold">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {user.username}
                          <button type="button" onClick={() => {
                            setFormData({
                              ...formData,
                              responsibleUsers: formData.responsibleUsers.filter(u => u.code !== user.code)
                            });
                          }} className="hover:bg-purple-200 rounded-full p-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Özellikler</label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} onKeyDown={handleFeatureKeyDown} placeholder="Bir özellik yazın ve Enter'a basın" />
                      <Button type="button" onClick={handleAddFeature} className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                        Ekle
                      </Button>
                    </div>
                    
                    {formData.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {formData.features.map((feature, index) => (
                          <div key={index} className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            <span>{feature}</span>
                            <button type="button" onClick={() => handleRemoveFeature(index)} className="hover:bg-green-200 rounded-full p-0.5 transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {formData.features.length === 0 && (
                      <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg border border-gray-200">
                        Henüz özellik eklenmedi. Yukarıdaki alana yazıp Enter'a basarak özellik ekleyebilirsiniz.
                      </div>
                    )}
                  </div>
                </div>

                {/* Images with Main Image Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ürün Görselleri
                    {imageFiles.length > 0 && <span className="text-xs text-gray-500 ml-2">(Ana görsel için yıldıza tıklayın)</span>}
                  </label>
                  
                  {/* Custom Image Grid with Main Selection */}
                  {imageFiles.length > 0 ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-5 gap-3">
                        {imageFiles.map((img, index) => (
                          <div 
                            key={index} 
                            className="relative group"
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                          >
                            <img 
                              src={img} 
                              alt={`Görsel ${index + 1}`} 
                              className={`w-full h-28 object-cover rounded-lg border-2 transition-all cursor-move ${
                                mainImageIndex === index 
                                  ? 'border-yellow-500 ring-2 ring-yellow-300' 
                                  : 'border-gray-300 group-hover:border-blue-400'
                              } ${draggedIndex === index ? 'opacity-50' : ''}`}
                              onClick={() => setLightbox({ isOpen: true, imageUrl: img })}
                            />
                            
                            {/* Drag Handle Indicator */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <div className="bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-700 flex items-center gap-1">
                                <span className="text-base">⋮⋮</span>
                                <span>Sürükle</span>
                              </div>
                            </div>
                            
                            {/* Star Button for Main Image */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMainImageIndex(index);
                              }}
                              className={`absolute top-2 right-2 p-1.5 rounded-full transition-all z-10 ${
                                mainImageIndex === index
                                  ? 'bg-yellow-500 text-white shadow-lg'
                                  : 'bg-white bg-opacity-80 text-gray-400 hover:bg-yellow-500 hover:text-white opacity-0 group-hover:opacity-100'
                              }`}
                              title={mainImageIndex === index ? 'Ana Görsel' : 'Ana Görsel Yap'}
                            >
                              <Star className={`w-4 h-4 ${mainImageIndex === index ? 'fill-current' : ''}`} />
                            </button>
                            
                            {/* Image Number */}
                            <div className="absolute bottom-2 left-2 bg-gray-900 bg-opacity-75 text-white text-xs px-2 py-0.5 rounded pointer-events-none">
                              {index + 1}
                            </div>
                            
                            {/* Main Image Label */}
                            {mainImageIndex === index && (
                              <div className="absolute bottom-2 right-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded font-semibold pointer-events-none">
                                Ana Görsel
                              </div>
                            )}
                            
                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newImages = imageFiles.filter((_, i) => i !== index);
                                const newExistingImages = existingImages.filter((_, i) => i !== index);
                                
                                // Yeni yüklenen dosyaları da temizle
                                const removedImage = imageFiles[index];
                                if (removedImage.startsWith('data:')) {
                                  // Bu yeni yüklenen bir görsel, newImageFiles'dan da kaldır
                                  const dataImageIndex = imageFiles.slice(0, index).filter(img => img.startsWith('data:')).length;
                                  setNewImageFiles(prev => prev.filter((_, i) => i !== dataImageIndex));
                                }
                                
                                setImageFiles(newImages);
                                setExistingImages(newExistingImages);
                                
                                if (mainImageIndex === index) {
                                  setMainImageIndex(0);
                                } else if (mainImageIndex > index) {
                                  setMainImageIndex(mainImageIndex - 1);
                                }
                              }}
                              className="absolute top-2 left-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                              title="Görseli Sil"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        
                        {/* Add More Images Button */}
                        {imageFiles.length < 10 && (
                          <label className="w-full h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                            <Plus className="w-6 h-6 text-gray-400" />
                            <span className="text-xs text-gray-500 mt-1">Görsel Ekle</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                files.forEach(file => {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    handleImagesChange([...imageFiles, reader.result as string]);
                                  };
                                  reader.readAsDataURL(file);
                                });
                                e.target.value = '';
                              }}
                            />
                          </label>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                        💡 İpucu: Yıldız ikonuna tıklayarak ana görseli seçin. Görselleri sürükleyerek sıralayabilirsiniz.
                      </div>
                    </div>
                  ) : (
                    <ImageUpload images={imageFiles} onChange={handleImagesChange} maxImages={10} label="" />
                  )}
                </div>
              </div>
            </Card>

            {/* Description with HTML Editor */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Detaylı Açıklama (HTML)</h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200">
                    <div className="flex overflow-x-auto">
                      {(['tr', 'en', 'de', 'fr', 'es', 'it'] as const).map((lang) => (
                        <button key={lang} type="button" onClick={() => setActiveDescTab(lang)} className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeDescTab === lang ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                          {lang === 'tr' && '🇹🇷 Türkçe'}
                          {lang === 'en' && '🇬🇧 English'}
                          {lang === 'de' && '🇩🇪 Deutsch'}
                          {lang === 'fr' && '🇫🇷 Français'}
                          {lang === 'es' && '🇪🇸 Español'}
                          {lang === 'it' && '🇮🇹 Italiano'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <RichTextEditor value={formData.description[activeDescTab]} onChange={(value) => setFormData({...formData, description: { ...formData.description, [activeDescTab]: value }})} placeholder="Ürünün detaylı açıklamasını buraya yazın..." />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Durum</h2>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="active" checked={formData.active} onChange={(e) => setFormData({...formData, active: e.target.checked})} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">Aktif</label>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">İşlemler</h2>
              <div className="space-y-3">
                <Button onClick={handleSave} fullWidth className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
                <Button variant="outline" onClick={() => router.push('/admin/products')} fullWidth disabled={loading}>
                  <X className="w-4 h-4 mr-2" />
                  İptal
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <ImageLightbox isOpen={lightbox.isOpen} imageUrl={lightbox.imageUrl} alt="Ürün Görseli" onClose={() => setLightbox({ isOpen: false, imageUrl: '' })} />
      </Container>
    </Section>
  );
}
