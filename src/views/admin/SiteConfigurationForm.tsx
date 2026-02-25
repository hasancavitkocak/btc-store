'use client';

import { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, Megaphone, Menu as MenuIcon } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Toast from '../../components/Toast';
import ImageUpload from '../../components/ImageUpload';
import ImageLightbox from '../../components/ImageLightbox';
import { siteConfigurationService, menuLinkItemService } from '../../services/admin.service';
import { getLocalizedText, type SupportedLocale } from '../../lib/i18n-utils';

type TabType = 'logos' | 'header' | 'footer';

// Dil bilgileri
const languageInfo: Record<SupportedLocale, { code: string; name: string }> = {
  tr: { code: 'TR', name: 'Türkçe' },
  en: { code: 'EN', name: 'English' },
  de: { code: 'DE', name: 'Deutsch' },
  fr: { code: 'FR', name: 'Français' },
  es: { code: 'ES', name: 'Español' },
  it: { code: 'IT', name: 'Italiano' }
};

export default function SiteConfigurationForm() {
  const t = useTranslations();
  const locale = useLocale() as SupportedLocale;
  const [activeTab, setActiveTab] = useState<TabType>('logos');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [loading, setLoading] = useState(false);
  const [headerLogoFiles, setHeaderLogoFiles] = useState<string[]>([]);
  const [footerLogoFiles, setFooterLogoFiles] = useState<string[]>([]);
  const [newHeaderLogoFile, setNewHeaderLogoFile] = useState<File | null>(null);
  const [newFooterLogoFile, setNewFooterLogoFile] = useState<File | null>(null);
  const [shouldRemoveHeaderLogo, setShouldRemoveHeaderLogo] = useState(false);
  const [shouldRemoveFooterLogo, setShouldRemoveFooterLogo] = useState(false);
  const [publicMenus, setPublicMenus] = useState<any[]>([]);
  const [selectedFooterMenus, setSelectedFooterMenus] = useState<Set<string>>(new Set());
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const [lightbox, setLightbox] = useState<{ isOpen: boolean; imageUrl: string }>({
    isOpen: false,
    imageUrl: ''
  });

  // Kullanıcının dilini en üste, diğerlerini sıraya koy
  const getOrderedLanguages = (): SupportedLocale[] => {
    const allLanguages: SupportedLocale[] = ['tr', 'en', 'de', 'fr', 'es', 'it'];
    return [locale, ...allLanguages.filter(lang => lang !== locale)];
  };

  const orderedLanguages = getOrderedLanguages();

  const toggleField = (fieldName: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(fieldName)) {
      newExpanded.delete(fieldName);
    } else {
      newExpanded.add(fieldName);
    }
    setExpandedFields(newExpanded);
  };

  const tabs = [
    { id: 'logos' as TabType, label: t('siteConfiguration.tabs.logos'), icon: ImageIcon },
    { id: 'header' as TabType, label: t('siteConfiguration.tabs.header'), icon: Megaphone },
    { id: 'footer' as TabType, label: t('siteConfiguration.tabs.footer'), icon: MenuIcon }
  ];

  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    contactPhone: '',
    showContactPhone: true,
    footerEmail: '',
    footerPhone: '',
    footerAddress: '',
    topBannerEnabled: false,
    topBannerText: { tr: '', en: '', de: '', fr: '', es: '', it: '' },
    topBannerBgColor: '#1e40af',
    topBannerTextColor: '#ffffff',
    topBannerLink: ''
  });

  useEffect(() => {
    loadConfiguration();
    loadPublicMenus();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const response = await siteConfigurationService.get();
      
      if (response.status === 'SUCCESS' && response.data) {
        const configData = (response.data as any).data || response.data;
        
        setFormData({
          id: configData.id,
          contactPhone: configData.contactPhone || '',
          showContactPhone: configData.showContactPhone ?? true,
          footerEmail: configData.footerEmail || '',
          footerPhone: configData.footerPhone || '',
          footerAddress: configData.footerAddress || '',
          topBannerEnabled: configData.topBannerEnabled ?? false,
          topBannerText: configData.topBannerText || { tr: '', en: '', de: '', fr: '', es: '', it: '' },
          topBannerBgColor: configData.topBannerBgColor || '#1e40af',
          topBannerTextColor: configData.topBannerTextColor || '#ffffff',
          topBannerLink: configData.topBannerLink || ''
        });
        
        if (configData.headerLogo?.absolutePath) {
          setHeaderLogoFiles([configData.headerLogo.absolutePath]);
        }
        
        if (configData.footerLogo?.absolutePath) {
          setFooterLogoFiles([configData.footerLogo.absolutePath]);
        }

        if (configData.footerMenus && Array.isArray(configData.footerMenus)) {
          const menuCodes = new Set<string>(configData.footerMenus.map((m: any) => m.code));
          setSelectedFooterMenus(menuCodes);
        }
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      setToast({ message: t('siteConfiguration.messages.loadError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadPublicMenus = async () => {
    try {
      const response = await menuLinkItemService.getByTypeFlat('PUBLIC');
      if (response.status === 'SUCCESS' && response.data) {
        const menusData = (response.data as any).data || response.data;
        setPublicMenus(Array.isArray(menusData) ? menusData : []);
      }
    } catch (error) {
      console.error('Error loading public menus:', error);
    }
  };

  const handleHeaderLogoChange = (images: string[]) => {
    setHeaderLogoFiles(images);
    
    if (images.length === 0) {
      setNewHeaderLogoFile(null);
      setShouldRemoveHeaderLogo(true);
    } else if (images[0].startsWith('data:')) {
      setShouldRemoveHeaderLogo(false);
      fetch(images[0])
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'header-logo.jpg', { type: 'image/jpeg' });
          setNewHeaderLogoFile(file);
        });
    } else {
      setShouldRemoveHeaderLogo(false);
    }
  };

  const handleFooterLogoChange = (images: string[]) => {
    setFooterLogoFiles(images);
    
    if (images.length === 0) {
      setNewFooterLogoFile(null);
      setShouldRemoveFooterLogo(true);
    } else if (images[0].startsWith('data:')) {
      setShouldRemoveFooterLogo(false);
      fetch(images[0])
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'footer-logo.jpg', { type: 'image/jpeg' });
          setNewFooterLogoFile(file);
        });
    } else {
      setShouldRemoveFooterLogo(false);
    }
  };

  const toggleFooterMenu = (menuCode: string) => {
    const newSelected = new Set(selectedFooterMenus);
    if (newSelected.has(menuCode)) {
      newSelected.delete(menuCode);
    } else {
      newSelected.add(menuCode);
    }
    setSelectedFooterMenus(newSelected);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const configData = {
        ...(formData.id && { id: formData.id }),
        contactPhone: formData.contactPhone,
        showContactPhone: formData.showContactPhone,
        footerEmail: formData.footerEmail,
        footerPhone: formData.footerPhone,
        footerAddress: formData.footerAddress,
        footerMenus: Array.from(selectedFooterMenus).map(code => ({ code })),
        topBannerEnabled: formData.topBannerEnabled,
        // Banner pasifse null gönder
        topBannerText: formData.topBannerEnabled ? formData.topBannerText : null,
        topBannerBgColor: formData.topBannerEnabled ? formData.topBannerBgColor : null,
        topBannerTextColor: formData.topBannerEnabled ? formData.topBannerTextColor : null,
        topBannerLink: formData.topBannerEnabled ? formData.topBannerLink : null
      };

      const response = await siteConfigurationService.save(
        configData,
        newHeaderLogoFile || undefined,
        newFooterLogoFile || undefined,
        shouldRemoveHeaderLogo,
        shouldRemoveFooterLogo
      );

      if (response.status === 'ERROR') {
        setToast({ 
          message: response.errorMessage || t('siteConfiguration.messages.saveError'), 
          type: 'error' 
        });
        return;
      }

      setToast({ 
        message: t('siteConfiguration.messages.saveSuccess'), 
        type: 'success' 
      });

      setTimeout(() => {
        loadConfiguration();
      }, 1000);
    } catch (error: any) {
      console.error('Error saving configuration:', error);
      setToast({ 
        message: error.message || t('siteConfiguration.messages.unexpectedError'), 
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('siteConfiguration.title')}
          </h1>
          <p className="text-gray-600">{t('siteConfiguration.subtitle')}</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Logo Ayarları Tab */}
            {activeTab === 'logos' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">{t('siteConfiguration.logos.title')}</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('siteConfiguration.logos.currentHeaderLogo')}
                  </label>
                  {headerLogoFiles.length > 0 && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={headerLogoFiles[0]}
                        alt="Current Header Logo"
                        className="h-16 object-contain"
                      />
                    </div>
                  )}
                  <ImageUpload
                    images={headerLogoFiles}
                    onChange={handleHeaderLogoChange}
                    onImageClick={(imageUrl) => setLightbox({ isOpen: true, imageUrl })}
                    maxImages={1}
                    label={t('siteConfiguration.logos.uploadNewHeaderLogo')}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {t('siteConfiguration.logos.headerLogoHint')}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('siteConfiguration.logos.footerLogo')}
                  </label>
                  {footerLogoFiles.length > 0 && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={footerLogoFiles[0]}
                        alt="Current Footer Logo"
                        className="h-16 object-contain"
                      />
                    </div>
                  )}
                  <ImageUpload
                    images={footerLogoFiles}
                    onChange={handleFooterLogoChange}
                    onImageClick={(imageUrl) => setLightbox({ isOpen: true, imageUrl })}
                    maxImages={1}
                    label={t('siteConfiguration.logos.uploadNewFooterLogo')}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {t('siteConfiguration.logos.footerLogoHint')}
                  </p>
                </div>
              </div>
              </Card>
            )}

            {/* Başlık Ayarları Tab */}
            {activeTab === 'header' && (
              <>
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">{t('siteConfiguration.header.topBanner')}</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="topBannerEnabled"
                        checked={formData.topBannerEnabled}
                        onChange={(e) => setFormData({ ...formData, topBannerEnabled: e.target.checked })}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="topBannerEnabled" className="text-sm font-medium text-gray-700">
                        {t('siteConfiguration.header.enableTopBanner')}
                      </label>
                    </div>

                    {formData.topBannerEnabled && (
                      <>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">{t('siteConfiguration.header.bannerText')}</label>
                            <button
                              type="button"
                              onClick={() => toggleField('bannerText')}
                              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all"
                            >
                              <span className="text-base">{expandedFields.has('bannerText') ? '🌐' : '🌍'}</span>
                              <span>{t('siteConfiguration.header.otherLanguages')}</span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">5</span>
                              <span className="text-gray-400">{expandedFields.has('bannerText') ? '▼' : '▶'}</span>
                            </button>
                          </div>
                          <div className="p-4 space-y-3">
                            <Input
                              placeholder={`${languageInfo[orderedLanguages[0]].code} - ${languageInfo[orderedLanguages[0]].name}`}
                              value={formData.topBannerText[orderedLanguages[0]]}
                              onChange={(e) => setFormData({ ...formData, topBannerText: { ...formData.topBannerText, [orderedLanguages[0]]: e.target.value } })}
                            />
                            
                            {expandedFields.has('bannerText') && (
                              <div className="space-y-3 pt-3 border-t border-gray-200">
                                {orderedLanguages.slice(1).map((lang) => (
                                  <Input
                                    key={lang}
                                    placeholder={`${languageInfo[lang].code} - ${languageInfo[lang].name}`}
                                    value={formData.topBannerText[lang]}
                                    onChange={(e) => setFormData({ ...formData, topBannerText: { ...formData.topBannerText, [lang]: e.target.value } })}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <Input
                          label={t('siteConfiguration.header.bannerLink')}
                          value={formData.topBannerLink}
                          onChange={(e) => setFormData({ ...formData, topBannerLink: e.target.value })}
                          placeholder={t('siteConfiguration.header.bannerLinkPlaceholder')}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t('siteConfiguration.header.backgroundColor')}
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={formData.topBannerBgColor}
                                onChange={(e) => setFormData({ ...formData, topBannerBgColor: e.target.value })}
                                className="w-12 h-10 rounded border border-gray-300"
                              />
                              <Input
                                value={formData.topBannerBgColor}
                                onChange={(e) => setFormData({ ...formData, topBannerBgColor: e.target.value })}
                                placeholder="#1e40af"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t('siteConfiguration.header.textColor')}
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={formData.topBannerTextColor}
                                onChange={(e) => setFormData({ ...formData, topBannerTextColor: e.target.value })}
                                className="w-12 h-10 rounded border border-gray-300"
                              />
                              <Input
                                value={formData.topBannerTextColor}
                                onChange={(e) => setFormData({ ...formData, topBannerTextColor: e.target.value })}
                                placeholder="#ffffff"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Banner Önizleme */}
                        <div className="border-t border-gray-200 pt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('siteConfiguration.header.preview')}
                          </label>
                          <div 
                            style={{ 
                              backgroundColor: formData.topBannerBgColor,
                              color: formData.topBannerTextColor
                            }}
                            className="p-3 text-center text-sm font-medium rounded"
                          >
                            {getLocalizedText(formData.topBannerText, locale) || t('siteConfiguration.header.previewPlaceholder')}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">{t('siteConfiguration.header.headerContact')}</h2>
                  <div className="space-y-4">
                    <div>
                      <Input
                        label={t('siteConfiguration.header.contactPhone')}
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        placeholder={t('siteConfiguration.header.contactPhonePlaceholder')}
                      />
                      <div className="flex items-center gap-3 mt-3">
                        <input
                          type="checkbox"
                          id="showContactPhone"
                          checked={formData.showContactPhone}
                          onChange={(e) => setFormData({ ...formData, showContactPhone: e.target.checked })}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="showContactPhone" className="text-sm font-medium text-gray-700">
                          {t('siteConfiguration.header.showContactPhone')}
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {t('siteConfiguration.header.contactPhoneHint')}
                      </p>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* Footer Ayarları Tab */}
            {activeTab === 'footer' && (
              <>
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">{t('siteConfiguration.footer.contactInfo')}</h2>
                  <div className="space-y-4">
                    <Input
                      label={t('siteConfiguration.footer.email')}
                      type="email"
                      value={formData.footerEmail}
                      onChange={(e) => setFormData({ ...formData, footerEmail: e.target.value })}
                      placeholder={t('siteConfiguration.footer.emailPlaceholder')}
                    />
                    
                    <Input
                      label={t('siteConfiguration.footer.phone')}
                      value={formData.footerPhone}
                      onChange={(e) => setFormData({ ...formData, footerPhone: e.target.value })}
                      placeholder={t('siteConfiguration.footer.phonePlaceholder')}
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('siteConfiguration.footer.address')}
                      </label>
                      <textarea
                        value={formData.footerAddress}
                        onChange={(e) => setFormData({ ...formData, footerAddress: e.target.value })}
                        placeholder={t('siteConfiguration.footer.addressPlaceholder')}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">{t('siteConfiguration.footer.menuSettings')}</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    {t('siteConfiguration.footer.menuSettingsDescription')}
                  </p>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {publicMenus.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">{t('siteConfiguration.footer.noPublicMenus')}</p>
                    ) : (
                      publicMenus.map((menu) => (
                        <div
                          key={menu.code}
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            id={`menu-${menu.code}`}
                            checked={selectedFooterMenus.has(menu.code)}
                            onChange={() => toggleFooterMenu(menu.code)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`menu-${menu.code}`}
                            className="flex-1 text-sm font-medium text-gray-700 cursor-pointer"
                          >
                            {menu.name?.tr || menu.code}
                          </label>
                          {menu.icon && (
                            <span className="text-gray-400 text-sm">{menu.icon}</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('siteConfiguration.actions.title')}</h2>
              <div className="space-y-3">
                <Button 
                  onClick={handleSave} 
                  fullWidth 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? t('siteConfiguration.actions.saving') : t('siteConfiguration.actions.save')}
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">{t('siteConfiguration.logos.tips.title')}</h3>
              {activeTab === 'logos' && (
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>{t('siteConfiguration.logos.tips.headerLogo')}</li>
                  <li>{t('siteConfiguration.logos.tips.footerLogo')}</li>
                  <li>{t('siteConfiguration.logos.tips.format')}</li>
                  <li>{t('siteConfiguration.logos.tips.size')}</li>
                </ul>
              )}
              {activeTab === 'header' && (
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>{t('siteConfiguration.header.tips.topBanner')}</li>
                  <li>{t('siteConfiguration.header.tips.multiLanguage')}</li>
                  <li>{t('siteConfiguration.header.tips.colors')}</li>
                  <li>{t('siteConfiguration.header.tips.headerPhone')}</li>
                </ul>
              )}
              {activeTab === 'footer' && (
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>{t('siteConfiguration.footer.tips.contactInfo')}</li>
                  <li>{t('siteConfiguration.footer.tips.publicMenus')}</li>
                  <li>{t('siteConfiguration.footer.tips.selectedMenus')}</li>
                  <li>{t('siteConfiguration.footer.tips.unlimited')}</li>
                </ul>
              )}
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
          alt="Logo"
          onClose={() => setLightbox({ isOpen: false, imageUrl: '' })}
        />
      </Container>
    </Section>
  );
}
