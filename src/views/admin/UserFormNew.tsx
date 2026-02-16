'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, ArrowLeft, Search } from 'lucide-react';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Toast from '../../components/Toast';
import { userService, userGroupService } from '../../services/admin.service';

interface UserFormProps {
  userId?: string;
}

export default function UserFormNew({ userId }: UserFormProps) {
  const router = useRouter();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [loading, setLoading] = useState(false);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [filteredUserGroups, setFilteredUserGroups] = useState<any[]>([]);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  
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
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setToast({ message: 'Kullanıcı yüklenirken hata oluştu', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.username.trim()) {
      setToast({ message: 'Kullanıcı adı zorunludur', type: 'error' });
      return;
    }

    if (!isEditing && !formData.definedPassword.trim()) {
      setToast({ message: 'Şifre zorunludur', type: 'error' });
      return;
    }

    if (formData.definedPassword && formData.definedPassword !== formData.confirmPassword) {
      setToast({ message: 'Şifreler eşleşmiyor', type: 'error' });
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
        userGroups: formData.userGroups.map(code => ({ code }))
      };

      const response = await userService.save(userData);

      if (response.status === 'ERROR') {
        setToast({ 
          message: response.errorMessage || 'Kullanıcı kaydedilirken hata oluştu', 
          type: 'error' 
        });
        return;
      }

      setToast({ 
        message: isEditing ? 'Kullanıcı güncellendi' : 'Kullanıcı eklendi', 
        type: 'success' 
      });

      setTimeout(() => {
        router.push('/admin/users');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving user:', error);
      setToast({ 
        message: error.message || 'Beklenmeyen bir hata oluştu', 
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

  const toggleUserGroup = (code: string) => {
    setFormData(prev => ({
      ...prev,
      userGroups: prev.userGroups.includes(code)
        ? prev.userGroups.filter(c => c !== code)
        : [...prev.userGroups, code]
    }));
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
            Geri
          </Button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isEditing ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Kullanıcı Bilgileri</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kullanıcı Adı <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Kullanıcı adı"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={isEditing}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad
                    </label>
                    <Input
                      placeholder="Ad"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Soyad
                    </label>
                    <Input
                      placeholder="Soyad"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta
                  </label>
                  <Input
                    type="email"
                    placeholder="ornek@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <Input
                    placeholder="+90 555 123 45 67"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isEditing ? 'Yeni Şifre (Değiştirmek için doldurun)' : 'Şifre'} {!isEditing && <span className="text-red-500">*</span>}
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
                      Şifre Tekrar <span className="text-red-500">*</span>
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
                      Kullanıcı Grupları
                    </label>
                    {formData.userGroups.length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                        {formData.userGroups.length} seçili
                      </span>
                    )}
                  </div>
                  
                  {/* Search */}
                  <div className="p-3 border-b border-gray-200 bg-white">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Grup ara..."
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
                          {groupSearchQuery ? 'Arama sonucu bulunamadı' : 'Kullanıcı grubu bulunamadı'}
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
                                {group.description?.tr || group.description?.en || group.name?.tr || group.name?.en || group.code}
                              </span>
                              {group.description?.en && group.description?.tr !== group.description?.en && (
                                <span className="ml-2 text-xs text-gray-500">
                                  ({group.description.en})
                                </span>
                              )}
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
              <h2 className="text-xl font-semibold mb-4">Durum</h2>
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
                    Aktif
                  </label>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">İşlemler</h2>
              <div className="space-y-3">
                <Button 
                  onClick={handleSave} 
                  fullWidth 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/admin/users')} 
                  fullWidth
                  disabled={loading}
                >
                  <X className="w-4 h-4 mr-2" />
                  İptal
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
      </Container>
    </Section>
  );
}
