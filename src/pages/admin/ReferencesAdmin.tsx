'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Edit2, Trash2, Plus, Save, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';

export default function ReferencesAdmin() {
  const t = useTranslations();
  const { references } = useStore();
  const [editingRef, setEditingRef] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    active: true
  });

  const handleEdit = (ref: any) => {
    setEditingRef(ref);
    setFormData({
      name: ref.name,
      logo: ref.logo,
      active: ref.active
    });
  };

  const handleSave = () => {
    setToast({ message: 'Reference updated successfully!', type: 'success' });
    setEditingRef(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this reference?')) {
      setToast({ message: 'Reference deleted successfully!', type: 'success' });
    }
  };

  const handleAdd = () => {
    setToast({ message: 'Reference added successfully!', type: 'success' });
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      logo: '',
      active: true
    });
  };

  return (
    <Section>
      <Container>
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('admin.references')}
            </h1>
            <p className="text-gray-600">Manage company references</p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800"
          >
            <Plus className="w-5 h-5" />
            Add Reference
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {references.map((ref) => (
            <Card key={ref.id} className="p-6 relative group">
              <div className="flex items-center justify-center h-24 mb-4">
                <img
                  src={ref.logo}
                  alt={ref.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <p className="text-center text-sm text-gray-600 mb-3">{ref.name}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(ref)}
                  className="flex-1 flex items-center justify-center gap-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(ref.id)}
                  className="flex items-center justify-center gap-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {editingRef && (
          <Modal isOpen={true} onClose={() => setEditingRef(null)} title="Edit Reference">
            <div className="space-y-4">
              <Input
                label="Company Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <Input
                label="Logo URL"
                value={formData.logo}
                onChange={(e) => setFormData({...formData, logo: e.target.value})}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="w-4 h-4 text-blue-900 border-gray-300 rounded focus:ring-blue-900"
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1 bg-blue-900 hover:bg-blue-800">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingRef(null)} className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {isAddModalOpen && (
          <Modal isOpen={true} onClose={() => setIsAddModalOpen(false)} title="Add New Reference">
            <div className="space-y-4">
              <Input
                label="Company Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Company Inc."
              />
              <Input
                label="Logo URL"
                value={formData.logo}
                onChange={(e) => setFormData({...formData, logo: e.target.value})}
                placeholder="https://example.com/logo.png"
              />
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAdd} className="flex-1 bg-blue-900 hover:bg-blue-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Reference
                </Button>
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        )}

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
