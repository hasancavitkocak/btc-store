'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { 
  ArrowLeft, Save, Image, FolderTree, Package, Users, BookOpen, FileText, 
  MessageSquare, Phone, Settings, UserCog, Mail, Shield, Globe, Menu, 
  Building, Handshake, UsersRound, LayoutDashboard, ShoppingCart, Tag,
  Layers, Grid, List, Calendar, Clock, Bell, Star, Heart, Bookmark,
  Search, Filter, Download, Upload, Edit, Trash2, Plus, Minus,
  Check, X, AlertCircle, Info, HelpCircle, Eye, EyeOff, Lock,
  Unlock, Key, Home, Briefcase, Award, Target, TrendingUp, BarChart,
  PieChart, Activity, Zap, Cpu, Database, Server, Cloud, Wifi
} from 'lucide-react';
import Container from '@/components/Container';
import Section from '@/components/Section';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Toast from '@/components/Toast';
import SearchableAutocomplete from '@/components/SearchableAutocomplete';
import { dashboardService } from '@/services/admin.service';
import { type SupportedLocale } from '@/lib/i18n-utils';

interface DashboardModuleFormProps {
  code?: string;
}

export default function DashboardModuleForm({ code }: DashboardModuleFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale() as SupportedLocale;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const [availableModels, setAvailableModels] = useState<Array<{className: string, displayName: string}>>([]);
  
  // Kullanıcının dilini en üste, diğerlerini sıraya koy
  const getOrderedLanguages = (): SupportedLocale[] => {
    const allLanguages: SupportedLocale[] = ['tr', 'en', 'de', 'fr', 'es', 'it'];
    return [locale, ...allLanguages.filter(lang => lang !== locale)];
  };

  const orderedLanguages = getOrderedLanguages();

  // Dil bilgileri
  const languageInfo: Record<SupportedLocale, { code: string; name: string }> = {
    tr: { code: 'TR', name: 'Türkçe' },
    en: { code: 'EN', name: 'English' },
    de: { code: 'DE', name: 'Deutsch' },
    fr: { code: 'FR', name: 'Français' },
    es: { code: 'ES', name: 'Español' },
    it: { code: 'IT', name: 'Italiano' }
  };
  
  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    code: '',
    name: { tr: '', en: '', de: '', fr: '', es: '', it: '' },
    description: { tr: '', en: '', de: '', fr: '', es: '', it: '' },
    link: '',
    icon: '',
    displayOrder: 0,
    active: true,
    showCount: true,
    searchItemType: '',
    searchFilters: '',
    moduleType: 'CARD',
    userGroups: [] as any[]
  });

  // Kullanılabilir iconlar
  const availableIcons = [
    // Yaygın kullanılanlar
    { value: 'LayoutDashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { value: 'Package', label: 'Package', Icon: Package },
    { value: 'ShoppingCart', label: 'Shopping Cart', Icon: ShoppingCart },
    { value: 'Users', label: 'Users', Icon: Users },
    { value: 'UsersRound', label: 'Users Round', Icon: UsersRound },
    { value: 'UserCog', label: 'User Cog', Icon: UserCog },
    { value: 'Image', label: 'Image', Icon: Image },
    { value: 'FileText', label: 'File Text', Icon: FileText },
    { value: 'FolderTree', label: 'Folder Tree', Icon: FolderTree },
    { value: 'BookOpen', label: 'Book Open', Icon: BookOpen },
    { value: 'MessageSquare', label: 'Message', Icon: MessageSquare },
    { value: 'Mail', label: 'Mail', Icon: Mail },
    { value: 'Phone', label: 'Phone', Icon: Phone },
    { value: 'Settings', label: 'Settings', Icon: Settings },
    { value: 'Shield', label: 'Shield', Icon: Shield },
    { value: 'Globe', label: 'Globe', Icon: Globe },
    { value: 'Menu', label: 'Menu', Icon: Menu },
    { value: 'Building', label: 'Building', Icon: Building },
    { value: 'Handshake', label: 'Handshake', Icon: Handshake },
    { value: 'Home', label: 'Home', Icon: Home },
    { value: 'Briefcase', label: 'Briefcase', Icon: Briefcase },
    
    // Kategoriler ve organizasyon
    { value: 'Tag', label: 'Tag', Icon: Tag },
    { value: 'Layers', label: 'Layers', Icon: Layers },
    { value: 'Grid', label: 'Grid', Icon: Grid },
    { value: 'List', label: 'List', Icon: List },
    
    // Zaman ve takvim
    { value: 'Calendar', label: 'Calendar', Icon: Calendar },
    { value: 'Clock', label: 'Clock', Icon: Clock },
    
    // Bildirim ve işaretler
    { value: 'Bell', label: 'Bell', Icon: Bell },
    { value: 'Star', label: 'Star', Icon: Star },
    { value: 'Heart', label: 'Heart', Icon: Heart },
    { value: 'Bookmark', label: 'Bookmark', Icon: Bookmark },
    { value: 'Award', label: 'Award', Icon: Award },
    { value: 'Target', label: 'Target', Icon: Target },
    
    // Arama ve filtre
    { value: 'Search', label: 'Search', Icon: Search },
    { value: 'Filter', label: 'Filter', Icon: Filter },
    
    // Dosya işlemleri
    { value: 'Download', label: 'Download', Icon: Download },
    { value: 'Upload', label: 'Upload', Icon: Upload },
    
    // Düzenleme işlemleri
    { value: 'Edit', label: 'Edit', Icon: Edit },
    { value: 'Trash2', label: 'Trash', Icon: Trash2 },
    { value: 'Plus', label: 'Plus', Icon: Plus },
    { value: 'Minus', label: 'Minus', Icon: Minus },
    { value: 'Check', label: 'Check', Icon: Check },
    { value: 'X', label: 'X', Icon: X },
    
    // Bilgi ve uyarılar
    { value: 'AlertCircle', label: 'Alert', Icon: AlertCircle },
    { value: 'Info', label: 'Info', Icon: Info },
    { value: 'HelpCircle', label: 'Help', Icon: HelpCircle },
    
    // Güvenlik
    { value: 'Eye', label: 'Eye', Icon: Eye },
    { value: 'EyeOff', label: 'Eye Off', Icon: EyeOff },
    { value: 'Lock', label: 'Lock', Icon: Lock },
    { value: 'Unlock', label: 'Unlock', Icon: Unlock },
    { value: 'Key', label: 'Key', Icon: Key },
    
    // Grafikler ve analiz
    { value: 'TrendingUp', label: 'Trending Up', Icon: TrendingUp },
    { value: 'BarChart', label: 'Bar Chart', Icon: BarChart },
    { value: 'PieChart', label: 'Pie Chart', Icon: PieChart },
    { value: 'Activity', label: 'Activity', Icon: Activity },
    
    // Teknoloji
    { value: 'Zap', label: 'Zap', Icon: Zap },
    { value: 'Cpu', label: 'CPU', Icon: Cpu },
    { value: 'Database', label: 'Database', Icon: Database },
    { value: 'Server', label: 'Server', Icon: Server },
    { value: 'Cloud', label: 'Cloud', Icon: Cloud },
    { value: 'Wifi', label: 'Wifi', Icon: Wifi },
  ];

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
    loadModels();
  }, []);

  useEffect(() => {
    if (code) {
      fetchModule();
    }
  }, [code]);

  const loadModels = async () => {
    try {
      const { emailTemplateService } = await import('@/services/admin.service');
      const response = await emailTemplateService.getAllModels();
      
      if (response.status === 'SUCCESS' && response.data) {
        const innerData = (response.data as any).data;
        const rawData = innerData || response.data;
        
        const modelsData = Array.isArray(rawData) 
          ? rawData.map((item: any) => ({
              className: item.code,
              displayName: item.name
            }))
          : [];
        
        setAvailableModels(modelsData);
      }
    } catch (error) {
      console.error('Failed to load models:', error);
      setAvailableModels([]);
    }
  };

  const fetchModule = async () => {
    if (!code) return;
    
    setLoading(true);
    try {
      const response = await dashboardService.getByCode(code);
      const data = (response as any).data?.data || (response as any).data;
      setFormData({
        id: data.id,
        code: data.code || '',
        name: data.name || { tr: '', en: '', de: '', fr: '', es: '', it: '' },
        description: data.description || { tr: '', en: '', de: '', fr: '', es: '', it: '' },
        link: data.link || '',
        icon: data.icon || '',
        displayOrder: data.displayOrder || 0,
        active: data.active !== false,
        showCount: data.showCount !== false,
        searchItemType: data.searchItemType || '',
        searchFilters: data.searchFilters || '',
        moduleType: data.moduleType || 'CARD',
        userGroups: data.userGroups || []
      });
    } catch (error) {
      console.error('Failed to fetch module:', error);
      setToast({ message: t('dashboardModuleForm.loadError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await dashboardService.save(formData);
      setToast({ message: t('dashboardModuleForm.saveSuccess'), type: 'success' });
      setTimeout(() => {
        router.push('/admin/dashboard-modules');
      }, 1500);
    } catch (error) {
      console.error('Failed to save module:', error);
      setToast({ message: t('dashboardModuleForm.saveError'), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Section>
        <Container>
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-gray-600">{t('dashboardModuleForm.loading')}</div>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container>
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/dashboard-modules')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('dashboardModuleForm.back')}
          </Button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {code ? t('dashboardModuleForm.editModule') : t('dashboardModuleForm.newModule')}
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">{t('dashboardModuleForm.moduleInfo')}</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('dashboardModuleForm.moduleTypeRequired')}
                      </label>
                      <select
                        value={formData.moduleType}
                        onChange={(e) => setFormData({ ...formData, moduleType: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="CARD">{t('dashboardModuleForm.moduleTypes.card')}</option>
                        <option value="QUICK_ACTION">{t('dashboardModuleForm.moduleTypes.quickAction')}</option>
                      </select>
                    </div>

                    <Input
                      label={t('dashboardModuleForm.order')}
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">{t('dashboardModuleForm.nameRequired')}</label>
                      <button
                        type="button"
                        onClick={() => toggleField('name')}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all"
                      >
                        <span className="text-base">{expandedFields.has('name') ? '🌐' : '🌍'}</span>
                        <span>{t('dashboardModuleForm.otherLanguages')}</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">5</span>
                        <span className="text-gray-400">{expandedFields.has('name') ? '▼' : '▶'}</span>
                      </button>
                    </div>
                    <div className="p-4 space-y-3">
                      <Input
                        placeholder={`${languageInfo[orderedLanguages[0]].code} - ${languageInfo[orderedLanguages[0]].name}`}
                        value={formData.name[orderedLanguages[0]]}
                        onChange={(e) => setFormData({ ...formData, name: { ...formData.name, [orderedLanguages[0]]: e.target.value } })}
                        required
                      />
                      
                      {expandedFields.has('name') && (
                        <div className="space-y-3 pt-3 border-t border-gray-200">
                          {orderedLanguages.slice(1).map((lang) => (
                            <Input
                              key={lang}
                              placeholder={`${languageInfo[lang].code} - ${languageInfo[lang].name}`}
                              value={formData.name[lang]}
                              onChange={(e) => setFormData({ ...formData, name: { ...formData.name, [lang]: e.target.value } })}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">{t('dashboardModuleForm.description')}</label>
                      <button
                        type="button"
                        onClick={() => toggleField('description')}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all"
                      >
                        <span className="text-base">{expandedFields.has('description') ? '🌐' : '🌍'}</span>
                        <span>{t('dashboardModuleForm.otherLanguages')}</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">5</span>
                        <span className="text-gray-400">{expandedFields.has('description') ? '▼' : '▶'}</span>
                      </button>
                    </div>
                    <div className="p-4 space-y-3">
                      <Input
                        placeholder={`${languageInfo[orderedLanguages[0]].code} - ${languageInfo[orderedLanguages[0]].name}`}
                        value={formData.description[orderedLanguages[0]]}
                        onChange={(e) => setFormData({ ...formData, description: { ...formData.description, [orderedLanguages[0]]: e.target.value } })}
                      />
                      
                      {expandedFields.has('description') && (
                        <div className="space-y-3 pt-3 border-t border-gray-200">
                          {orderedLanguages.slice(1).map((lang) => (
                            <Input
                              key={lang}
                              placeholder={`${languageInfo[lang].code} - ${languageInfo[lang].name}`}
                              value={formData.description[lang]}
                              onChange={(e) => setFormData({ ...formData, description: { ...formData.description, [lang]: e.target.value } })}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={t('dashboardModuleForm.linkRequired')}
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      required
                      placeholder={t('dashboardModuleForm.linkPlaceholder')}
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('dashboardModuleForm.iconRequired')}
                      </label>
                      <div className="relative">
                        <select
                          value={formData.icon}
                          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                          required
                        >
                          <option value="">{t('dashboardModuleForm.iconSelect')}</option>
                          {availableIcons.map((icon) => (
                            <option key={icon.value} value={icon.value}>
                              {icon.label}
                            </option>
                          ))}
                        </select>
                        {formData.icon && (() => {
                          const selectedIcon = availableIcons.find(i => i.value === formData.icon);
                          if (selectedIcon) {
                            const IconComponent = selectedIcon.Icon;
                            return (
                              <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none">
                                <IconComponent className="w-5 h-5 text-blue-600" />
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      {formData.icon && (
                        <p className="text-xs text-gray-500 mt-1">
                          {t('dashboardModuleForm.iconSelected')}: {availableIcons.find(i => i.value === formData.icon)?.label}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">{t('dashboardModuleForm.visibilitySettings')}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="showCount"
                          checked={formData.showCount}
                          onChange={(e) => setFormData({ ...formData, showCount: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="showCount" className="text-sm font-medium text-gray-700">
                          {t('dashboardModuleForm.showCount')}
                        </label>
                      </div>
                    </div>
                  </div>

                  {formData.showCount && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('dashboardModuleForm.countSettings')}</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('dashboardModuleForm.modelTypeRequired')}
                          </label>
                          <select
                            value={formData.searchItemType}
                            onChange={(e) => setFormData({ ...formData, searchItemType: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required={formData.showCount}
                          >
                            <option value="">{t('dashboardModuleForm.modelTypePlaceholder')}</option>
                            {availableModels.map((model) => (
                              <option key={model.className} value={model.className}>
                                {model.displayName}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('dashboardModuleForm.filters')}
                          </label>
                          <textarea
                            value={formData.searchFilters}
                            onChange={(e) => setFormData({ ...formData, searchFilters: e.target.value })}
                            placeholder='{"filters": [{"name": "active", "value": true, "searchCondition": "EQUALS"}]}'
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                            rows={4}
                          />
                          <p className="text-xs text-gray-600 mt-2">
                            {t('dashboardModuleForm.filtersHint')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">{t('dashboardModuleForm.authorization')}</h2>
                
                <SearchableAutocomplete
                  itemType="UserGroupModel"
                  searchField="description.tr"
                  selectedItems={formData.userGroups}
                  onItemsChange={(selected: any[]) => setFormData({ ...formData, userGroups: selected })}
                  getItemKey={(option: any) => option.code}
                  getItemLabel={(option: any) => option.description?.tr || option.code}
                  placeholder={t('dashboardModuleForm.selectGroup')}
                  label={t('dashboardModuleForm.authorizedGroups')}
                  multiple
                />
                <p className="text-sm text-gray-500 mt-2">
                  {t('dashboardModuleForm.noGroupsNote')}
                </p>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">{t('dashboardModuleForm.status')}</h2>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700">
                    {t('dashboardModuleForm.active')}
                  </label>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">{t('dashboardModuleForm.actions')}</h2>
                <div className="space-y-3">
                  <Button 
                    type="submit"
                    fullWidth 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={saving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? t('dashboardModuleForm.saving') : t('dashboardModuleForm.save')}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => router.push('/admin/dashboard-modules')} 
                    fullWidth
                    disabled={saving}
                  >
                    {t('dashboardModuleForm.cancel')}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </form>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </Container>
    </Section>
  );
}
