'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Shield } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Toast from '../../components/Toast';
import { userGroupService, userRoleService } from '../../services/admin.service';

interface UserGroupFormProps {
  id?: string;
}

export default function UserGroupForm({ id }: UserGroupFormProps) {
  const router = useRouter();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    code: '',
    description: {
      tr: '',
      en: '',
      de: '',
      fr: '',
      es: '',
      it: ''
    },
    selectedRoles: [] as string[]
  });

  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

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
    loadAvailableRoles();
    if (isEdit) {
      loadUserGroup();
    }
  }, [isEdit, id]);

  const loadAvailableRoles = async () => {
    try {
      const response = await userRoleService.getAll();
      if (response.status === 'SUCCESS' && response.data) {
        setAvailableRoles((response.data as any).data || response.data || []);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadUserGroup = async () => {
    if (!id) return;
    try {
      const response = await userGroupService.getByCode(id);
      if (response.status === 'SUCCESS' && response.data) {
        const data = (response.data as any).data || response.data;
        setFormData({
          id: data.id,
          code: data.code || '',
          description: data.description || { tr: '', en: '', de: '', fr: '', es: '', it: '' },
          selectedRoles: data.userRoles?.map((r: any) => r.code) || []
        });
      }
    } catch (error) {
      console.error('Error loading user group:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const payload = {
        ...(formData.id && { id: formData.id }),
        code: formData.code,
        description: formData.description,
        userRoles: formData.selectedRoles.map(code => ({ code }))
      };

      console.log('Saving user group with payload:', payload);
      const response = await userGroupService.save(payload);
      console.log('Save response:', response);
      
      if (response.status === 'SUCCESS') {
        setToast({ message: isEdit ? 'Rol güncellendi' : 'Rol eklendi', type: 'success' });
        setTimeout(() => {
          router.push('/admin/user-groups');
        }, 1000);
      } else {
        setToast({ message: response.errorMessage || 'Kaydetme işlemi başarısız oldu', type: 'error' });
      }
    } catch (error: any) {
      console.error('Error saving user group:', error);
      setToast({ message: error.message || 'Kaydetme sırasında bir hata oluştu', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (roleCode: string) => {
    setFormData(prev => ({
      ...prev,
      selectedRoles: prev.selectedRoles.includes(roleCode)
        ? prev.selectedRoles.filter(code => code !== roleCode)
        : [...prev.selectedRoles, roleCode]
    }));
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/user-groups')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri Dön
        </Button>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {isEdit ? 'Rol Düzenle' : 'Yeni Rol Ekle'}
        </h1>
        <p className="text-gray-600">Kullanıcı grubu bilgilerini girin</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Temel Bilgiler</h2>
              
              <div className="space-y-4">
                <Input
                  label="Kod *"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="ADMIN_GROUP"
                  required
                />

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Açıklama *</label>
                    <button
                      type="button"
                      onClick={() => toggleField('description')}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                      <span className="text-base">{expandedFields.has('description') ? '🌐' : '🌍'}</span>
                      <span>Diğer Diller</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">5</span>
                      <span className="text-gray-400">{expandedFields.has('description') ? '▼' : '▶'}</span>
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <Textarea
                      placeholder="🇹🇷 Türkçe"
                      value={formData.description.tr}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        description: { ...formData.description, tr: e.target.value }
                      })}
                      rows={3}
                      required
                    />
                    
                    {expandedFields.has('description') && (
                      <div className="space-y-3 pt-3 border-t border-gray-200">
                        <Textarea
                          placeholder="🇬🇧 English"
                          value={formData.description.en}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            description: { ...formData.description, en: e.target.value }
                          })}
                          rows={3}
                        />
                        <Textarea
                          placeholder="🇩🇪 Deutsch"
                          value={formData.description.de}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            description: { ...formData.description, de: e.target.value }
                          })}
                          rows={3}
                        />
                        <Textarea
                          placeholder="🇫🇷 Français"
                          value={formData.description.fr}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            description: { ...formData.description, fr: e.target.value }
                          })}
                          rows={3}
                        />
                        <Textarea
                          placeholder="🇪🇸 Español"
                          value={formData.description.es}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            description: { ...formData.description, es: e.target.value }
                          })}
                          rows={3}
                        />
                        <Textarea
                          placeholder="🇮🇹 Italiano"
                          value={formData.description.it}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            description: { ...formData.description, it: e.target.value }
                          })}
                          rows={3}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Yetkiler
              </h2>
              
              <div className="space-y-2">
                {availableRoles.map((role) => (
                  <label
                    key={role.code}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedRoles.includes(role.code)}
                      onChange={() => toggleRole(role.code)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{role.code}</div>
                      <div className="text-sm text-gray-600">{role.description?.tr || role.description?.en}</div>
                    </div>
                  </label>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">İşlemler</h2>
              
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/user-groups')}
                  className="w-full"
                >
                  İptal
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Bilgi</h3>
              <p className="text-sm text-blue-800">
                Roller (User Groups), kullanıcıları gruplandırarak toplu yetki ataması yapmanızı sağlar.
              </p>
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
    </div>
  );
}
