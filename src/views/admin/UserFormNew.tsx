'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Save, X, ArrowLeft, Search } from 'lucide-react';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Toast from '../../components/Toast';
import ImageUpload from '../../components/ImageUpload';
import ImageLightbox from '../../components/ImageLightbox';
import { userService, userGroupService, languageService } from '../../services/admin.service';
import { getLocalizedText, type SupportedLocale } from '../../lib/i18n-utils';

interface UserFormProps {
  userId?: string;
}

export default function UserFormNew({ userId }: UserFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale() as SupportedLocale;
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [loading, setLoading] = useState(false);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [filteredUserGroups, setFilteredUserGroups] = useState<any[]>([]);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [languages, setLanguages] = useState<any[]>([]);
  const [languageSearchQuery, setLanguageSearchQuery] = useState('');
  const [filteredLanguages, setFilteredLanguages] = useState<any[]>([]);
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>('');
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [newPictureFile, setNewPictureFile] = useState<File | null>(null);
  const [shouldRemovePicture, setShouldRemovePicture] = useState(false);
  const [lightbox, setLightbox] = useState<{ isOpen: boolean; imageUrl: string }>({
    isOpen: false,
    imageUrl: ''
  });
  
  const isEditing = !!userId;

  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    code: '',
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    definedPassword: '',
    confirmPassword: '',
    active: true,
    userGroups: [] as string[]
  });

  useEffect(() => {
    loadUserGroups();
    loadLanguages();
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const loadUserGroups = async () => {
    try {
      const response = await userGroupService.getAll();
      if (response.status === 'SUCCESS' && response.data) {
        const groupsData = (response.data as any).data || response.data;
        const groups = Array.isArray(groupsData) ? groupsData : [];
        setUserGroups(groups);
        setFilteredUserGroups(groups);
      }
    } catch (error) {
      console.error('Error loading user groups:', error);
    }
  };

  const loadLanguages = async () => {
    try {
      const response = await languageService.getAll();
      if (response.status === 'SUCCESS' && response.data) {
        const languagesData = (response.data as any).data || response.data;
        const langs = Array.isArray(languagesData) ? languagesData : [];
        setLanguages(langs);
        setFilteredLanguages(langs);
      }
    } catch (error) {
      console.error('Error loading languages:', error);
    }
  };

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await userService.getByCode(userId!);
      
      if (response.status === 'SUCCESS' && response.data) {
        const userData = (response.data as any).data || response.data;
        
        setFormData({
          id: userData.id,
          code: userData.code,
          username: userData.username,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          definedPassword: '',
          confirmPassword: '',
          active: userData.active ?? true,
          userGroups: userData.userGroups?.map((ug: any) => ug.code) || []
        });
        
        // Dil bilgisini set et
        if (userData.language?.code) {
          setSelectedLanguageCode(userData.language.code);
        }
        
        // Mevcut profil resmini göster
        if (userData.picture?.absolutePath) {
          setImageFiles([userData.picture.absolutePath]);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setToast({ message: t('userForm.loadError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.username.trim()) {
      setToast({ message: t('userForm.usernameRequired'), type: 'error' });
      return;
    }

    if (!isEditing && !formData.definedPassword.trim()) {
      setToast({ message: t('userForm.passwordRequired'), type: 'error' });
      return;
    }

    if (formData.definedPassword && formData.definedPassword !== formData.confirmPassword) {
      setToast({ message: t('userForm.passwordMismatch'), type: 'error' });
      return;
    }

    try {
      setLoading(true);

      const userData = {
        ...(formData.id && { id: formData.id }),
        code: formData.code || undefined,
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        active: formData.active,
        ...(formData.definedPassword && { definedPassword: formData.definedPassword }),
        userGroups: formData.userGroups.map(code => ({ code })),
        ...(selectedLanguageCode && { language: { code: selectedLanguageCode } })
      };

      const response = await userService.save(userData, newPictureFile || undefined, shouldRemovePicture);

      if (response.status === 'ERROR') {
        setToast({ 
          message: response.errorMessage || t('userForm.saveError'), 
          type: 'error' 
        });
        return;
      }

      setToast({ 
        message: isEditing ? t('userForm.updateSuccess') : t('userForm.createSuccess'), 
        type: 'success' 
      });

      setTimeout(() => {
        router.push('/admin/users');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving user:', error);
      setToast({ 
        message: error.message || t('userForm.unexpectedError'), 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter user groups based on search query
  const handleUserGroupSearch = (term: string) => {
    setGroupSearchQuery(term);
    
    if (!term) {
      setFilteredUserGroups(userGroups);
      return;
    }
    
    const filtered = userGroups.filter(group => {
      const searchLower = term.toLowerCase();
      const nameTr = group.name?.tr?.toLowerCase() || '';
      const nameEn = group.name?.en?.toLowerCase() || '';
      const descTr = group.description?.tr?.toLowerCase() || '';
      const descEn = group.description?.en?.toLowerCase() || '';
      const code = group.code?.toLowerCase() || '';
      
      return nameTr.includes(searchLower) || 
             nameEn.includes(searchLower) || 
             descTr.includes(searchLower) || 
             descEn.includes(searchLower) || 
             code.includes(searchLower);
    });
    
    setFilteredUserGroups(filtered);
  };

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isLanguageDropdownOpen && !target.closest('.language-dropdown-container')) {
        setIsLanguageDropdownOpen(false);
        setLanguageSearchQuery('');
        setFilteredLanguages(languages);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLanguageDropdownOpen, languages]);

  const handleImageChange = (images: string[]) => {
    setImageFiles(images);
    
    if (images.length === 0) {
      setNewPictureFile(null);
      setShouldRemovePicture(true);
    } else if (images[0].startsWith('data:')) {
      setShouldRemovePicture(false);
      fetch(images[0])
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' });
          setNewPictureFile(file);
        });
    } else {
      // Mevcut resim korunuyor
      setShouldRemovePicture(false);
    }
  };

  const toggleUserGroup = (code: string) => {
    setFormData(prev => ({
      ...prev,
      userGroups: prev.userGroups.includes(code)
        ? prev.userGroups.filter(c => c !== code)
        : [...prev.userGroups, code]
    }));
  };

  const getSelectedLanguageName = () => {
    if (!selectedLanguageCode) return t('userForm.selectLanguage');
    const lang = languages.find(l => l.code === selectedLanguageCode);
    return getLocalizedText(lang?.name, locale) || selectedLanguageCode;
  };

  const getGroupDisplayName = (group: any) => {
    return getLocalizedText(group.description, locale) || 
           getLocalizedText(group.name, locale) || 
           group.code;
  };

  return (
    <Section>
      <Container>
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/users')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isEditing ? t('userForm.editUser') : t('userForm.newUser')}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('userForm.userInfo')}</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('userForm.username')} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder={t('userForm.usernamePlaceholder')}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={isEditing}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('userForm.firstName')}
                    </label>
                    <Input
                      placeholder={t('userForm.firstNamePlaceholder')}
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('userForm.lastName')}
                    </label>
                    <Input
                      placeholder={t('userForm.lastNamePlaceholder')}
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('userForm.email')}
                  </label>
                  <Input
                    type="email"
                    placeholder={t('userForm.emailPlaceholder')}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('userForm.phone')}
                  </label>
                  <Input
                    placeholder={t('userForm.phonePlaceholder')}
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>

                <div className="relative language-dropdown-container">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('userForm.language')}
                  </label>
                  
                  {/* Dropdown Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                    className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between hover:border-gray-400 transition-colors"
                  >
                    <span className={selectedLanguageCode ? 'text-gray-900' : 'text-gray-500'}>
                      {getSelectedLanguageName()}
                    </span>
                    <Search className="w-5 h-5 text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {isLanguageDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                      {/* Search Input */}
                      <div className="p-3 border-b border-gray-200 bg-gray-50">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder={t('userForm.searchLanguage')}
                            value={languageSearchQuery}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                            onChange={(e) => {
                              const query = e.target.value;
                              setLanguageSearchQuery(query);
                              
                              if (!query) {
                                setFilteredLanguages(languages);
                                return;
                              }
                              
                              const filtered = languages.filter(lang => {
                                const searchLower = query.toLowerCase();
                                const nameTr = lang.name?.tr?.toLowerCase() || '';
                                const nameEn = lang.name?.en?.toLowerCase() || '';
                                const code = lang.code?.toLowerCase() || '';
                                
                                return nameTr.includes(searchLower) || 
                                       nameEn.includes(searchLower) || 
                                       code.includes(searchLower);
                              });
                              
                              setFilteredLanguages(filtered);
                            }}
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Language List */}
                      <div className="max-h-64 overflow-y-auto">
                        {filteredLanguages.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-500 text-sm">
                            {languageSearchQuery ? t('userForm.noSearchResults') : t('userForm.noLanguagesFound')}
                          </div>
                        ) : (
                          filteredLanguages.map(lang => (
                            <button
                              key={lang.code}
                              type="button"
                              onClick={() => {
                                setSelectedLanguageCode(lang.code);
                                setIsLanguageDropdownOpen(false);
                                setLanguageSearchQuery('');
                                setFilteredLanguages(languages);
                              }}
                              className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0 ${
                                selectedLanguageCode === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                              }`}
                            >
                              <span className="text-sm flex-1">
                                {getLocalizedText(lang.name, locale) || lang.code}
                              </span>
                              {selectedLanguageCode === lang.code && (
                                <span className="text-blue-600 font-bold">✓</span>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isEditing ? t('userForm.newPassword') : t('userForm.password')} {!isEditing && <span className="text-red-500">*</span>}
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.definedPassword}
                    onChange={(e) => setFormData({ ...formData, definedPassword: e.target.value })}
                  />
                </div>

                {formData.definedPassword && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('userForm.confirmPassword')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                  </div>
                )}

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {t('userForm.userGroups')}
                    </label>
                    {formData.userGroups.length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                        {t('userForm.groupsSelected', { count: formData.userGroups.length })}
                      </span>
                    )}
                  </div>
                  
                  {/* Search */}
                  <div className="p-3 border-b border-gray-200 bg-white">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder={t('userForm.searchGroup')}
                        value={groupSearchQuery}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        onChange={(e) => handleUserGroupSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {filteredUserGroups.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          {groupSearchQuery ? t('userForm.noSearchResults') : t('userForm.noGroupsFound')}
                        </p>
                      ) : (
                        filteredUserGroups.map(group => (
                          <label 
                            key={group.code} 
                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                              formData.userGroups.includes(group.code)
                                ? 'bg-blue-50 border-2 border-blue-200'
                                : 'border-2 border-transparent hover:bg-gray-50 hover:border-gray-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.userGroups.includes(group.code)}
                              onChange={() => toggleUserGroup(group.code)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="ml-3 flex-1">
                              <span className="text-sm font-medium text-gray-900">
                                {getGroupDisplayName(group)}
                              </span>
                            </div>
                            {formData.userGroups.includes(group.code) && (
                              <span className="text-blue-600 font-bold">✓</span>
                            )}
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('userForm.profilePicture')}</h2>
              <div className="flex flex-col items-center">
                {imageFiles.length > 0 ? (
                  <div className="relative group mb-4">
                    <img
                      src={imageFiles[0]}
                      alt={t('userForm.profilePictureAlt')}
                      className="w-32 h-32 rounded-full object-cover border-2 border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setLightbox({ isOpen: true, imageUrl: imageFiles[0] })}
                    />
                    <button
                      type="button"
                      onClick={() => handleImageChange([])}
                      className="absolute top-0 right-0 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 mb-4">
                    <span className="text-4xl text-gray-400">👤</span>
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        handleImageChange([reader.result as string]);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  id="profile-picture-upload"
                />
                <label
                  htmlFor="profile-picture-upload"
                  className="cursor-pointer px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {imageFiles.length > 0 ? t('userForm.changePicture') : t('userForm.uploadPicture')}
                </label>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {t('userForm.pictureSize')}
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('userForm.status')}</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700">
                    {t('userForm.active')}
                  </label>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('userForm.actions')}</h2>
              <div className="space-y-3">
                <Button 
                  onClick={handleSave} 
                  fullWidth 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? t('userForm.saving') : t('common.save')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/admin/users')} 
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
          alt={t('userForm.profilePictureAlt')}
          onClose={() => setLightbox({ isOpen: false, imageUrl: '' })}
        />
      </Container>
    </Section>
  );
}
