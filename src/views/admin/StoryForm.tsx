'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Save, X, ArrowLeft } from 'lucide-react';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Toast from '../../components/Toast';
import ImageUpload from '../../components/ImageUpload';
import RichTextEditor from '../../components/RichTextEditor';
import ImageLightbox from '../../components/ImageLightbox';
import { storyService, sectorService } from '../../services/admin.service';
import { getLocalizedText, type SupportedLocale } from '../../lib/i18n-utils';

interface StoryFormProps {
  storyId?: string;
}

interface Sector {
  code: string;
  name: { tr: string; en: string };
  active: boolean;
}

export default function StoryForm({ storyId }: StoryFormProps) {
  const t = useTranslations();
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [newMediaFile, setNewMediaFile] = useState<File | null>(null);
  const [shouldRemoveMedia, setShouldRemoveMedia] = useState(false);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const [lightbox, setLightbox] = useState<{ isOpen: boolean; imageUrl: string }>({
    isOpen: false,
    imageUrl: ''
  });
  
  // Track if data has been loaded to prevent multiple loads
  const dataLoadedRef = useRef(false);
  const currentStoryIdRef = useRef<string | undefined>(undefined);
  const sectorsLoadedRef = useRef(false);
  
  const isEditing = !!storyId;

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
    company: '',
    sector: null as { code: string; name: { tr: string; en: string } } | null,
    title: { tr: '', en: '', de: '', fr: '', es: '', it: '' },
    htmlContent: { tr: '', en: '', de: '', fr: '', es: '', it: '' },
    videoUrl: '',
    results: [] as string[],
    order: 0,
    active: true
  });

  const [sectors, setSectors] = useState<Sector[]>([]);
  const [sectorSearchTerm, setSectorSearchTerm] = useState('');
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);
  const [resultInput, setResultInput] = useState('');
  const [activeHtmlTab, setActiveHtmlTab] = useState<'tr' | 'en' | 'de' | 'fr' | 'es' | 'it'>('tr');

  useEffect(() => {
    // Only load sectors once
    if (!sectorsLoadedRef.current) {
      loadSectors();
    }
  }, []);

  useEffect(() => {
    // Reset dataLoaded flag if storyId changes
    if (currentStoryIdRef.current !== storyId) {
      dataLoadedRef.current = false;
      currentStoryIdRef.current = storyId;
    }
    
    // Only load story if we have a storyId and haven't loaded it yet
    if (storyId && !dataLoadedRef.current) {
      loadStory();
    }
  }, [storyId]);

  // Debug: formData değişikliklerini izle (remove after debugging)
  useEffect(() => {
    console.log('=== FORM DATA CHANGED ===');
    console.log('formData.company:', formData.company);
    console.log('formData.sector:', formData.sector);
    console.log('formData.title:', formData.title);
    console.log('formData.videoUrl:', formData.videoUrl);
    console.log('formData.results:', formData.results);
    console.log('formData.order:', formData.order);
    console.log('formData.active:', formData.active);
  }, [formData]);

  // Dropdown dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isSectorDropdownOpen && !target.closest('.sector-dropdown-container')) {
        setIsSectorDropdownOpen(false);
        setSectorSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSectorDropdownOpen]);

  const loadSectors = async () => {
    // Prevent multiple calls
    if (sectorsLoadedRef.current) {
      console.log('Sectors already loaded, skipping...');
      return;
    }
    
    try {
      console.log('=== LOADING SECTORS (ONCE) ===');
      const response = await sectorService.getActive();
      console.log('Sectors response:', response);
      if (response.status === 'SUCCESS' && response.data) {
        const sectorsData = (response.data as any).data || response.data;
        console.log('Parsed sectors:', sectorsData);
        setSectors(Array.isArray(sectorsData) ? sectorsData : []);
        sectorsLoadedRef.current = true;
      }
    } catch (error) {
      console.error('Error loading sectors:', error);
      setSectors([]);
    }
  };

  const loadStory = async () => {
    // Prevent multiple calls
    if (dataLoadedRef.current) {
      console.log('Story already loaded, skipping...');
      return;
    }
    
    try {
      console.log('=== LOADING STORY (ONCE) ===');
      console.log('storyId:', storyId);
      setLoading(true);
      const response = await storyService.getByCode(storyId!);
      
      console.log('=== BACKEND RESPONSE ===');
      console.log('Full response:', response);
      console.log('response.data:', response.data);
      
      if (response.status === 'SUCCESS' && response.data) {
        const storyData = (response.data as any).data || response.data;
        
        console.log('=== PARSED STORY DATA ===');
        console.log('storyData:', storyData);
        console.log('company:', storyData.company);
        console.log('sector:', storyData.sector);
        console.log('title:', storyData.title);
        console.log('videoUrl:', storyData.videoUrl);
        console.log('results:', storyData.results);
        console.log('order:', storyData.order);
        console.log('active:', storyData.active);
        
        // Clean taskStep from title and htmlContent objects
        const cleanTitle = storyData.title ? {
          tr: storyData.title.tr || '',
          en: storyData.title.en || '',
          de: storyData.title.de || '',
          fr: storyData.title.fr || '',
          es: storyData.title.es || '',
          it: storyData.title.it || ''
        } : { tr: '', en: '', de: '', fr: '', es: '', it: '' };
        
        const cleanHtmlContent = storyData.htmlContent ? {
          tr: storyData.htmlContent.tr || '',
          en: storyData.htmlContent.en || '',
          de: storyData.htmlContent.de || '',
          fr: storyData.htmlContent.fr || '',
          es: storyData.htmlContent.es || '',
          it: storyData.htmlContent.it || ''
        } : { tr: '', en: '', de: '', fr: '', es: '', it: '' };
        
        const newFormData = {
          id: storyData.id,
          code: storyData.code,
          company: storyData.company || '',
          sector: storyData.sector || null,
          title: cleanTitle,
          htmlContent: cleanHtmlContent,
          videoUrl: storyData.videoUrl || '',
          results: storyData.results || [],
          order: storyData.order || 0,
          active: storyData.active ?? true
        };
        
        console.log('=== NEW FORM DATA ===');
        console.log('newFormData:', newFormData);
        console.log('newFormData.company:', newFormData.company);
        console.log('newFormData.sector:', newFormData.sector);
        console.log('newFormData.title:', newFormData.title);
        console.log('newFormData.videoUrl:', newFormData.videoUrl);
        console.log('newFormData.results:', newFormData.results);
        
        setFormData(newFormData);
        
        // Mark as loaded to prevent re-loading
        dataLoadedRef.current = true;
        
        console.log('=== AFTER setFormData ===');
        console.log('Form data set successfully');
        console.log('dataLoadedRef.current:', dataLoadedRef.current);
        
        if (storyData.media?.absolutePath) {
          setImageFiles([storyData.media.absolutePath]);
        }
      }
    } catch (error) {
      console.error('Error loading success story:', error);
      setToast({ message: t('admin.storyForm.loadError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (images: string[]) => {
    setImageFiles(images);
    
    if (images.length === 0) {
      setNewMediaFile(null);
      setShouldRemoveMedia(true);
    } else if (images[0].startsWith('data:')) {
      setShouldRemoveMedia(false);
      fetch(images[0])
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'story-image.jpg', { type: 'image/jpeg' });
          setNewMediaFile(file);
        });
    } else {
      setShouldRemoveMedia(false);
    }
  };

  const handleAddResult = () => {
    if (resultInput.trim()) {
      setFormData({
        ...formData,
        results: [...formData.results, resultInput.trim()]
      });
      setResultInput('');
    }
  };

  const handleRemoveResult = (index: number) => {
    setFormData({
      ...formData,
      results: formData.results.filter((_, i) => i !== index)
    });
  };

  const handleResultKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddResult();
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const storyData = {
        ...(formData.id && { id: formData.id }),
        code: formData.code || undefined,
        company: formData.company,
        sector: formData.sector ? { code: formData.sector.code } : null,
        title: formData.title,
        htmlContent: formData.htmlContent,
        videoUrl: formData.videoUrl,
        results: formData.results,
        order: formData.order,
        active: formData.active
      };

      console.log('=== SENDING TO BACKEND ===');
      console.log('storyData:', storyData);
      console.log('company:', storyData.company);
      console.log('sector:', storyData.sector);
      console.log('title:', storyData.title);
      console.log('videoUrl:', storyData.videoUrl);
      console.log('results:', storyData.results);

      const response = await storyService.save(storyData, newMediaFile || undefined, shouldRemoveMedia);

      console.log('=== BACKEND SAVE RESPONSE ===');
      console.log('response:', response);
      console.log('response.data:', response.data);

      if (response.status === 'ERROR') {
        setToast({ 
          message: response.errorMessage || t('admin.storyForm.saveError'), 
          type: 'error' 
        });
        return;
      }

      setToast({ 
        message: isEditing ? t('admin.storyForm.updateSuccess') : t('admin.storyForm.createSuccess'), 
        type: 'success' 
      });

      setTimeout(() => {
        router.push('/admin/stories');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving success story:', error);
      setToast({ 
        message: error.message || t('admin.storyForm.unexpectedError'), 
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
          <Button
            variant="outline"
            onClick={() => router.push('/admin/stories')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isEditing ? t('admin.editStory') : t('admin.addStory')}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('admin.storyForm.storyInfo')}</h2>
              <div className="space-y-4">
                <Input
                  label={t('admin.storyForm.companyName')}
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  placeholder={t('admin.storyForm.companyName')}
                  required
                />
                
                <div className="relative sector-dropdown-container">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.storyForm.sector')}
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsSectorDropdownOpen(!isSectorDropdownOpen)}
                      className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white flex items-center justify-between hover:border-gray-400 transition-colors"
                    >
                      <span className={formData.sector ? 'text-gray-900' : 'text-gray-500'}>
                        {formData.sector ? getLocalizedText(formData.sector.name, locale) : t('admin.storyForm.selectSector')}
                      </span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${isSectorDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {isSectorDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
                        <div className="p-2 border-b border-gray-200">
                          <input
                            type="text"
                            placeholder={t('admin.storyForm.searchSector')}
                            value={sectorSearchTerm}
                            onChange={(e) => setSectorSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="overflow-y-auto max-h-48">
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({...formData, sector: null});
                              setIsSectorDropdownOpen(false);
                              setSectorSearchTerm('');
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-500 text-sm border-b border-gray-100"
                          >
                            {t('admin.storyForm.noSectorSelected')}
                          </button>
                          {sectors
                            .filter(sector => {
                              const searchLower = sectorSearchTerm.toLowerCase();
                              return (sector.name.tr?.toLowerCase().includes(searchLower) || 
                                      sector.name.en?.toLowerCase().includes(searchLower));
                            })
                            .map((sector) => (
                              <button
                                key={sector.code}
                                type="button"
                                onClick={() => {
                                  setFormData({...formData, sector: sector});
                                  setIsSectorDropdownOpen(false);
                                  setSectorSearchTerm('');
                                }}
                                className={`w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors flex items-center gap-2 ${
                                  formData.sector?.code === sector.code ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                                }`}
                              >
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span className="text-sm">{getLocalizedText(sector.name, locale)}</span>
                                {formData.sector?.code === sector.code && (
                                  <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                            ))}
                          {sectors.filter(sector => {
                            const searchLower = sectorSearchTerm.toLowerCase();
                            return (sector.name.tr?.toLowerCase().includes(searchLower) || 
                                    sector.name.en?.toLowerCase().includes(searchLower));
                          }).length === 0 && (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                              {t('admin.storyForm.noSearchResults')}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {sectors.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {t('admin.storyForm.noSectorsAvailable')}
                    </p>
                  )}
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">{t('admin.storyForm.title')}</label>
                    <button
                      type="button"
                      onClick={() => toggleField('title')}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                      <span className="text-base">{expandedFields.has('title') ? '🌐' : '🌍'}</span>
                      <span>{t('admin.storyForm.otherLanguages')}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">5</span>
                      <span className="text-gray-400">{expandedFields.has('title') ? '▼' : '▶'}</span>
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    {/* User's current locale first */}
                    <Input
                      placeholder={`${locale.toUpperCase()} - ${
                        locale === 'tr' ? 'Türkçe' :
                        locale === 'en' ? 'English' :
                        locale === 'de' ? 'Deutsch' :
                        locale === 'fr' ? 'Français' :
                        locale === 'es' ? 'Español' :
                        'Italiano'
                      }`}
                      value={formData.title[locale]}
                      onChange={(e) => setFormData({ ...formData, title: { ...formData.title, [locale]: e.target.value } })}
                    />
                    
                    {expandedFields.has('title') && (
                      <div className="space-y-3 pt-3 border-t border-gray-200">
                        {/* Other languages */}
                        {(['tr', 'en', 'de', 'fr', 'es', 'it'] as const)
                          .filter(lang => lang !== locale)
                          .map(lang => (
                            <Input
                              key={lang}
                              placeholder={`${lang.toUpperCase()} - ${
                                lang === 'tr' ? 'Türkçe' :
                                lang === 'en' ? 'English' :
                                lang === 'de' ? 'Deutsch' :
                                lang === 'fr' ? 'Français' :
                                lang === 'es' ? 'Español' :
                                'Italiano'
                              }`}
                              value={formData.title[lang]}
                              onChange={(e) => setFormData({ ...formData, title: { ...formData.title, [lang]: e.target.value } })}
                            />
                          ))
                        }
                      </div>
                    )}
                  </div>
                </div>
                
                <ImageUpload
                  images={imageFiles}
                  onChange={handleImageChange}
                  onImageClick={(imageUrl) => setLightbox({ isOpen: true, imageUrl })}
                  maxImages={1}
                  label={t('admin.storyForm.storyImage')}
                />
                
                <Input
                  label={t('admin.storyForm.order')}
                  type="number"
                  value={formData.order.toString()}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                />
                
                <Input
                  label={t('admin.storyForm.videoUrl')}
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                  placeholder={t('admin.storyForm.videoUrlPlaceholder')}
                />
                {formData.videoUrl && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      {t('admin.storyForm.videoAdded')}
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.storyForm.results')}
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={resultInput}
                        onChange={(e) => setResultInput(e.target.value)}
                        onKeyDown={handleResultKeyDown}
                        placeholder={t('admin.storyForm.resultsPlaceholder')}
                      />
                      <Button
                        type="button"
                        onClick={handleAddResult}
                        className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                      >
                        {t('admin.storyForm.addResult')}
                      </Button>
                    </div>
                    
                    {formData.results.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {formData.results.map((result, index) => (
                          <div
                            key={index}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                          >
                            <span>{result}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveResult(index)}
                              className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {formData.results.length === 0 && (
                      <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {t('admin.storyForm.noResults')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('admin.storyForm.detailedContent')}</h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200">
                    <div className="flex overflow-x-auto">
                      <button
                        type="button"
                        onClick={() => setActiveHtmlTab('tr')}
                        className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                          activeHtmlTab === 'tr'
                            ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        TR - Türkçe
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveHtmlTab('en')}
                        className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                          activeHtmlTab === 'en'
                            ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        EN - English
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveHtmlTab('de')}
                        className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                          activeHtmlTab === 'de'
                            ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        DE - Deutsch
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveHtmlTab('fr')}
                        className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                          activeHtmlTab === 'fr'
                            ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        FR - Français
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveHtmlTab('es')}
                        className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                          activeHtmlTab === 'es'
                            ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        ES - Español
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveHtmlTab('it')}
                        className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                          activeHtmlTab === 'it'
                            ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        IT - Italiano
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    {activeHtmlTab === 'tr' && (
                      <RichTextEditor
                        value={formData.htmlContent.tr}
                        onChange={(value) => setFormData({...formData, htmlContent: { ...formData.htmlContent, tr: value }})}
                        placeholder={t('admin.storyForm.contentPlaceholder')}
                      />
                    )}
                    {activeHtmlTab === 'en' && (
                      <RichTextEditor
                        value={formData.htmlContent.en}
                        onChange={(value) => setFormData({...formData, htmlContent: { ...formData.htmlContent, en: value }})}
                        placeholder={t('admin.storyForm.contentPlaceholder')}
                      />
                    )}
                    {activeHtmlTab === 'de' && (
                      <RichTextEditor
                        value={formData.htmlContent.de}
                        onChange={(value) => setFormData({...formData, htmlContent: { ...formData.htmlContent, de: value }})}
                        placeholder={t('admin.storyForm.contentPlaceholder')}
                      />
                    )}
                    {activeHtmlTab === 'fr' && (
                      <RichTextEditor
                        value={formData.htmlContent.fr}
                        onChange={(value) => setFormData({...formData, htmlContent: { ...formData.htmlContent, fr: value }})}
                        placeholder={t('admin.storyForm.contentPlaceholder')}
                      />
                    )}
                    {activeHtmlTab === 'es' && (
                      <RichTextEditor
                        value={formData.htmlContent.es}
                        onChange={(value) => setFormData({...formData, htmlContent: { ...formData.htmlContent, es: value }})}
                        placeholder={t('admin.storyForm.contentPlaceholder')}
                      />
                    )}
                    {activeHtmlTab === 'it' && (
                      <RichTextEditor
                        value={formData.htmlContent.it}
                        onChange={(value) => setFormData({...formData, htmlContent: { ...formData.htmlContent, it: value }})}
                        placeholder={t('admin.storyForm.contentPlaceholder')}
                      />
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  <p>{t('admin.storyForm.contentDescription')}</p>
                  <p className="mt-1">{t('admin.storyForm.contentTip')}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('admin.storyForm.status')}</h2>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                  {t('admin.storyForm.active')}
                </label>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('admin.storyForm.actions')}</h2>
              <div className="space-y-3">
                <Button 
                  onClick={handleSave} 
                  fullWidth 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? t('admin.storyForm.saving') : t('common.save')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/admin/stories')} 
                  fullWidth
                  disabled={loading}
                >
                  <X className="w-4 h-4 mr-2" />
                  {t('common.cancel')}
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

        <ImageLightbox
          isOpen={lightbox.isOpen}
          imageUrl={lightbox.imageUrl}
          alt={t('admin.storyForm.storyImage')}
          onClose={() => setLightbox({ isOpen: false, imageUrl: '' })}
        />
      </Container>
    </Section>
  );
}
