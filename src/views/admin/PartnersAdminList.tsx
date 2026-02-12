'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';

export default function PartnersAdminList() {
  const t = useTranslations();
  const router = useRouter();
  const { partners, deletePartner } = useStore();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const handleDelete = (id: string) => {
    if (confirm('Bu partneri silmek istediğinizden emin misiniz?')) {
      deletePartner(id);
      setToast({ message: 'Partner başarıyla silindi!', type: 'success' });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Partnerler
          </h1>
          <p className="text-gray-600">İş ortaklarınızı yönetin</p>
        </div>
        <Button
          onClick={() => router.push('/admin/partners/new')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Yeni Partner
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {partners.map((partner) => (
          <Card key={partner.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center h-24 mb-4 bg-gray-50 rounded">
              {partner.logo && (
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-w-full max-h-full object-contain p-2"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>
            <p className="text-center text-sm text-gray-600 mb-3 truncate">{partner.name}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/admin/partners/${partner.id}`)}
                className="flex-1 flex items-center justify-center border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(partner.id)}
                className="flex items-center justify-center border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {partners.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">Henüz partner eklenmemiş</p>
          <Button onClick={() => router.push('/admin/partners/new')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            İlk Partneri Ekle
          </Button>
        </Card>
      )}

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
