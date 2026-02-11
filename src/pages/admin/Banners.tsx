import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Toast from '../../components/Toast';

export default function Banners() {
  const { t } = useTranslation();
  const { banners, addBanner, updateBanner, deleteBanner } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    titleKey: '',
    subtitleKey: '',
    buttonTextKey: '',
    buttonLink: '',
    image: '',
    order: 0,
    active: true
  });

  const openAddModal = () => {
    setEditingBanner(null);
    setFormData({
      titleKey: '',
      subtitleKey: '',
      buttonTextKey: '',
      buttonLink: '',
      image: '',
      order: banners.length + 1,
      active: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (banner: any) => {
    setEditingBanner(banner);
    setFormData({
      titleKey: banner.titleKey,
      subtitleKey: banner.subtitleKey,
      buttonTextKey: banner.buttonTextKey || '',
      buttonLink: banner.buttonLink || '',
      image: banner.image,
      order: banner.order,
      active: banner.active
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingBanner) {
      updateBanner(editingBanner.id, formData);
      setToast({ message: 'Banner updated successfully!', type: 'success' });
    } else {
      const newBanner = {
        ...formData,
        id: Date.now().toString()
      };
      addBanner(newBanner as any);
      setToast({ message: 'Banner added successfully!', type: 'success' });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      deleteBanner(id);
      setToast({ message: 'Banner deleted successfully!', type: 'success' });
    }
  };

  return (
    <Section>
      <Container>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('admin.banners')}
            </h1>
            <p className="text-gray-600">Manage homepage banners</p>
          </div>
          <Button onClick={openAddModal} className="bg-blue-900 hover:bg-blue-800">
            <Plus className="w-5 h-5 mr-2" />
            Add Banner
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {banners.sort((a, b) => a.order - b.order).map((banner) => (
            <Card key={banner.id} className="p-6">
              <div className="flex items-center gap-4">
                <img
                  src={banner.image}
                  alt={banner.titleKey}
                  className="w-32 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{banner.titleKey}</h3>
                  <p className="text-gray-600 text-sm">{banner.subtitleKey}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${banner.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {banner.active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-500">Order: {banner.order}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(banner)}
                    className="border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(banner.id)}
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingBanner ? 'Edit Banner' : 'Add Banner'}
          size="lg"
        >
          <div className="p-6 space-y-4">
            <Input
              label="Title Key (translation key)"
              value={formData.titleKey}
              onChange={(e) => setFormData({ ...formData, titleKey: e.target.value })}
              placeholder="banner.hero.title"
            />
            <Input
              label="Subtitle Key (translation key)"
              value={formData.subtitleKey}
              onChange={(e) => setFormData({ ...formData, subtitleKey: e.target.value })}
              placeholder="banner.hero.subtitle"
            />
            <Input
              label="Button Text Key (optional)"
              value={formData.buttonTextKey}
              onChange={(e) => setFormData({ ...formData, buttonTextKey: e.target.value })}
              placeholder="banner.hero.button"
            />
            <Input
              label="Button Link (optional)"
              value={formData.buttonLink}
              onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
              placeholder="/products"
            />
            <Input
              label="Image URL"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
            <Input
              label="Order"
              type="number"
              value={formData.order.toString()}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} fullWidth className="bg-blue-900 hover:bg-blue-800">
                Save
              </Button>
              <Button variant="outline" onClick={() => setIsModalOpen(false)} fullWidth>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

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
